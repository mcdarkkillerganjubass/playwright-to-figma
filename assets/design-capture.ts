export type CaptureObservations = Record<string, {
    backendNodeId: number;
    controlText?: {text: string; x: number; y: number; width: number; height: number}[];
    fonts?: string[];
    pseudos?: Record<string, {x: number; y: number; width: number; height: number; styles: Record<string, string>}>;
    paintOrder?: number;
}>;

/** Browser-side capture; Chromium observations are supplied by capturePageDesign. */
export async function captureDesign(observations: CaptureObservations | void = undefined) {
    type Color = {r: number; g: number; b: number; a: number};
    type Layer = {
        key: string; parent: string | null; kind: 'frame' | 'text' | 'svg'; name: string;
        x: number; y: number; width: number; height: number; opacity: number;
        fills: Color[]; clips?: boolean; radii?: number[];
        borders?: {side: string; width: number; color: Color}[];
        text?: string; font?: {family: string; families: string[]; actualFamilies?: string[]; weight: number; italic: boolean; size: number};
        typography?: {lineHeight: number | null; letterSpacing: number; align: string; decoration: string; direction: string};
        source?: {path: string; pseudo?: string; backendNodeId?: number; paintOrder?: number};
        svg?: string;
        effects?: {type: 'DROP_SHADOW' | 'INNER_SHADOW'; color: Color; offset: {x: number; y: number}; radius: number; spread: number; visible: boolean; blendMode: 'NORMAL'}[];
    };
    const measuredNodes = observations || {};
    const layers: Layer[] = [];
    const warnings: string[] = [];
    const unstableKeys: string[] = [];
    const keys = new Set<string>();
    const svgJobs: Promise<void>[] = [];
    function sourcePath(element: Element): string {
        const indices: number[] = [];
        for (let e = element; e.parentElement; e = e.parentElement) indices.unshift(Array.from(e.parentElement.children).indexOf(e));
        return indices.join('/');
    }
    const color = (value: string): Color | null => {
        const values = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
        if (!values) return null;
        return {r: +values[1] / 255, g: +values[2] / 255, b: +values[3] / 255, a: values[4] === undefined ? 1 : +values[4]};
    };
    const paint = (value: string) => {
        const c = color(value);
        return c && c.a > 0 ? [c] : [];
    };
    const bounds = (r: DOMRect) => ({x: r.x, y: r.y, width: r.width, height: r.height});
    function add(layer: Layer) {
        if (keys.has(layer.key)) throw new Error(`Duplicate design key: ${layer.key}`);
        keys.add(layer.key);
        layers.push(layer);
    }
    function mask(layer: Layer, style: CSSStyleDeclaration) {
        const url = style.maskImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!url) return false;
        if (new URL(url, location.href).hash && new URL(url, location.href).origin === location.origin &&
            new URL(url, location.href).pathname === location.pathname) {
            warnings.push(`${layer.key}: document-fragment mask is not converted`); return false;
        }
        layer.kind = 'svg';
        svgJobs.push((async () => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Cannot load icon for ${layer.key}`);
            const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
            const svg = doc.documentElement;
            if (svg.tagName !== 'svg') {
                layer.kind = 'frame'; layer.fills = [];
                warnings.push(`${layer.key}: mask resource did not return SVG`); return;
            }
            if (svg.querySelector('script, foreignObject, image') ||
                Array.from(svg.querySelectorAll('use')).some(n => !((n.getAttribute('href') || n.getAttribute('xlink:href') || '').startsWith('#')))) {
                throw new Error(`Unsupported SVG for ${layer.key}: ${svg.tagName}`);
            }
            const box = {...layer};
            if (style.maskOrigin === 'padding-box' || style.maskOrigin === 'content-box') {
                const extra = (side: string) => parseFloat(style.getPropertyValue(`border-${side}-width`)) +
                    (style.maskOrigin === 'content-box' ? parseFloat(style.getPropertyValue(`padding-${side}`)) : 0);
                const left = extra('left'), right = extra('right'), top = extra('top'), bottom = extra('bottom');
                box.x += left; box.y += top; box.width -= left+right; box.height -= top+bottom;
            }
            layer.x = box.x; layer.y = box.y;
            const viewBox = (svg.getAttribute('viewBox') || '').split(/[ ,]+/).map(Number);
            const intrinsicW = parseFloat(svg.getAttribute('width') || '') || viewBox[2] || layer.width;
            const intrinsicH = parseFloat(svg.getAttribute('height') || '') || viewBox[3] || layer.height;
            const length = (v: string, total: number) => v.endsWith('%') ? parseFloat(v) * total / 100 : parseFloat(v);
            const size = style.maskSize.trim().split(/\s+/);
            if (size[0] === 'contain' || size[0] === 'cover') {
                const scale = size[0] === 'contain' ? Math.min(box.width/intrinsicW,box.height/intrinsicH) : Math.max(box.width/intrinsicW,box.height/intrinsicH);
                layer.width = intrinsicW*scale; layer.height = intrinsicH*scale;
            } else {
                layer.width = size[0] && size[0] !== 'auto' ? length(size[0],box.width) : intrinsicW;
                layer.height = size[1] && size[1] !== 'auto' ? length(size[1],box.height) : layer.width*intrinsicH/intrinsicW;
            }
            const position = style.maskPosition.trim().split(/\s+/);
            const offset = (v: string | undefined, remaining: number) => !v || v === 'center' ? remaining/2 : v === 'right' || v === 'bottom' ? remaining : v === 'left' || v === 'top' ? 0 : length(v,remaining);
            layer.x += offset(position[0],box.width-layer.width); layer.y += offset(position[1],box.height-layer.height);
            if (![layer.x,layer.y,layer.width,layer.height].every(Number.isFinite) || layer.width <= 0 || layer.height <= 0) throw new Error(`Unsupported mask geometry for ${layer.key}`);
            for (const n of [svg, ...svg.querySelectorAll('*')]) {
                for (const attr of Array.from(n.attributes)) {
                    if (/^on/i.test(attr.name) || (/href/i.test(attr.name) && !attr.value.startsWith('#'))) n.removeAttribute(attr.name);
                }
                for (const prop of ['fill', 'stroke']) {
                    if (n.hasAttribute(prop) && n.getAttribute(prop) !== 'none') n.setAttribute(prop, style.backgroundColor);
                }
            }
            svg.setAttribute('fill', style.backgroundColor);
            svg.setAttribute('width', String(layer.width)); svg.setAttribute('height', String(layer.height));
            layer.svg = new XMLSerializer().serializeToString(svg);
        })());
        return true;
    }
    function effects(value: string): NonNullable<Layer['effects']> {
        if (value === 'none') return [];
        const result: NonNullable<Layer['effects']> = [];
        const pattern = /(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?(\s+inset)?/g;
        for (const m of value.matchAll(pattern)) {
            const c = color(m[1]);
            if (c) result.push({type: m[6] ? 'INNER_SHADOW' : 'DROP_SHADOW', color: c,
                offset: {x: +m[2], y: +m[3]}, radius: +m[4], spread: +(m[5] || 0), visible: true, blendMode: 'NORMAL'});
        }
        return result;
    }
    function text(parent: string, key: string, value: string, rect: DOMRect, style: CSSStyleDeclaration) {
        if (!value.trim() || rect.width <= 0 || rect.height <= 0) return;
        if (style.textTransform === 'uppercase') value = value.toUpperCase();
        if (style.textTransform === 'lowercase') value = value.toLowerCase();
        if (unstableKeys.includes(parent)) unstableKeys.push(key);
        const families = (style.fontFamily.match(/"[^"]*"|'[^']*'|[^,]+/g) || []).map(v => v.trim().replace(/^["']|["']$/g, ''));
        add({key, parent, kind: 'text', name: value.slice(0, 60), ...bounds(rect), opacity: 1,
            fills: paint(style.color), text: value,
            font: {family: families[0], families,
                weight: parseInt(style.fontWeight) || 400, italic: style.fontStyle !== 'normal', size: parseFloat(style.fontSize)},
            typography: {lineHeight: style.lineHeight === 'normal' ? null : parseFloat(style.lineHeight),
                letterSpacing: parseFloat(style.letterSpacing) || 0,
                align: ({center: 'CENTER', right: 'RIGHT', end: style.direction === 'rtl' ? 'LEFT' : 'RIGHT', justify: 'JUSTIFIED'} as Record<string,string>)[style.textAlign] || (style.direction === 'rtl' ? 'RIGHT' : 'LEFT'),
                decoration: style.textDecorationLine.includes('line-through') ? 'STRIKETHROUGH' : style.textDecorationLine.includes('underline') ? 'UNDERLINE' : 'NONE',
                direction: style.direction}});
    }
    // Range rectangles are font-metric boxes; retain CSS line-height separately.
    function textNode(node: Text, parent: string, key: string, style: CSSStyleDeclaration) {
        let line = '', rect: DOMRect | null = null, number = 0;
        const range = document.createRange();
        const flush = () => {
            if (rect) text(parent, `${key}/line-${number++}`, line, rect, style);
            line = ''; rect = null;
        };
        for (let i = 0; i < node.length; i++) {
            range.setStart(node, i); range.setEnd(node, i + 1);
            const r = range.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            if (rect && Math.abs(r.top - rect.top) > 1) flush();
            if (!rect) rect = new DOMRect(r.x, r.y, r.width, r.height);
            else rect = new DOMRect(Math.min(rect.x, r.x), rect.y, Math.max(rect.right, r.right) - Math.min(rect.x, r.x), Math.max(rect.height, r.height));
            line += node.data[i];
        }
        flush();
    }
    function walk(element: Element, parent: string, path: string) {
        if (['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE'].includes(element.tagName)) return;
        const s = getComputedStyle(element);
        if (s.display === 'none' || s.contentVisibility === 'hidden' || +s.opacity === 0) return;
        const r = element.getBoundingClientRect();
        const pathInDocument = sourcePath(element);
        const observation = measuredNodes[pathInDocument];
        const explicit = element.getAttribute('data-figma-id') || element.getAttribute('data-testid') ||
            (!/^(tui_|cdk-|ng-|:)/.test(element.id) ? element.id : '');
        const key = explicit ? `element:${explicit}` : path;
        let nextParent = parent;
        if (r.width > 0 && r.height > 0 && s.visibility === 'visible') {
            if (!explicit) unstableKeys.push(key);
            const name = element.getAttribute('aria-label') || explicit || element.tagName.toLowerCase();
            const layer: Layer = {key, parent, kind: 'frame', name, ...bounds(r), opacity: +s.opacity,
                source: {path: pathInDocument, paintOrder: observation?.paintOrder},
                fills: paint(s.backgroundColor), clips: s.overflowX !== 'visible' || s.overflowY !== 'visible',
                radii: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius]
                    .map(v => v.endsWith('%') ? Math.min(r.width, r.height) * parseFloat(v) / 100 : parseFloat(v) || 0),
                effects: effects(s.boxShadow),
                borders: ['Top', 'Right', 'Bottom', 'Left'].flatMap(side => {
                    const width = parseFloat(s.getPropertyValue(`border-${side.toLowerCase()}-width`));
                    const c = color(s.getPropertyValue(`border-${side.toLowerCase()}-color`));
                    return width && c && c.a ? [{side: side.toLowerCase(), width, color: c}] : [];
                })};
            if (element instanceof SVGSVGElement) {
                const clone = element.cloneNode(true) as SVGSVGElement;
                const originals = [element, ...element.querySelectorAll('*')];
                const copies = [clone, ...clone.querySelectorAll('*')];
                originals.forEach((original, i) => {
                    const computed = getComputedStyle(original);
                    for (const property of ['fill', 'stroke', 'stroke-width', 'opacity']) {
                        (copies[i] as SVGElement).style.setProperty(property, computed.getPropertyValue(property));
                    }
                });
                clone.setAttribute('width', String(r.width)); clone.setAttribute('height', String(r.height));
                layer.kind = 'svg'; layer.svg = new XMLSerializer().serializeToString(clone);
                add(layer); return;
            }
            if (mask(layer, s)) { add(layer); return; }
            add(layer); nextParent = key;
            const matrix = s.transform.match(/^matrix\(([^)]+)\)$/)?.[1].split(',').map(Number);
            if (s.transform !== 'none' && (!matrix || matrix[0] !== 1 || matrix[1] !== 0 || matrix[2] !== 0 || matrix[3] !== 1)) warnings.push(`${key}: non-translation transform is not converted`);
            if (s.clipPath !== 'none') warnings.push(`${key}: clip-path is not converted`);
            if (s.mixBlendMode !== 'normal') warnings.push(`${key}: blend mode is not converted`);
            if (s.fontVariationSettings !== 'normal') warnings.push(`${key}: explicit font variation axes are not converted`);
            if ((s.boxShadow !== 'none' && !layer.effects?.length) || s.filter !== 'none' || s.backdropFilter !== 'none') warnings.push(`${key}: shadow/filter is not converted`);
            if (s.backgroundImage !== 'none') warnings.push(`${key}: background image/gradient is not converted`);
            if (element.matches('img,canvas,video,iframe')) warnings.push(`${key}: media is not converted`);
            if (element.shadowRoot) warnings.push(`${key}: shadow DOM is not converted`);
            for (const pseudo of ['::before', '::after']) {
                const ps = getComputedStyle(element, pseudo);
                const measured = observation?.pseudos?.[pseudo];
                if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || +ps.opacity === 0) continue;
                const w = parseFloat(ps.width), h = parseFloat(ps.height);
                if ((!w || !h || (ps.position !== 'absolute' && ps.maskImage === 'none')) && !measured) {
                    warnings.push(`${key}${pseudo}: non-absolute pseudo-element is not converted`); continue;
                }
                const hasContent = !!element.textContent?.trim() || element.matches('tui-textfield');
                const inlineLeft = !hasContent ? (r.width - w) / 2 : pseudo === '::before'
                    ? parseFloat(s.paddingLeft) : r.width - w - parseFloat(s.paddingRight);
                const left = ps.position !== 'absolute' ? inlineLeft : ps.left !== 'auto' ? parseFloat(ps.left) : ps.right !== 'auto' ? r.width - w - parseFloat(ps.right) : 0;
                const top = ps.position !== 'absolute' ? (r.height - h) / 2 : ps.top !== 'auto' ? parseFloat(ps.top) : ps.bottom !== 'auto' ? r.height - h - parseFloat(ps.bottom) : 0;
                const p: Layer = {key: `${key}${pseudo}`, parent: key, kind: 'frame', name: pseudo, x: r.x + left, y: r.y + top,
                    width: w, height: h, opacity: +ps.opacity, fills: paint(ps.backgroundColor), source: {path: pathInDocument, pseudo},
                    radii: [ps.borderTopLeftRadius, ps.borderTopRightRadius, ps.borderBottomRightRadius, ps.borderBottomLeftRadius].map(v => parseFloat(v) || 0),
                    borders: [], effects: effects(ps.boxShadow)};
                if (measured) Object.assign(p, {x: measured.x, y: measured.y, width: measured.width, height: measured.height});
                if (p.width <= 0 || p.height <= 0) continue;
                if (mask(p, ps) || p.fills.length || p.effects?.length) {
                    if (!explicit) unstableKeys.push(p.key);
                    add(p);
                }
                if (p.kind === 'frame' && /^(["']).*\1$/.test(ps.content) && ps.content !== '""' && ps.content !== "''") {
                    if (!keys.has(p.key)) add(p);
                    text(p.key, `${p.key}/text`, ps.content.slice(1, -1), new DOMRect(p.x, p.y, p.width, p.height), ps);
                } else if (p.kind === 'frame' && ps.content !== '""' && ps.content !== "''" && ps.content !== 'none') warnings.push(`${key}${pseudo}: generated content is not converted`);
            }
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                if (element instanceof HTMLInputElement && ['checkbox', 'radio', 'range', 'color', 'file'].includes(element.type)) {
                    if (s.appearance !== 'none') warnings.push(`${key}: native control appearance is not converted`);
                } else {
                    const hidden = element instanceof HTMLInputElement && element.type === 'password';
                    const value = hidden ? '•'.repeat(element.value.length) : element.value || element.placeholder;
                    const x = r.x + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth);
                    const h = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2;
                    const top = parseFloat(s.borderTopWidth) + parseFloat(s.paddingTop);
                    const bottom = parseFloat(s.borderBottomWidth) + parseFloat(s.paddingBottom);
                    const y = r.y + top + (element instanceof HTMLTextAreaElement ? 0 : (r.height - top - bottom - h) / 2);
                    if (value.includes('\n')) warnings.push(`${key}: multiline control value is approximated`);
                    const fragments = !hidden && element.value ? observation?.controlText : undefined;
                    const style = !element.value && element.placeholder ? getComputedStyle(element, '::placeholder') : s;
                    if (fragments?.length && fragments.map(f => f.text).join('') === element.value) {
                        fragments.forEach((f, i) => text(key, i ? `${key}/value-${i}` : `${key}/value`, f.text, new DOMRect(f.x, f.y, f.width, f.height), style));
                    } else text(key, `${key}/value`, value, new DOMRect(x, y, r.width - (x - r.x) - parseFloat(s.paddingRight), h), style);
                }
                return;
            }
        }
        let textIndex = 0;
        const children = Array.from(element.childNodes);
        // shortcut: sibling z-index ordering only; nested stacking contexts need a paint-order model.
        children.sort((a, b) => {
            const z = (n: Node) => n instanceof Element ? parseInt(getComputedStyle(n).zIndex) || 0 : 0;
            return z(a) - z(b);
        });
        for (const node of children) {
            if (node instanceof Text && s.visibility === 'visible') textNode(node, nextParent, `${key}/text-${textIndex++}`, s);
            else if (node instanceof Element) walk(node, nextParent, `${key}/${node.tagName.toLowerCase()}-${Array.from(element.children).indexOf(node)}`);
        }
    }
    const background = paint(getComputedStyle(document.documentElement).backgroundColor);
    add({key: '$viewport', parent: null, kind: 'frame', name: 'Viewport', x: 0, y: 0,
        width: innerWidth, height: innerHeight, opacity: 1, fills: background.length ? background : [{r: 1, g: 1, b: 1, a: 1}], clips: true, radii: [], borders: []});
    walk(document.body, '$viewport', 'body');
    await Promise.all(svgJobs);
    // Empty, unpainted leaves have no visual representation to publish.
    const retained = new Set<string>();
    for (let i = layers.length - 1; i >= 0; i--) {
        const n = layers[i];
        if (n.key === '$viewport' || n.kind !== 'frame' || n.fills.length || n.borders?.length || n.effects?.length || retained.has(n.key)) {
            retained.add(n.key);
            if (n.parent) retained.add(n.parent);
        }
    }
    const sortedWarnings = [...new Set(warnings)].sort();
    const regions = Array.from(document.querySelectorAll('[data-figma-region]')).flatMap(element => {
        const r = element.getBoundingClientRect(), x = Math.max(0,Math.floor(r.x)), y = Math.max(0,Math.floor(r.y));
        const width = Math.min(innerWidth,Math.ceil(r.right))-x, height = Math.min(innerHeight,Math.ceil(r.bottom))-y;
        return width > 0 && height > 0 ? [{name:element.getAttribute('data-figma-region')!,x,y,width,height}] : [];
    });
    return {version: 2, converter: 'native-v2', viewport: {width: innerWidth, height: innerHeight},
        layers: layers.filter(n => retained.has(n.key)), warnings: sortedWarnings,
        regions,
        diagnostics: sortedWarnings.map(message => ({severity: message.includes('mask resource did not return SVG') ? 'approximation' : 'unsupported', message})),
        unstableKeys: unstableKeys.filter(k => retained.has(k))};
}
export type DesignCapture = Awaited<ReturnType<typeof captureDesign>>;

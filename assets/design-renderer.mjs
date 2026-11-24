/** Run inside use_figma with its $fig builder and figma globals supplied explicitly. */
export async function renderDesign({builder, figma, design, containerId, previous = null, fontMap = {}, fallbackFamily = 'Inter', verifiedKeys = [], strict = true, mapping = null}) {
    if (!((design?.version === 1 && design.converter === 'native-v1') || (design?.version === 2 && design.converter === 'native-v2')) || !Array.isArray(design.layers) || !design.layers.length) {
        throw new Error('Expected a supported native design capture');
    }
    if (strict && design.diagnostics?.some(d => d.severity === 'unsupported')) throw new Error('Unsupported rendering features; review capture diagnostics before publishing');
    const container = await figma.getNodeByIdAsync(containerId);
    if (!container || !['FRAME', 'SECTION'].includes(container.type)) throw new Error('Expected an existing trial frame or section');
    if (previous && (previous.containerId !== containerId || previous.converter !== design.converter)) throw new Error('Publication target or converter changed');
    const specs = new Map(), plans = new Map(), live = new Map(), fingerprints = new Map(), fonts = new Map(), svgResizes = new Map();
    const resolvedMappings = new Map(Object.entries(mapping?.layers || {}).filter(([, value]) => value?.component?.key));
    const layerMappings = new Map(Object.entries(mapping?.layers || {}));
    const mappedChildren = new Set();
    for (const [key] of resolvedMappings) {
        for (let parent = design.layers.find(layer => layer.key === key)?.parent; parent; parent = design.layers.find(layer => layer.key === parent)?.parent) {
            if (resolvedMappings.has(parent)) mappedChildren.add(key);
        }
    }
    const old = previous?.layers || {};
    if (!previous && container.children.length) throw new Error('First import requires an empty container');
    if (previous && !old.$viewport) throw new Error('Saved mapping is missing its viewport root');
    const orders = new Map(), oldOrders = new Map(), nextOrder = new Map();
    for (const [key, entry] of Object.entries(old)) {
        const index = nextOrder.get(entry.parent) || 0;
        oldOrders.set(key, entry.order ?? index); nextOrder.set(entry.parent, index + 1);
    }
    nextOrder.clear();
    const unstable = new Set(design.unstableKeys || []);
    const verified = new Set(verifiedKeys);
    const actualIds = new Set();
    const resolvedFonts = new Map(), substitutions = [];
    const available = design.version >= 2 ? (await figma.listAvailableFontsAsync()).map(f => f.fontName) : [];
    const weightOf = style => /thin/i.test(style) ? 100 : /extra.?light/i.test(style) ? 200 : /light/i.test(style) ? 300
        : /semi.?bold|demi/i.test(style) ? 600 : /extra.?bold|ultra.?bold/i.test(style) ? 800 : /black|heavy/i.test(style) ? 900
        : /bold/i.test(style) ? 700 : /medium/i.test(style) ? 500 : 400;
    function resolveFont(n) {
        const requested = `${n.font.family}:${n.font.weight}:${n.font.italic ? 'italic' : 'normal'}`;
        if (fontMap[requested]) return fontMap[requested];
        if (design.version === 1) return {family: n.font.family, style: n.font.italic ? 'Italic' : n.font.weight >= 600 ? 'Bold' : 'Regular'};
        const families = [...(n.font.actualFamilies || []), ...(n.font.families || [n.font.family]), fallbackFamily];
        for (const family of families) {
            const candidates = available.filter(f => f.family.toLowerCase() === family.toLowerCase());
            if (!candidates.length) continue;
            const chosen = [...candidates].sort((a,b) =>
                (Number(/condensed|expanded|narrow|wide/i.test(a.style)) - Number(/condensed|expanded|narrow|wide/i.test(b.style))) * 2000 +
                (Number(/italic|oblique/i.test(a.style) !== n.font.italic) - Number(/italic|oblique/i.test(b.style) !== n.font.italic)) * 1000 +
                Math.abs(weightOf(a.style) - n.font.weight) - Math.abs(weightOf(b.style) - n.font.weight) || a.style.localeCompare(b.style))[0];
            if (chosen.family !== n.font.family || weightOf(chosen.style) !== n.font.weight || /italic|oblique/i.test(chosen.style) !== n.font.italic) {
                const substitution = {requested, resolved: chosen};
                if (!substitutions.some(s => s.requested === requested)) substitutions.push(substitution);
            }
            return chosen;
        }
        throw new Error(`No available source or fallback font for ${requested}`);
    }
    const serialize = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
        ? Object.fromEntries(Object.keys(v).sort().map(key => [key, v[key]])) : v);
    const paints = colors => colors.map(({r, g, b, a}) => ({type: 'SOLID', color: {r, g, b}, opacity: a}));
    const isColor = c => c && ['r', 'g', 'b', 'a'].every(k => Number.isFinite(c[k]) && c[k] >= 0 && c[k] <= 1);
    // Validate the entire export and mapping before queuing any mutation.
    for (const n of design.layers) {
        if (!n || typeof n.key !== 'string' || !n.key || specs.has(n.key) ||
            !['frame', 'text', 'svg'].includes(n.kind) || typeof n.name !== 'string' ||
            !['x', 'y', 'width', 'height', 'opacity'].every(k => Number.isFinite(n[k])) ||
            n.width <= 0 || n.height <= 0 || n.opacity < 0 || n.opacity > 1 ||
            !Array.isArray(n.fills) || !n.fills.every(isColor)) throw new Error('Invalid design layer');
        if (n.parent !== null && specs.get(n.parent)?.kind !== 'frame') throw new Error(`Missing or non-frame parent: ${n.key}`);
        if (n.parent === null && (specs.size || n.key !== '$viewport' || n.kind !== 'frame')) throw new Error('Expected one viewport root');
        if (n.kind === 'text' && (typeof n.text !== 'string' || !n.font || typeof n.font.family !== 'string' ||
            !Number.isFinite(n.font.size) || n.font.size <= 0 || !Number.isFinite(n.font.weight))) throw new Error('Invalid text');
        if (n.typography && ((n.typography.lineHeight !== null && (!Number.isFinite(n.typography.lineHeight) || n.typography.lineHeight <= 0)) ||
            !Number.isFinite(n.typography.letterSpacing) || !['LEFT','RIGHT','CENTER','JUSTIFIED'].includes(n.typography.align) ||
            !['NONE','UNDERLINE','STRIKETHROUGH'].includes(n.typography.decoration))) throw new Error('Invalid typography');
        if (n.kind === 'svg' && (typeof n.svg !== 'string' || !n.svg.startsWith('<svg') ||
            /<(?:script|foreignObject|image)\b|\bon\w+\s*=|\bhref\s*=\s*["'](?!#)/i.test(n.svg))) throw new Error('Invalid or externally referenced SVG');
        if ((n.radii || []).some(v => !Number.isFinite(v) || v < 0) ||
            (n.borders || []).some(b => !['top','right','bottom','left'].includes(b.side) || !Number.isFinite(b.width) || b.width < 0 || !isColor(b.color))) throw new Error('Invalid box styles');
        if (n.borders?.some(b => JSON.stringify(b.color) !== JSON.stringify(n.borders[0].color))) throw new Error('Different border colors are not supported');
        if ((n.effects || []).some(e => !['DROP_SHADOW','INNER_SHADOW'].includes(e.type) || !isColor(e.color) ||
            !Number.isFinite(e.offset?.x) || !Number.isFinite(e.offset?.y) || !Number.isFinite(e.radius) || e.radius < 0 || !Number.isFinite(e.spread))) throw new Error('Invalid shadow');
        specs.set(n.key, n);
        orders.set(n.key, nextOrder.get(n.parent) || 0);
        nextOrder.set(n.parent, orders.get(n.key) + 1);
        const font = n.kind === 'text' ? resolveFont(n) : null;
        if (font) resolvedFonts.set(n.key, font);
        fingerprints.set(n.key, serialize([n, font]));
        if (font) fonts.set(JSON.stringify(font), font);
    }
    if (design.layers[0].width !== design.viewport.width || design.layers[0].height !== design.viewport.height) throw new Error('Viewport mismatch');
    for (const [key, entry] of Object.entries(old)) {
        if (actualIds.has(entry.id)) throw new Error('Duplicate mapped node ID');
        actualIds.add(entry.id);
        const node = await figma.getNodeByIdAsync(entry.id);
        const expected = entry.kind === 'text' ? 'TEXT' : entry.kind === 'instance' ? 'INSTANCE' : 'FRAME';
        if (!node || node.type !== expected || node.parent?.id !== (entry.parent === null ? containerId : old[entry.parent]?.id)) {
            throw new Error(`Missing, moved or incompatible mapped node: ${key}`);
        }
        live.set(key, node);
        if (specs.has(key) && (specs.get(key).kind !== entry.kind || specs.get(key).parent !== entry.parent)) throw new Error(`Layer kind or parent migration required: ${key}`);
        if (specs.has(key) && entry.kind === 'svg' && fingerprints.get(key) !== entry.fingerprint) {
            const before = JSON.parse(entry.fingerprint)[0], after = specs.get(key);
            const signature = svg => svg.slice(0,svg.indexOf('>')).replace(/\s(?:width|height)="[^"]*"/g,'') + svg.slice(svg.indexOf('>'));
            const viewBox = after.svg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[ ,]+/).map(Number);
            if (signature(before.svg) !== signature(after.svg) || !viewBox || viewBox.length !== 4 ||
                /preserveAspectRatio="(?!xMidYMid meet)[^"]*"/.test(after.svg) || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0) {
                throw new Error(`SVG asset migration required: ${key}`);
            }
            svgResizes.set(key,{before,after,viewBox});
        }
    }
    const changed = design.layers.filter(n => fingerprints.get(n.key) !== old[n.key]?.fingerprint || orders.get(n.key) !== oldOrders.get(n.key));
    const removed = Object.keys(old).filter(k => !specs.has(k));
    if (previous && (changed.some(n => unstable.has(n.key) && !verified.has(n.key)) || removed.some(k => !verified.has(k)))) {
        throw new Error('Verify ambiguous element keys before refreshing; positional DOM paths are not stable identity');
    }
    if (removed.some(key => (live.get(key).children || []).some(child => !actualIds.has(child.id)))) throw new Error('Refusing to delete a node containing unmapped content');
    const result = {containerId, converter: design.converter, layers: {}, writes: changed.length + removed.length,
        warnings: [...(design.warnings || []), ...(mapping?.warnings || [])], fontSubstitutions: [...Object.entries(fontMap), ...substitutions],
        designSystem: {profileId: mapping?.profileId || null, instances: 0, nativeFallbacks: 0}};
    if (!result.writes) return {...previous, writes: 0};
    // Fonts are preflighted before any node writes, including when updating existing text.
    await Promise.all([...fonts.values()].map(font => figma.loadFontAsync(font)));
    const assetHandle = (asset, kind) => {
        if (!asset?.key) return null;
        const getter = kind === 'variable' ? builder.getVar : builder.getStyle;
        return typeof getter === 'function' ? getter.call(builder, asset.key) : null;
    };
    const applyDesignSystemProperties = (layer, props) => {
        const resolved = layerMappings.get(layer.key);
        if (!resolved) return;
        if (resolved.textStyle) {
            const style = assetHandle(resolved.textStyle, 'style');
            if (style) props.textStyle = style;
            else result.warnings.push(`${layer.key}: text style binding unavailable; literal typography used`);
        }
        for (const [property, asset] of Object.entries(resolved.tokens || {})) {
            const variable = assetHandle(asset, 'variable');
            if (!variable) {
                result.warnings.push(`${layer.key}: token ${property} binding unavailable; literal value used`);
                continue;
            }
            if (property === 'fills' || property === 'fill' || property === 'color') {
                props.fills = [{type: 'SOLID', color: variable}];
            } else if (property === 'strokes' || property === 'stroke') {
                props.strokes = [{type: 'SOLID', color: variable}];
            } else if (property === 'cornerRadius' || property === 'radius') {
                props.cornerRadius = variable;
            } else if (property === 'opacity') {
                props.opacity = variable;
            } else {
                result.warnings.push(`${layer.key}: unsupported token property ${property}; literal value used`);
            }
        }
    };
    for (const n of design.layers) {
        if (mappedChildren.has(n.key)) continue;
        const parent = n.parent === null ? {x: 0, y: 0} : specs.get(n.parent);
        const props = {name: n.name, x: n.x - parent.x, y: n.y - parent.y, width: n.width, height: n.height, opacity: n.opacity};
        if (n.kind === 'frame') {
            Object.assign(props, {layoutMode: 'NONE', fills: paints(n.fills), clipsContent: !!n.clips,
                topLeftRadius: n.radii?.[0] || 0, topRightRadius: n.radii?.[1] || 0,
                bottomRightRadius: n.radii?.[2] || 0, bottomLeftRadius: n.radii?.[3] || 0,
                strokes: [], strokeWeight: 0, effects: n.effects || []});
            const borders = n.borders || [];
            if (borders.length) {
                props.strokes = paints([borders[0].color]); props.strokeAlign = 'INSIDE';
                for (const side of ['top', 'right', 'bottom', 'left']) props[`stroke${side[0].toUpperCase()}${side.slice(1)}Weight`] = borders.find(b=>b.side===side)?.width || 0;
            }
            const effects = (n.effects || []).filter(e => e.color.a > 0);
            const outlines = effects.filter(e => e.type === 'INNER_SHADOW' && e.radius === 0 && e.offset.x === 0 && e.offset.y === 0 && e.spread > 0 && e.spread < Math.min(n.width,n.height) / 2);
            if (design.version >= 2 && !borders.length && outlines.length === 1) {
                props.strokes = paints([outlines[0].color]); props.strokeWeight = outlines[0].spread; props.strokeAlign = 'INSIDE';
                props.effects = effects.filter(e => e !== outlines[0]);
            }
        } else if (n.kind === 'text') {
            const lineHeight = n.typography?.lineHeight;
            Object.assign(props, {characters: n.text, fontName: resolvedFonts.get(n.key),
                fontSize: n.font.size, fills: paints(n.fills), textAutoResize: 'WIDTH_AND_HEIGHT',
                lineHeight: design.version >= 2 && lineHeight === null ? {unit: 'AUTO'} : {unit: 'PIXELS', value: lineHeight || n.height},
                letterSpacing: {unit: 'PIXELS', value: n.typography?.letterSpacing || 0},
                textDecoration: n.typography?.decoration || 'NONE', textAlignHorizontal: n.typography?.align || 'LEFT', textAlignVertical: 'CENTER'});
        }
        applyDesignSystemProperties(n, props);
        const existing = old[n.key];
        const asset = resolvedMappings.get(n.key)?.component;
        const canInstance = !!asset && typeof builder.instance === 'function';
        const plan = existing ? builder.get(existing.id) : canInstance ? builder.instance(asset.key, {props: asset.props || {}, name: n.name}) : n.kind === 'text' ? builder.text(props) : n.kind === 'svg' ? builder.svg(n.svg, props) : builder.frame(props);
        if (canInstance) {
            plan.set(props);
            result.designSystem.instances++;
        } else if (asset) {
            result.designSystem.nativeFallbacks++;
            result.warnings.push(`${n.key}: Figma component mapping was resolved but builder has no instance support; native fallback used`);
        }
        if (existing && fingerprints.get(n.key) !== existing.fingerprint && !svgResizes.has(n.key)) plan.set(props);
        plans.set(n.key, plan);
        if (!existing) (n.parent === null ? builder.get(containerId) : plans.get(n.parent)).append(plan);
    }
    // Ordering is explicit, so inserting a new sibling preserves browser paint order.
    if (removed.length || design.layers.some(n => orders.get(n.key) !== oldOrders.get(n.key))) {
        for (const n of design.layers) {
            const parent = n.parent === null ? builder.get(containerId) : plans.get(n.parent);
            parent.addAt(orders.get(n.key), plans.get(n.key));
        }
    }
    // Delete children before their obsolete parents; retain all mapped live nodes.
    for (const key of removed.reverse()) builder.get(old[key].id).remove();
    await builder.done();
    for (const [key,{before,after,viewBox}] of svgResizes) {
        const node = live.get(key);
        const oldScale = Math.min(before.width/viewBox[2],before.height/viewBox[3]);
        const newScale = Math.min(after.width/viewBox[2],after.height/viewBox[3]);
        const factor = newScale/oldScale;
        // The builder has no SVG rescale operation; retain the imported tree and IDs.
        node.rescale(factor);
        const dx = (after.width-viewBox[2]*newScale)/2 - (before.width-viewBox[2]*oldScale)*factor/2;
        const dy = (after.height-viewBox[3]*newScale)/2 - (before.height-viewBox[3]*oldScale)*factor/2;
        for (const child of node.children) builder.get(child.id).set({x:child.x+dx,y:child.y+dy});
        const parent = specs.get(after.parent);
        builder.get(node.id).set({x:after.x-(parent?.x||0),y:after.y-(parent?.y||0),width:after.width,height:after.height});
    }
    if (svgResizes.size) await builder.done();
    for (const n of design.layers) {
        if (!plans.has(n.key)) continue;
        result.layers[n.key] = {id: plans.get(n.key).node.id, kind: resolvedMappings.has(n.key) && !mappedChildren.has(n.key) && typeof builder.instance === 'function' ? 'instance' : n.kind, parent: n.parent, order: orders.get(n.key), fingerprint: fingerprints.get(n.key)};
    }
    return result;
}

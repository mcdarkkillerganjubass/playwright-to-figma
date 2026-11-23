import type {Page} from '@playwright/test';
import {captureDesign, type CaptureObservations} from './design-capture';

/** Adds measured pseudo boxes and native control text from Chromium's rendered tree. */
export async function capturePageDesign(page: Page) {
    const browser = page.context().browser();
    if (browser?.browserType().name() !== 'chromium') throw new Error('Native-v2 capture requires Chromium');
    const session = await page.context().newCDPSession(page);
    try {
        await session.send('DOM.enable');
        await session.send('CSS.enable');
        const {root} = await session.send('DOM.getDocument', {depth: -1, pierce: true});
        const observations: CaptureObservations = {};
        const paths = new Map<number, string>();
        const frontendIds = new Map<string, number>();
        type Node = typeof root;
        const controls: {node: Node; path: string}[] = [];
        function visit(node: Node, path: string) {
            paths.set(node.backendNodeId, path);
            observations[path] = {backendNodeId: node.backendNodeId};
            frontendIds.set(path, node.nodeId);
            if (['INPUT','TEXTAREA'].includes(node.nodeName)) controls.push({node, path});
            (node.children || []).filter(n => n.nodeType === 1).forEach((child, index) => visit(child, path ? `${path}/${index}` : `${index}`));
        }
        const html = root.children?.find(n => n.nodeName === 'HTML');
        if (!html) throw new Error('Expected an HTML document');
        visit(html, '');
        const styles = ['content','font-family','font-size','font-weight','font-style','line-height','letter-spacing',
            'color','background-color','mask-image','mask-size','mask-position','mask-repeat','transform'];
        const snapshot = await session.send('DOMSnapshot.captureSnapshot', {computedStyles: styles, includePaintOrder: true, includeDOMRects: true});
        const document = snapshot.documents[0];
        if (snapshot.documents.length !== 1) throw new Error('Frame capture requires an explicit frame adapter');
        const {nodes, layout} = document;
        if (!nodes.backendNodeId || !nodes.parentIndex) throw new Error('Incomplete Chromium snapshot');
        const pseudoTypes = new Map((nodes.pseudoType?.index || []).map((index, i) => [index, snapshot.strings[nodes.pseudoType!.value[i]]]));
        for (let i = 0; i < layout.nodeIndex.length; i++) {
            const ni = layout.nodeIndex[i], backend = nodes.backendNodeId[ni];
            const path = paths.get(backend);
            if (path !== undefined) observations[path].paintOrder = layout.paintOrders?.[i];
            const pseudo = pseudoTypes.get(ni);
            if (!pseudo || !['before','after'].includes(pseudo)) continue;
            const parentPath = paths.get(nodes.backendNodeId[nodes.parentIndex[ni]]);
            if (parentPath === undefined) continue;
            const [x,y,width,height] = layout.bounds[i];
            observations[parentPath].pseudos ||= {};
            const prior = observations[parentPath].pseudos![`::${pseudo}`];
            // A pseudo node can have additional zero-area inline layout entries.
            if (prior && prior.width * prior.height >= width * height) continue;
            observations[parentPath].pseudos![`::${pseudo}`] = {x: x - (document.scrollOffsetX || 0), y: y - (document.scrollOffsetY || 0), width, height,
                styles: Object.fromEntries(styles.map((name, j) => [name, snapshot.strings[layout.styles[i][j]] || '']))};
        }
        // Native input text isn't included in DOMSnapshot textBoxes; query its UA subtree.
        await Promise.all(controls.map(async ({node, path}) => {
            const attributes = node.attributes || [];
            const typeIndex = attributes.indexOf('type');
            if (typeIndex >= 0 && attributes[typeIndex + 1] === 'password') return;
            const fragments: NonNullable<CaptureObservations[string]['controlText']> = [];
            async function text(node: Node): Promise<void> {
                if (node.nodeType === 3 && node.nodeValue) {
                    const {quads} = await session.send('DOM.getContentQuads', {backendNodeId: node.backendNodeId});
                    if (quads.length !== 1) return;
                    const q = quads[0];
                    fragments.push({text: node.nodeValue, x: Math.min(q[0],q[2],q[4],q[6]), y: Math.min(q[1],q[3],q[5],q[7]),
                        width: Math.max(q[0],q[2],q[4],q[6])-Math.min(q[0],q[2],q[4],q[6]), height: Math.max(q[1],q[3],q[5],q[7])-Math.min(q[1],q[3],q[5],q[7])});
                }
                for (const child of node.children || []) await text(child);
            }
            for (const shadow of node.shadowRoots || []) await text(shadow);
            if (fragments.length) observations[path].controlText = fragments;
        }));
        const design = await page.evaluate(captureDesign, observations);
        const layers = new Map(design.layers.map(n => [n.key,n]));
        const fontPaths = new Set(design.layers.filter(n => n.kind === 'text').map(n => layers.get(n.parent!)?.source?.path).filter((path): path is string => path !== undefined));
        await Promise.all([...fontPaths].map(async path => {
            const nodeId = frontendIds.get(path);
            if (!nodeId) return;
            const {fonts} = await session.send('CSS.getPlatformFontsForNode', {nodeId});
            observations[path].fonts = [...new Set(fonts.sort((a,b) => b.glyphCount - a.glyphCount).map(f => f.familyName))];
        }));
        for (const n of design.layers) {
            const path = layers.get(n.parent!)?.source?.path;
            if (n.font && path !== undefined) n.font.actualFamilies = observations[path].fonts;
        }
        const version = await session.send('Browser.getVersion');
        return {...design, environment: {engine: 'chromium', browser: version.product, protocol: version.protocolVersion}};
    } finally {await session.detach();}
}

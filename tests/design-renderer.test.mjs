import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderDesign} from '../assets/design-renderer.mjs';

function runtime() {
    const nodes = new Map([['section', {id: 'section', type: 'SECTION', children: []}]]);
    let count = 0, writes = 0;
    const pending = [];
    function plan(node) {
        const p = {node, set(props) {pending.push(() => {Object.assign(node, props); writes++;}); return p;},
            append(child) {return p.addAt(node.children.length, child);},
            addAt(index, child) {pending.push(() => {
                if (child.node.parent) child.node.parent.children = child.node.parent.children.filter(n => n !== child.node);
                node.children.splice(index, 0, child.node); child.node.parent = node; writes++;
            }); return p;},
            remove() {pending.push(() => {
                node.parent.children = node.parent.children.filter(n => n !== node); nodes.delete(node.id); writes++;
            });}};
        return p;
    }
    const create = (type, props) => {
        const node = {id: `node-${++count}`, type, children: []}; nodes.set(node.id, node);
        return plan(node).set(props);
    };
    const builder = {get: id => plan(nodes.get(id)), frame: p => create('FRAME', p), text: p => create('TEXT', p),
        svg: (_, p) => create('FRAME', p), done: async () => {while (pending.length) pending.shift()();}};
    const figma = {getNodeByIdAsync: async id => nodes.get(id), loadFontAsync: async font => {
        if (font.family !== 'Inter') throw new Error('Missing font');
    }};
    return {builder, figma, nodes, writes: () => writes, queued: () => pending.length};
}
const root = {key: '$viewport', parent: null, kind: 'frame', name: 'Viewport', x: 0, y: 0, width: 640, height: 480,
    opacity: 1, fills: [], clips: true};
const label = {key: 'title', parent: '$viewport', kind: 'text', name: 'Title', x: 20, y: 20, width: 200, height: 24,
    opacity: 1, fills: [{r: 0, g: 0, b: 0, a: 1}], text: 'Draft', font: {family: 'Inter', weight: 400, italic: false, size: 16}};
const capture = (...layers) => ({version: 1, converter: 'native-v1', viewport: {width: 640, height: 480},
    layers: [structuredClone(root), ...structuredClone(layers)], warnings: [], unstableKeys: []});
const render = (rt, design, extra = {}) => renderDesign({...rt, design, containerId: 'section', ...extra});

test('unchanged publication writes nothing; text edits and sibling insertion retain IDs and paint order', async () => {
    const rt = runtime();
    const first = await render(rt, capture(label));
    const writes = rt.writes();
    assert.equal((await render(rt, capture(label), {previous: first})).writes, 0);
    assert.equal(rt.writes(), writes);
    const reorderedFields = Object.fromEntries(Object.entries(label).reverse());
    assert.equal((await render(rt, capture(reorderedFields), {previous: first})).writes, 0);
    const updated = await render(rt, capture({...label, text: 'Updated draft'}), {previous: first});
    assert.equal(updated.layers.title.id, first.layers.title.id);
    assert.equal(rt.nodes.get(first.layers.title.id).characters, 'Updated draft');
    const sibling = {...label, key: 'new', text: 'New', y: 50};
    const inserted = await render(rt, capture(sibling, {...label, text: 'Updated draft'}), {previous: updated});
    assert.equal(inserted.layers.title.id, first.layers.title.id);
    assert.deepEqual(rt.nodes.get(first.layers.$viewport.id).children.map(n => n.id), [inserted.layers.new.id, first.layers.title.id]);
    const reordered = await render(rt, capture({...label, text: 'Updated draft'}, sibling), {previous: inserted});
    assert.notEqual(reordered.writes, 0, 'paint-order changes must not be skipped');
    assert.deepEqual(rt.nodes.get(first.layers.$viewport.id).children.map(n => n.id), [first.layers.title.id, inserted.layers.new.id]);
});

test('preflight rejects invalid trees, fonts, duplicate keys, missing IDs and node type changes before mutations', async () => {
    for (const change of [
        d => {d.layers.push({...label});},
        d => {d.layers[1].parent = 'missing';},
        d => {d.layers[1].width = NaN;},
        d => {d.layers[1].font.family = 'Missing';},
    ]) {
        const rt = runtime(), d = capture(label); change(d);
        await assert.rejects(render(rt, d)); assert.equal(rt.writes(), 0); assert.equal(rt.queued(), 0);
    }
    const rt = runtime(), first = await render(rt, capture(label)), writes = rt.writes();
    rt.nodes.get(first.layers.title.id).type = 'RECTANGLE';
    await assert.rejects(render(rt, capture(label), {previous: first}), /incompatible/);
    assert.equal(rt.writes(), writes); assert.equal(rt.queued(), 0);
});

test('ambiguous paths require explicit verification; mapped ID cannot point outside the trial', async () => {
    const rt = runtime(), d = capture(label); d.unstableKeys = ['title'];
    const first = await render(rt, d);
    d.layers[1].text = 'Changed';
    await assert.rejects(render(rt, d, {previous: first}), /Verify ambiguous/);
    const updated = await render(rt, d, {previous: first, verifiedKeys: ['title']});
    assert.equal(updated.layers.title.id, first.layers.title.id);
    const invalid = structuredClone(updated); invalid.layers.title.id = 'section';
    await assert.rejects(render(rt, d, {previous: invalid}), /incompatible/);
});

test('obsolete nodes are removed only after explicit mapping verification and never remove unmapped children', async () => {
    const rt = runtime(), first = await render(rt, capture(label));
    await assert.rejects(render(rt, capture(), {previous: first}), /Verify ambiguous/);
    await render(rt, capture(), {previous: first, verifiedKeys: ['title']});
    assert.equal(rt.nodes.has(first.layers.title.id), false);
    const box = {...root, key: 'box', parent: '$viewport'};
    const next = await render(rt, capture(box), {previous: {...first, layers: {$viewport: first.layers.$viewport}}});
    rt.nodes.get(next.layers.box.id).children.push({id: 'manual'});
    await assert.rejects(render(rt, capture(), {previous: next, verifiedKeys: ['box']}), /unmapped content/);
});

test('native-v2 keeps typography styles on an automatic fallback and draws inset outlines as strokes', async () => {
    const rt = runtime();
    rt.figma.listAvailableFontsAsync = async () => ['Condensed Regular','Regular','Medium','Bold','Italic','Bold Italic'].map(style => ({fontName:{family:'Inter',style}}));
    const d = capture({...label, font:{family:'Unavailable',families:['Unavailable'],size:15,weight:700,italic:true},
        typography:{lineHeight:28,letterSpacing:1.5,align:'CENTER',decoration:'UNDERLINE',direction:'ltr'}});
    d.version = 2; d.converter = 'native-v2'; d.diagnostics = [];
    d.layers[0].effects = [{type:'INNER_SHADOW',color:{r:0,g:0,b:1,a:1},offset:{x:0,y:0},radius:0,spread:2}];
    const first = await render(rt,d);
    const actual = rt.nodes.get(first.layers.title.id);
    assert.deepEqual(actual.fontName,{family:'Inter',style:'Bold Italic'});
    assert.equal(actual.fontSize,15); assert.equal(actual.lineHeight.value,28);
    assert.equal(actual.letterSpacing.value,1.5); assert.equal(actual.textDecoration,'UNDERLINE');
    assert.equal(actual.textAlignHorizontal,'CENTER');
    assert.equal(rt.nodes.get(first.layers.$viewport.id).strokeWeight,2);
    assert.equal(rt.nodes.get(first.layers.$viewport.id).effects.length,0);
    assert.equal((await render(rt,d,{previous:first})).writes,0);
    const writes=rt.writes();
    d.diagnostics=[{severity:'unsupported',message:'gradient'}];
    await assert.rejects(render(rt,d,{previous:first}),/Unsupported rendering/);
    assert.equal(rt.writes(),writes);
});

test('SVG viewport resizing preserves node identity and refuses changed assets', async () => {
    const rt=runtime();
    const icon={...root,key:'icon',parent:'$viewport',kind:'svg',width:40,height:44,
        svg:'<svg viewBox="0 0 16 16" width="40" height="44"><path d="M0 0h16v16H0z"/></svg>'};
    const first=await render(rt,capture(icon));
    const node=rt.nodes.get(first.layers.icon.id);
    let scaled=0;
    node.rescale=function(factor){scaled++;this.width*=factor;this.height*=factor;};
    const nextIcon={...icon,width:16,height:16,x:12,y:14,svg:icon.svg.replace('width="40"','width="16"').replace('height="44"','height="16"')};
    const next=await render(rt,capture(nextIcon),{previous:first});
    assert.equal(next.layers.icon.id,first.layers.icon.id);assert.equal(scaled,1);
    assert.equal(node.width,16);assert.equal(node.height,16);assert.equal(node.x,12);assert.equal(node.y,14);
    await assert.rejects(render(rt,capture({...nextIcon,svg:nextIcon.svg.replace('h16','h8')}),{previous:next}),/SVG asset migration/);
});

test('design-system bindings degrade to native values when the builder lacks DS APIs', async () => {
    const rt = runtime();
    const first = await render(rt, capture({...label, semantic: {component: 'tuiButton', tokens: {color: '--tui-text-primary'}, textStyle: '--tui-typography-body-m'}}), {
        mapping: {profileId: 'test', layers: {title: {
            component: {key: 'a'.repeat(40), props: {}},
            tokens: {color: {key: 'b'.repeat(40)}},
            textStyle: {key: 'c'.repeat(40)},
        }}, warnings: []},
    });
    assert.equal(first.designSystem.instances, 0);
    assert.equal(first.designSystem.nativeFallbacks, 1);
    assert.ok(first.warnings.some(message => message.includes('instance support')));
    assert.ok(first.warnings.some(message => message.includes('text style binding')));
    assert.ok(first.warnings.some(message => message.includes('token color binding')));
});

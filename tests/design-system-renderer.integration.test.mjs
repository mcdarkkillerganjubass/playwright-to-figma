import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderDesign} from '../assets/design-renderer.mjs';
import {resolveDesignSystem} from '../assets/design-system-mapping.mjs';
import fs from 'node:fs';

const profile = JSON.parse(fs.readFileSync(new URL('../profiles/proprietary-taiga-ui-angular.json', import.meta.url)));
const design = {
    version: 2, converter: 'native-v2', viewport: {width: 320, height: 180}, warnings: [], unstableKeys: [], diagnostics: [],
    layers: [
        {key: '$viewport', parent: null, kind: 'frame', name: 'Viewport', x: 0, y: 0, width: 320, height: 180, opacity: 1, fills: []},
        {key: 'release', parent: '$viewport', kind: 'frame', name: 'Release', x: 16, y: 16, width: 120, height: 32, opacity: 1, fills: [],
            semantic: {component: 'tuiButton', props: {size: 's', appearance: 'primary'}, tokens: {color: '--tui-text-action'}}},
        {key: 'native', parent: '$viewport', kind: 'frame', name: 'Unmapped', x: 16, y: 64, width: 100, height: 24, opacity: 1, fills: [{r: 1, g: 0, b: 0, a: 1}]},
    ],
};

function runtime() {
    const nodes = new Map([['section', {id: 'section', type: 'SECTION', children: []}]]);
    let count = 0;
    const pending = [];
    const plan = node => ({node, set(props) {pending.push(() => Object.assign(node, props)); return this;}, append(child) {pending.push(() => {node.children.push(child.node); child.node.parent = node;}); return this;}, addAt() {return this;}});
    const create = (type, props) => {const node = {id: `node-${++count}`, type, children: []}; nodes.set(node.id, node); return plan(node).set(props);};
    const builder = {
        get: id => plan(nodes.get(id)), frame: props => create('FRAME', props), text: props => create('TEXT', props), svg: (_, props) => create('FRAME', props),
        instance: (key, opts) => create('INSTANCE', {componentKey: key, ...opts}),
        getVar: key => ({variableKey: key}), getStyle: key => ({styleKey: key}),
        done: async () => {while (pending.length) pending.shift()();},
    };
    const figma = {getNodeByIdAsync: async id => nodes.get(id), listAvailableFontsAsync: async () => [], loadFontAsync: async () => {}};
    return {builder, figma, nodes};
}

test('edit-draft-info result renders beside the reference section without using it as a baseline', async () => {
    const mapping = resolveDesignSystem(design, profile);
    const rt = runtime();
    const result = await renderDesign({builder: rt.builder, figma: rt.figma, design, mapping, containerId: 'section'});
    const mapped = rt.nodes.get(result.layers.release.id);
    const fallback = rt.nodes.get(result.layers.native.id);
    assert.equal(result.designSystem.profileId, 'proprietary-taiga-ui-angular');
    assert.equal(result.designSystem.instances, 1);
    assert.equal(mapped.type, 'INSTANCE');
    assert.equal(mapped.componentKey, profile.components.tuiButton.key);
    assert.equal(fallback.type, 'FRAME');
    assert.equal(result.designSystem.nativeFallbacks, 0);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveDesignSystem} from '../assets/design-system-mapping.mjs';

const profile = JSON.parse(await readFile(new URL('../profiles/proprietary-taiga-ui-angular.json', import.meta.url), 'utf8'));
const design = {layers: [{key: 'save', semantic: {component: 'tuiButton', props: {size: 's', appearance: 'primary'},
    icon: '@tui.pragmatic.small.plus', tokens: {fills: '--tui-text-primary'}, textStyle: '--tui-typography-body-m'}}]};

test('resolves across libraries without mutating inputs', () => {
    const before = JSON.stringify({design, profile});
    const result = resolveDesignSystem(design, profile);
    assert.deepEqual(result.layers.save.component.props, {size: 'small', appearance: 'primary'});
    assert.equal(result.layers.save.icon.library, 'TUI Assets');
    assert.equal(result.layers.save.tokens.fills.library, 'TUI Foundations');
    assert.equal(result.warnings.length, 0);
    assert.equal(JSON.stringify({design, profile}), before);
});

test('another profile overrides keys and translations without changing the resolver', () => {
    const other = structuredClone(profile);
    other.id = 'another-angular-library';
    other.components.tuiButton.key = 'a'.repeat(40);
    other.components.tuiButton.properties.size.values.s = 'Compact';
    const result = resolveDesignSystem(design, other);
    assert.equal(result.layers.save.component.key, 'a'.repeat(40));
    assert.equal(result.layers.save.component.props.size, 'Compact');
    assert.equal(resolveDesignSystem(design, profile).layers.save.component.props.size, 'small');
});

test('unmapped appearances never silently use the default component', () => {
    const input = structuredClone(design);
    input.layers[0].semantic.props.appearance = 'action-grayscale';
    const result = resolveDesignSystem(input, profile);
    assert.equal(result.layers.save.component, undefined);
    assert.equal(result.layers.save.fallback, 'native');
    assert.equal(result.warnings[0].category, 'properties');
    input.layers[0].semantic.component = 'unknown';
    assert.equal(resolveDesignSystem(input, profile).warnings[0].category, 'components');
});

test('rejects invalid keys, wrong asset types and duplicate layer identities', () => {
    const broken = structuredClone(profile);
    broken.icons['@tui.pragmatic.small.plus'].key = 'not-a-key';
    assert.throws(() => resolveDesignSystem(design, broken), /Invalid asset/);
    broken.icons['@tui.pragmatic.small.plus'] = {type: 'variable', key: 'a'.repeat(40)};
    assert.throws(() => resolveDesignSystem(design, broken), /Wrong asset type/);
    assert.throws(() => resolveDesignSystem({layers: [...design.layers, ...design.layers]}, profile), /duplicate/);
});

test('explicit catalog gaps produce warnings and cannot masquerade as mapped assets', () => {
    const partial = structuredClone(profile);
    partial.icons['@tui.pragmatic.small.plus'] = {status: 'unresolved', reason: 'ambiguous'};
    const result = resolveDesignSystem(design, partial);
    assert.equal(result.layers.save.icon, null);
    assert.equal(result.layers.save.fallback, 'native');
    assert.equal(result.warnings[0].reason, 'ambiguous');
    partial.icons['@tui.pragmatic.small.plus'].key = 'a'.repeat(40);
    assert.throws(() => resolveDesignSystem(design, partial), /Unresolved asset has a key/);
});

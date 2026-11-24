import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {captureDesign} from '../assets/design-capture';
import {FlowExport} from '../assets/flow-export';

test('exports live form values, line geometry, SVGs, clipping and semantic keys alongside PNGs', async ({page}, info) => {
    await page.setContent(`<style>body{margin:0;font:16px Arial}#card{position:absolute;left:20px;top:20px;width:220px;height:200px;overflow:hidden;background:rgb(240,240,240);border:2px solid black;border-radius:8px}p{margin:0;width:70px}input{width:170px;height:24px;font:16px Arial}</style>
        <main id="card"><p id="label">A line that wraps here</p><input id="value" value="initial"><input id="password" type="password" value="secret"><svg id="icon" width="16" height="16" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="red"/></svg><span id="hidden" style="display:none">Hidden</span></main>`);
    await page.locator('#value').fill('Updated draft');
    const flow = new FlowExport(page, info, 'form', {design: true});
    await flow.capture('Filled', 'filled');
    await flow.finish();
    const state = flow.manifest.states[0];
    expect(flow.manifest.version).toBe(2);
    const design = JSON.parse(await readFile(join(flow.directory, state.design!), 'utf8'));
    expect(design.layers.find((n: {key: string}) => n.key === 'element:value/value').text).toBe('Updated draft');
    expect(design.layers.find((n: {key: string}) => n.key === 'element:password/value').text).toBe('••••••');
    expect(design.layers.find((n: {key: string}) => n.key === 'element:card').clips).toBe(true);
    expect(design.layers.some((n: {key: string}) => n.key === 'element:hidden')).toBe(false);
    expect(design.layers.filter((n: {parent: string; kind: string}) => n.parent === 'element:label' && n.kind === 'text').length).toBeGreaterThan(1);
    expect(design.layers.find((n: {key: string}) => n.key === 'element:icon').svg).toContain('fill: rgb(255, 0, 0)');
    expect((await readFile(join(flow.directory, state.image))).subarray(1,4).toString()).toBe('PNG');
});

test('rejects duplicate explicit keys instead of inventing identity', async ({page}) => {
    await page.setContent('<div data-figma-id="same">First</div><div data-figma-id="same">Second</div>');
    await expect(page.evaluate(captureDesign)).rejects.toThrow('Duplicate design key');
});

test('captures optional design-system semantics without guessing from CSS', async ({page}) => {
    await page.setContent(`<button id="save" data-figma-component="tuiButton" data-figma-prop-size="s" data-figma-prop-appearance="primary" data-figma-icon="@tui.pragmatic.small.plus" data-figma-token-color="--tui-text-action">Save</button>`);
    const design = await page.evaluate(captureDesign);
    const layer = design.layers.find((n: {key: string}) => n.key === 'element:save');
    expect(layer?.semantic).toEqual({component: 'tuiButton', props: {size: 's', appearance: 'primary'},
        icon: '@tui.pragmatic.small.plus', tokens: {color: '--tui-text-action'}});
});

test('version-1 screenshot exports remain compatible and earlier checkpoints stay immutable', async ({page}, info) => {
    await page.setContent('<button>Save</button>');
    const flow = new FlowExport(page, info, 'legacy');
    await flow.capture('Draft');
    const original = await readFile(join(flow.directory, 'state-1.png'));
    await flow.transition({trigger: page.getByRole('button'), label: 'Save', destination: 'Saved',
        action: () => page.getByRole('button').evaluate(e => {e.textContent = 'Saved';}),
        ready: () => expect(page.getByRole('button')).toHaveText('Saved')});
    await flow.finish();
    expect(flow.manifest.version).toBe(1);
    expect(flow.manifest.states[0].design).toBeUndefined();
    expect(await readFile(join(flow.directory, 'state-1.png'))).toEqual(original);
});

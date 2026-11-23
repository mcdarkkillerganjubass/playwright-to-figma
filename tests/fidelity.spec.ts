import {expect, test} from '@playwright/test';
import {captureDesign} from '../assets/design-capture';
import {capturePageDesign} from '../assets/page-design';

test('native input text follows its rendered content rather than the border-box center', async ({page}) => {
    await page.setContent('<style>input{position:absolute;left:60px;top:60px;width:192px;height:44px;box-sizing:border-box;border:0;padding:14px 12px 0;font:13px/16px Arial}</style><input id="value" value="0px">');
    const design = await capturePageDesign(page);
    const value = design.layers.find(n => n.key === 'element:value/value')!;
    const session = await page.context().newCDPSession(page);
    const {root} = await session.send('DOM.getDocument', {depth: -1, pierce: true});
    const {nodeId} = await session.send('DOM.querySelector', {nodeId: root.nodeId, selector: 'input'});
    const {node} = await session.send('DOM.describeNode', {nodeId, depth: -1, pierce: true});
    const editor = node.shadowRoots![0].children![0];
    const {model} = await session.send('DOM.getBoxModel', {backendNodeId: editor.backendNodeId});
    await session.detach();
    expect(Math.abs(value.y - model.content[1])).toBeLessThan(0.1);
});

test('captures CSS text styles independently of measured font rectangles', async ({page}) => {
    await page.setContent('<p id="styled" style="font:italic 600 15px/28px Arial;letter-spacing:1.5px;text-decoration:underline;text-transform:uppercase">Styled label</p>');
    const design = await page.evaluate(captureDesign);
    const text = design.layers.find(n => n.kind === 'text')!;
    expect(text.font?.size).toBe(15);
    expect(text.typography).toMatchObject({lineHeight: 28, letterSpacing: 1.5, decoration: 'UNDERLINE'});
    expect(text.text).toBe('STYLED LABEL');
});

test('measures static pseudo-element layout without dropping positive boxes for zero-area entries', async ({page}) => {
    await page.setContent(`<style>button{position:absolute;left:80px;top:100px;display:flex;align-items:center;padding:12px;gap:8px;font:16px/24px Arial}button::before{content:'→';display:block;width:24px;height:24px}</style><button id="button">Continue</button>`);
    const design=await capturePageDesign(page);
    const pseudo=design.layers.find(n=>n.key==='element:button::before')!;
    expect(pseudo.width).toBe(24);expect(pseudo.height).toBe(24);
    expect(pseudo.x).toBeGreaterThan(80);expect(pseudo.x).toBeLessThan(110);
    expect(design.layers.find(n=>n.key==='element:button::before/text')?.text).toBe('→');
});

test('reports unsupported rendering features instead of silently presenting them as exact', async ({page}) => {
    await page.setContent('<div id="gradient" style="width:100px;height:40px;background:linear-gradient(red,blue);filter:blur(1px)">Gradient</div>');
    const design=await capturePageDesign(page);
    expect(design.diagnostics.some(d=>d.severity==='unsupported'&&d.message.includes('background'))).toBe(true);
    expect(design.diagnostics.some(d=>d.severity==='unsupported'&&d.message.includes('filter'))).toBe(true);
});

test('shared fixture covers tables, wrapped text, scrolling, SVGs, overlays and explicit comparison regions', async ({page}) => {
    const {readFile}=await import('node:fs/promises');
    await page.setContent(await readFile('tests/fixtures/fidelity.html','utf8'));
    await page.locator('#scroll').evaluate(e=>{e.scrollTop=24;});
    const design=await capturePageDesign(page);
    expect(design.regions.map(r=>r.name)).toEqual(['form','table','text','scroll','overlay']);
    expect(design.layers.find(n=>n.key==='element:scroll')?.clips).toBe(true);
    expect(design.layers.find(n=>n.key==='element:overlay')?.x).toBe(320);
    expect(design.layers.find(n=>n.key==='element:svg')?.kind).toBe('svg');
    expect(design.layers.some(n=>n.text==='A longer value')).toBe(true);
    expect(design.layers.filter(n=>n.kind==='text'&&n.parent==='element:wrapped').length).toBeGreaterThan(1);
    expect(design.diagnostics.some(d=>d.message.includes('non-translation transform'))).toBe(true);
});

test('SVG masks honor CSS size and position rather than stretching to the pseudo box', async ({page}) => {
    const svg=encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M1 1h14v14H1z"/></svg>');
    await page.setContent(`<style>#icon{position:relative;width:40px;height:44px}#icon::after{content:'\\2060';position:absolute;inset:0;background:black;mask:url("data:image/svg+xml,${svg}") no-repeat center / 16px 16px}</style><div id="icon"></div>`);
    const design=await capturePageDesign(page);
    const owner=design.layers.find(n=>n.key==='element:icon')!;
    const mask=design.layers.find(n=>n.key==='element:icon::after')!;
    expect(mask.kind).toBe('svg');expect(mask.width).toBe(16);expect(mask.height).toBe(16);
    expect(mask.x-owner.x).toBe(12);expect(mask.y-owner.y).toBe(14);
    expect(design.layers.some(n=>n.parent===mask.key)).toBe(false);
    await page.addStyleTag({content:'#icon::after{inset:auto;left:0;top:0;width:16px;height:44px;border-left:12px solid transparent;border-right:12px solid transparent;mask-origin:padding-box;mask-size:contain}'});
    const bordered=await capturePageDesign(page);
    const inner=bordered.layers.find(n=>n.key===mask.key)!;
    expect(inner.width).toBe(16);expect(inner.height).toBe(16);
    expect(inner.x-owner.x).toBe(12);expect(inner.y-owner.y).toBe(14);
});

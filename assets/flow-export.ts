import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdir, rename, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {expect, type Locator, type Page, type TestInfo} from '@playwright/test';

type Bounds = {x: number; y: number; width: number; height: number};
type State = {
    id: string;
    label: string;
    image: string;
    url: string;
    scroll: {x: number; y: number};
};

export class FlowExport {
    readonly directory: string;
    readonly manifest;

    constructor(private readonly page: Page, private readonly testInfo: TestInfo, scenario: string) {
        const viewport = page.viewportSize();
        if (!viewport) throw new Error('Flow export requires a fixed viewport');
        this.directory = testInfo.outputPath('flow', randomUUID());
        this.manifest = {
            version: 1,
            scenario,
            viewport,
            provenance: {
                branch: execFileSync('git', ['branch', '--show-current'], {encoding: 'utf8'}).trim(),
                commit: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
                test: testInfo.title,
                retry: testInfo.retry,
            },
            status: 'recording' as 'recording' | 'passed' | 'failed',
            states: [] as State[],
            transitions: [] as {from: string; to: string; label: string; trigger: Bounds | null}[],
        };
    }

    private async persist(): Promise<void> {
        await mkdir(this.directory, {recursive: true});
        const temporary = join(this.directory, 'recording.json.tmp');
        await writeFile(temporary, JSON.stringify(this.manifest, null, 2) + '\n');
        await rename(temporary, join(this.directory, 'recording.json'));
    }

    private async screenshot(state: State): Promise<void> {
        expect(this.page.viewportSize()).toEqual(this.manifest.viewport);
        await this.page.evaluate(() => document.fonts.ready.then(() => undefined));
        const temporary = join(this.directory, state.image + '.tmp');
        await mkdir(this.directory, {recursive: true});
        await this.page.screenshot({path: temporary, type: 'png', fullPage: false, scale: 'css', animations: 'disabled'});
        await rename(temporary, join(this.directory, state.image));
        const url = new URL(this.page.url());
        url.username = '';
        url.password = '';
        url.search = '';
        url.hash = '';
        state.url = url.href;
        state.scroll = await this.page.evaluate(() => ({x: scrollX, y: scrollY}));
    }

    async capture(label: string, id = 'state-1'): Promise<void> {
        if (this.manifest.states.length || this.manifest.status !== 'recording') {
            throw new Error('Use capture once, then transition for subsequent states');
        }
        try {
            if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid state ID');
            const state = {id, label, image: `${id}.png`, url: '', scroll: {x: 0, y: 0}};
            await this.screenshot(state);
            this.manifest.states.push(state);
            await this.persist();
        } catch (error) {
            this.manifest.status = 'failed';
            await this.persist();
            throw error;
        }
    }

    async transition(options: {
        trigger?: Locator;
        destinationId?: string;
        interaction?: 'click' | 'hover';
        label: string;
        destination: string;
        action: () => Promise<unknown>;
        ready: () => Promise<unknown>;
    }): Promise<void> {
        const source = this.manifest.states.at(-1);
        if (!source || this.manifest.status !== 'recording') throw new Error('Capture a source state before a transition');
        try {
            let bounds: Bounds | null = null;
            if (options.trigger) {
                await options.trigger.scrollIntoViewIfNeeded();
                if (options.interaction !== 'hover') await options.trigger.click({trial: true});
                bounds = await options.trigger.boundingBox();
                if (!bounds) throw new Error('Trigger has no visible bounding box');
                const {width, height} = this.manifest.viewport;
                if (bounds.x < 0 || bounds.y < 0 || bounds.width <= 0 || bounds.height <= 0 ||
                    bounds.x + bounds.width > width || bounds.y + bounds.height > height) {
                    throw new Error('Trigger must be fully inside the captured viewport');
                }
            }
            // Source pixels are immutable: later input or hover must not overwrite an earlier checkpoint.
            if (options.trigger) expect(await options.trigger.boundingBox()).toEqual(bounds);
            await options.action();
            await options.ready();
            const id = options.destinationId ?? `state-${this.manifest.states.length + 1}`;
            if (!/^[a-z0-9-]+$/.test(id) || this.manifest.states.some(state => state.id === id)) throw new Error('Invalid or duplicate state ID');
            const destination = {id, label: options.destination, image: `${id}.png`, url: '', scroll: {x: 0, y: 0}};
            await this.screenshot(destination);
            this.manifest.states.push(destination);
            this.manifest.transitions.push({from: source.id, to: id, label: options.label, trigger: bounds});
            await this.persist();
        } catch (error) {
            this.manifest.status = 'failed';
            await this.persist();
            throw error;
        }
    }

    async finish(): Promise<void> {
        if (this.manifest.status !== 'recording' || !this.manifest.states.length) {
            throw new Error('Only a nonempty recording can finish successfully');
        }
        this.manifest.status = 'passed';
        await this.persist();
        await this.testInfo.attach('flow-map', {path: join(this.directory, 'recording.json'), contentType: 'application/json'});
    }
}

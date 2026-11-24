import {defineConfig} from '@playwright/test';
export default defineConfig({testDir: '.', testMatch: 'real-taiga.spec.ts', outputDir: '../artifacts/real-taiga', workers: 1,
    use: {channel: 'chrome', baseURL: 'http://127.0.0.1:4400', viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'},
    webServer: {command: 'npm --prefix /Users/n.kostyukov/Desktop/nitro-3-design-prototypes2 start -- --host 127.0.0.1 --port 4400', url: 'http://127.0.0.1:4400', reuseExistingServer: true, timeout: 120000}});

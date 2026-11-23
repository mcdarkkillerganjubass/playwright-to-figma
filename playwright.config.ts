import {defineConfig} from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    testMatch: '*.spec.ts',
    outputDir: './test-results',
    workers: 1,
    use: {
        viewport: {width: 640, height: 480},
        launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
            ? {executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {},
    },
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'record.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 240_000,
  outputDir: '../../.demo-work/pw',
  reporter: 'line',
  use: {
    baseURL: process.env.DEMO_BASE_URL ?? 'http://localhost:4300',
    viewport: { width: 1280, height: 720 },
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    launchOptions: { slowMo: 250 },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});

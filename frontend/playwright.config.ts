// traces_to: L2-074
import { defineConfig, devices } from '@playwright/test';

const port = process.env['PLAYWRIGHT_DEV_PORT'] ?? '4200';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './projects/the-upper-room/e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run start -- --port=${port}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});

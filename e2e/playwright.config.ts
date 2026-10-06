// traces_to: L2-074
import { defineConfig, devices } from '@playwright/test';

const port = process.env['PLAYWRIGHT_DEV_PORT'] ?? '4200';
const baseURL = `http://localhost:${port}`;

// The backend is never started: every /api and /__idp request is answered by the
// in-browser mock installed by the `mockApi` fixture (see fixtures/test.ts).
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // The app registers /sw.js; a controlling service worker hides navigations and
    // fetches from page.route(). Only the PWA spec opts back in.
    serviceWorkers: 'block',
    ...(process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
      ? { launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] } }
      : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run start -- --port=${port}`,
    cwd: '../frontend',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 300_000,
  },
});

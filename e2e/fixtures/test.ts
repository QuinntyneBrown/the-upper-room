// Shared Playwright test with the in-browser mock backend installed on every
// browser context. Specs import { test, expect } from here instead of
// '@playwright/test' so the ASP.NET backend is never required.
import { test as base, expect } from '@playwright/test';
import { MockBackend } from '../mocks/mock-backend';

export interface MockFixtures {
  /** The in-memory backend answering this test's /api and /__idp requests. */
  mockApi: MockBackend;
}

export const test = base.extend<MockFixtures>({
  mockApi: [
    async ({ context }, use) => {
      const backend = new MockBackend();
      await backend.install(context);
      await use(backend);
    },
    { auto: true },
  ],
});

export { expect };
export type { Page, Locator, BrowserContext } from '@playwright/test';

// Seeds the fake session the app's AccessTokenStore and PermissionsService read
// from sessionStorage on boot, so a spec can land directly on a protected route.
import type { Page } from '@playwright/test';

export interface SessionSeed {
  token?: string;
  userId?: string;
  cityId?: string;
  roles?: string[];
  permissions?: string[];
}

export async function seedSession(page: Page, seed: SessionSeed = {}): Promise<void> {
  const token = seed.token ?? 'member-token';
  const rbac = {
    userId: seed.userId ?? token.replace(/-token$/, ''),
    cityId: seed.cityId ?? 'toronto',
    roles: seed.roles ?? ['Member'],
    permissions: seed.permissions ?? [],
  };
  await page.addInitScript(
    ([t, r]) => {
      window.sessionStorage.setItem('__e2e_access_token', t);
      window.sessionStorage.setItem('__e2e_rbac', r);
    },
    [token, JSON.stringify(rbac)] as const,
  );
}

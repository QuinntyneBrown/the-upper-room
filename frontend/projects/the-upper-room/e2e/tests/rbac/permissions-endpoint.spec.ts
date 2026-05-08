// traces_to: L2-023
import { test, expect } from '@playwright/test';

interface Me {
  roles: string[];
  permissions: string[];
}

async function fetchMe(
  request: import('@playwright/test').APIRequestContext,
  userId: string,
): Promise<Me> {
  const res = await request.get('/api/v1/users/me', {
    headers: { 'X-Test-User-Id': userId },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as Me;
}

test('SystemAdmin has User:Manage and Audit:Read', async ({ request }) => {
  const me = await fetchMe(request, 'admin');
  expect(me.roles).toContain('SystemAdmin');
  expect(me.permissions).toContain('User:Manage');
  expect(me.permissions).toContain('Audit:Read');
});

test('Member excludes Contact:Create', async ({ request }) => {
  const me = await fetchMe(request, 'member');
  expect(me.roles).toContain('Member');
  expect(me.permissions).not.toContain('Contact:Create');
});

test('Guest can only read events and RSVP', async ({ request }) => {
  const me = await fetchMe(request, 'guest');
  expect(me.permissions.sort()).toEqual(['Event:RSVP', 'Event:Read']);
});

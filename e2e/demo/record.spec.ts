import { test, expect, Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WORK = resolve(__dirname, '../../.demo-work');
const chapters: { n: number; ms: number }[] = JSON.parse(
  readFileSync(resolve(WORK, 'chapters.json'), 'utf-8'),
);
const PASSWORD = 'UpperRoomDev!42';
const stamp = Date.now().toString().slice(-5);

async function pause(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms);
}

test('The Upper Room demo', async ({ page }) => {
  const starts: number[] = [];
  const t0 = Date.now();
  const chapterStart = (): void => {
    starts.push(Date.now() - t0);
  };
  const chapterEnd = async (n: number): Promise<void> => {
    const target = starts[n - 1] + chapters[n - 1].ms + 1200;
    const wait = target - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
  };

  // Chapter 1: sign in (wrong password, then success)
  await page.goto('/sign-in');
  chapterStart();
  await pause(page, 4000);
  await page.getByTestId('sign-in-email').fill('admin@test.local');
  await page.getByTestId('sign-in-password').fill('WrongPassword!1');
  await page.getByTestId('sign-in-submit').click();
  await expect(page.getByTestId('sign-in-error-form')).toBeVisible();
  await pause(page, 3500);
  await page.getByTestId('sign-in-password').fill(PASSWORD);
  await page.getByTestId('sign-in-submit').click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  await chapterEnd(1);

  // Chapter 2: contacts
  chapterStart();
  await page.getByTestId('nav-contacts').click();
  await expect(page).toHaveURL(/\/contacts$/);
  await pause(page, 3000);
  await page.getByTestId('contacts-search').click();
  await page.getByTestId('contacts-search').pressSequentially('Ali', { delay: 200 });
  await pause(page, 2500);
  await page.getByTestId('contacts-search').clear();
  await pause(page, 1000);
  await page.getByTestId('contacts-new-button').first().click();
  await expect(page).toHaveURL(/\/contacts\/new/);
  await page.getByTestId('contact-first-name').fill('Grace');
  await page.getByTestId('contact-last-name').fill(`Demo${stamp}`);
  await page.getByTestId('contact-title').fill('Volunteer coordinator');
  await pause(page, 1500);
  await page.getByTestId('contact-submit').click();
  await expect(page).toHaveURL(/\/contacts\/[^/]+$/, { timeout: 15_000 });
  await chapterEnd(2);

  // Chapter 3: events
  chapterStart();
  await page.getByTestId('nav-events').click();
  await expect(page).toHaveURL(/\/events$/);
  await pause(page, 3500);
  await page.getByTestId('events-new-button').click();
  await expect(page).toHaveURL(/\/events\/new/);
  await page.getByTestId('event-form-title').fill(`Community Dinner ${stamp}`);
  await page.getByTestId('event-form-start').fill('2026-12-20T18:00');
  await page.getByTestId('event-form-end').fill('2026-12-20T20:00');
  await pause(page, 1500);
  await page.getByTestId('event-form-submit').click();
  await expect(page).not.toHaveURL(/\/events\/new/, { timeout: 15_000 });
  await pause(page, 2500);
  await chapterEnd(3);

  writeFileSync(resolve(WORK, 'starts.json'), JSON.stringify(starts));
});

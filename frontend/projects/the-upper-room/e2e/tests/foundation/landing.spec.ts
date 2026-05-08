// traces_to: L2-074
import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';

test('landing page renders app name', async ({ page }) => {
  const landing = new LandingPage(page);
  await landing.goto();
  await expect(landing.appName).toBeVisible();
  await expect(page).toHaveTitle('The Upper Room');
});

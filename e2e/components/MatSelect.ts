// Helper for Angular Material selects: the trigger is not a native <select>,
// so pick an option by opening the overlay and clicking the matching option.
import type { Locator, Page } from '@playwright/test';

export async function selectMatOption(page: Page, trigger: Locator, label: string | RegExp): Promise<void> {
  await trigger.click();
  const name = typeof label === 'string' ? new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') : label;
  await page.getByRole('option', { name }).click();
}

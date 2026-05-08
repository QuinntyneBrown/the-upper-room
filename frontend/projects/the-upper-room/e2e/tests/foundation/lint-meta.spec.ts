// traces_to: L2-081, L2-082, L2-083, L2-100, L2-102
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

test('npm run lint exits 0 with --max-warnings=0', () => {
  let exit = 0;
  try {
    execSync('npm run lint -- --max-warnings=0', { stdio: 'pipe' });
  } catch (e: unknown) {
    exit = (e as { status?: number }).status ?? 1;
  }
  expect(exit).toBe(0);
});

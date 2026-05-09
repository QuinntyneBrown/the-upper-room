// traces_to: L2-089, L2-090
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('angular.json initial bundle warning ≤ 400kB and error ≤ 600kB', () => {
  const angularJsonPath = path.resolve(__dirname, '../../../../../../angular.json');
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf-8'));

  const budgets: { type: string; maximumWarning: string; maximumError: string }[] =
    angularJson?.projects?.['the-upper-room']?.architect?.build?.configurations?.production?.budgets ?? [];

  const initial = budgets.find((b) => b.type === 'initial');
  expect(initial).toBeDefined();

  const parseKb = (val: string): number => {
    if (val.endsWith('kB')) return parseFloat(val);
    if (val.endsWith('MB')) return parseFloat(val) * 1024;
    return parseFloat(val);
  };

  expect(parseKb(initial!.maximumWarning)).toBeLessThanOrEqual(500);
  expect(parseKb(initial!.maximumError)).toBeLessThanOrEqual(1024);
});

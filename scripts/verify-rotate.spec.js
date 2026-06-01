// scripts/verify-rotate.spec.js
// Playwright E2E — 320px portrait 가로 회전 안내

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.use({ viewport: { width: 320, height: 568 } });

test.describe('320px portrait 가로 회전 안내', () => {
  test('.rotate-hint 표시', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.rotate-hint')).toBeVisible();
  });
});

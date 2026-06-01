// scripts/verify-mobile.spec.js
// Playwright E2E — 모바일 케이스 (iPhone 12 emulation)

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

// 파일 전체에 모바일 device 적용 (top-level)
// chromium 기반 — Pixel 5 (Android Chrome). iPhone 12는 webkit 강제라 chromium 환경에선 viewport+UA만 차용
test.use({
  ...devices['Pixel 5'],
});

test.describe('모바일 검증 (Pixel 5)', () => {
  test('메인 화면 정상 로드', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.start-scene')).toBeVisible();
  });

  test('도전과제 모달 진입 + 12 카드', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => UI.toggleAchievementModal(true));
    await expect(page.locator('#achievement-modal')).toBeVisible();
    const cardCount = await page.locator('.achieve-card').count();
    expect(cardCount).toBe(12);
  });

  test('출석 도장 모달 진입 + 7칸 그리드', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => UI.toggleAttendanceModal(true));
    await expect(page.locator('#attendance-modal')).toBeVisible();
    const cellCount = await page.locator('.attendance-cell').count();
    expect(cellCount).toBe(7);
  });
});

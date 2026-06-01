// scripts/verify-placeholder-contrast.spec.js
// PR-H 핫픽스 검증
// - .text-placeholder color가 칠판(짙은 녹색) 위에서 보이는 chalk 계열
// - sw controllerchange 자동 reload listener 등록

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Placeholder Contrast Hotfix — PR-H', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('text-placeholder color가 칠판 대비 가능한 chalk 계열', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      UI.renderTargetWord(['mouse'], '');
      const span = document.querySelector('.text-placeholder');
      if (!span) return { hasPlaceholder: false };
      const cs = getComputedStyle(span);
      return {
        hasPlaceholder: true,
        color: cs.color,
        opacity: parseFloat(cs.opacity),
      };
    });
    expect(result.hasPlaceholder).toBe(true);
    // chalk-dim: #c8c8b8 = rgb(200, 200, 184)
    // 또는 untyped fallback: #f4f4eb = rgb(244, 244, 235)
    // 둘 다 칠판(짙은 녹색)에서 보이는 밝은 베이지 계열
    expect(result.color).toMatch(/rgb\(2(00|44), 2(00|44), 1?(84|235)\)/);
    // opacity가 너무 낮으면 안 보임 — 최소 0.5 이상
    expect(result.opacity).toBeGreaterThanOrEqual(0.5);
  });

  test('sw controllerchange listener — index.html에 등록', async ({ page }) => {
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    expect(html).toMatch(/controllerchange/);
    expect(html).toMatch(/_swRefreshing/);
  });

  test('CACHE_VERSION td-v6 갱신', async ({ page }) => {
    const swText = await page.evaluate(() => fetch('/sw.js').then(r => r.text()));
    expect(swText).toMatch(/CACHE_VERSION = 'td-v6'/);
  });
});

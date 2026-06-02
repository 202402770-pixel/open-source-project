// scripts/verify-full-viewport.spec.js
// 전체 viewport 풀 dogfood 검증 (PR-F)
// - 모바일 393×851 viewport-fit (PR-E가 1024+만 fix해서 모바일은 미해결이었음)
// - WORD_SPAWN_STAGGER_MS 단어 spawn 시차 (PR-E "1개씩 만료"가 60fps 호출에 즉사 → fix)
// - 데스크톱 2560×735 viewport-fit (PR-E 미디어쿼리 적용)

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Full Viewport Dogfood — PR-F', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('모바일 393×851 — Start scene 세로 스크롤 없음', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    const result = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      vpH: window.innerHeight,
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
    }));
    expect(result.hasVScroll).toBe(false);
  });

  test('모바일 393×851 — Play scene 세로 스크롤 없음', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      window.scrollTo(0, 0);
    });
    const result = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      vpH: window.innerHeight,
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
      playSceneMaxH: getComputedStyle(document.querySelector('.play-scene.is-active')).maxHeight,
    }));
    expect(result.hasVScroll).toBe(false);
    expect(result.playSceneMaxH).not.toBe('none');
  });

  test('모바일 — notebook-lines 숨김 (dead space 제거)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
    });
    const display = await page.evaluate(() => {
      const lines = document.querySelector('.play-scene.is-active .notebook-lines');
      return lines ? getComputedStyle(lines).display : null;
    });
    expect(display).toBe('none');
  });

  // PR-K: 기존 lifetime/stagger 시스템은 낙하 시스템으로 대체됨. 관련 테스트 폐기.
  // 낙하 검증은 verify-falling.spec.js 참조.

  test('데스크톱 2560×1440 — viewport-fit (PR-E 미디어쿼리 적용)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      window.scrollTo(0, 0);
    });
    const result = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      vpH: window.innerHeight,
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
    }));
    expect(result.hasVScroll).toBe(false);
  });
});

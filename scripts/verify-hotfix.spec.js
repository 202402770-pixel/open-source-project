// scripts/verify-hotfix.spec.js
// PR-E softPause / viewport-fit / window.game 노출
// (PR-K 이후: 만료 관련은 verify-falling으로 이관)

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Dogfood Hotfix — PR-E (after PR-K)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('softPause / softResume — 시간 정지·재개', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g.softPause();
      const paused = g.softPaused;
      g.softResume();
      const resumed = !g.softPaused;
      return { paused, resumed };
    });
    expect(result.paused).toBe(true);
    expect(result.resumed).toBe(true);
  });

  test('UI.openSettings → game.softPause 자동 발화', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      UI.openSettings();
      const afterOpen = window.game.softPaused;
      UI.closeSettings();
      const afterClose = window.game.softPaused;
      return { afterOpen, afterClose };
    });
    expect(result.afterOpen).toBe(true);
    expect(result.afterClose).toBe(false);
  });

  test('UI.openTutorial → game.softPause 자동 발화', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      UI.openTutorial(0);
      const afterOpen = window.game.softPaused;
      UI.closeTutorial();
      const afterClose = window.game.softPaused;
      return { afterOpen, afterClose };
    });
    expect(result.afterOpen).toBe(true);
    expect(result.afterClose).toBe(false);
  });

  test('window.game 노출 — start() 호출 후', async ({ page }) => {
    const result = await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      return {
        windowGameExists: !!window.game,
        gameInstance: window.game ? typeof window.game.softPause : null,
      };
    });
    expect(result.windowGameExists).toBe(true);
    expect(result.gameInstance).toBe('function');
  });

  test('1366×768 데스크톱 — play scene 세로 스크롤 없음', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      window.scrollTo(0, 0);
    });
    const { hasVScroll, playMaxH } = await page.evaluate(() => ({
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
      playMaxH: getComputedStyle(document.querySelector('.play-scene.is-active')).maxHeight,
    }));
    expect(hasVScroll).toBe(false);
    expect(playMaxH).not.toBe('none');
  });

  test('1920×1080 데스크톱 — play scene 세로 스크롤 없음', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      window.scrollTo(0, 0);
    });
    const hasVScroll = await page.evaluate(() =>
      document.documentElement.scrollHeight > window.innerHeight
    );
    expect(hasVScroll).toBe(false);
  });

  test('1600px+ Start scene — 카드 max-width 확장', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const cardW = await page.evaluate(() =>
      document.querySelector('.start-card').getBoundingClientRect().width
    );
    expect(cardW).toBeGreaterThan(900);
    expect(cardW).toBeLessThanOrEqual(1100);
  });
});

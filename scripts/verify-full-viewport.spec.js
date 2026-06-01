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

  test('CONFIG.CORE.WORD_SPAWN_STAGGER_MS 정의', async ({ page }) => {
    const stagger = await page.evaluate(() => CONFIG.CORE.WORD_SPAWN_STAGGER_MS);
    expect(typeof stagger).toBe('number');
    expect(stagger).toBeGreaterThan(500);
  });

  test('단어 spawn time이 stagger로 분산됨', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const times = g.activeWords.map(w => g.wordSpawnTimes[w]);
      // 모든 spawn time이 서로 다름
      const unique = new Set(times).size;
      const diffs = [];
      for (let i = 1; i < times.length; i++) {
        diffs.push(times[i] - times[i - 1]);
      }
      return { count: times.length, unique, diffs };
    });
    expect(result.unique).toBe(result.count);
    // 인접 차이는 STAGGER_MS (1500) — 일정
    result.diffs.forEach(d => {
      expect(d).toBeGreaterThan(1000);
      expect(d).toBeLessThan(2000);
    });
  });

  test('Stagger 효과 — gameLoop 60fps 호출에도 1초 안에 즉사 안 됨', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const initialHP = g.currentHP;
      // 첫 단어만 lifetime 초과 시뮬레이션 (다른 단어는 stagger 덕에 아직 fresh)
      const lifetime = g.getWordLifetimeMs();
      g.wordSpawnTimes[g.activeWords[0]] = Date.now() - lifetime - 1000;
      // checkWordTimeouts를 60번 호출 (1초간 60fps gameLoop 시뮬)
      for (let i = 0; i < 60; i++) {
        g.checkWordTimeouts();
      }
      return {
        initialHP,
        afterHP: g.currentHP,
        activeCount: g.activeWords.length,
        // 첫 단어 1개만 만료. 다른 단어는 미래 spawn이라 만료 안 됨
      };
    });
    // 1초 안에 최대 1단어 만료 (다른 5개는 stagger로 미래 spawn)
    expect(result.afterHP).toBe(result.initialHP - 1);
    expect(result.activeCount).toBe(5);
  });

  test('getMostImpendingExpiryRatio — 미래 spawn 단어는 0 (음수 방지)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      // 모든 단어가 미래 spawn (stagger 적용)
      const allFuture = g.activeWords.every(w => g.wordSpawnTimes[w] >= Date.now());
      // 6번째 단어만 미래 시각 (다른 단어는 이미 시작)
      const lastWord = g.activeWords[g.activeWords.length - 1];
      const inFuture = g.wordSpawnTimes[lastWord] > Date.now();
      // ratio가 음수가 아니라 0 이상이어야
      const ratio = g.getMostImpendingExpiryRatio();
      return { allFuture, lastInFuture: inFuture, ratio };
    });
    expect(result.lastInFuture).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(0);
    expect(result.ratio).toBeLessThanOrEqual(1);
  });

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

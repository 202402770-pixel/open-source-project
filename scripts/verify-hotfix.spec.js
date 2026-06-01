// scripts/verify-hotfix.spec.js
// Dogfood 핫픽스 검증 (PR-E)
// - 만료 1개씩만 처리 (6단어 동시 만료 → 즉사 방지)
// - softPause/softResume: Settings/Tutorial 모달 열림 시 + visibilitychange
// - 데스크톱 viewport-fit (1024px+, play-scene max-height 100vh)
// - Start card max-width (1600px+)
// - window.game 노출

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Dogfood Hotfix — PR-E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('만료 1개씩만 처리 — 6단어 동시 만료 상태에서 1회 호출에 1개만', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const past = Date.now() - lifetime * 3;
      Object.keys(g.wordSpawnTimes).forEach(w => { g.wordSpawnTimes[w] = past; });
      const initialHP = g.currentHP;
      const initialCount = g.activeWords.length;

      g.checkWordTimeouts();
      const after1 = { hp: g.currentHP, count: g.activeWords.length };
      g.checkWordTimeouts();
      const after2 = { hp: g.currentHP, count: g.activeWords.length };
      return { initialHP, initialCount, after1, after2 };
    });
    expect(result.initialCount).toBeGreaterThan(2);
    expect(result.after1.count).toBe(result.initialCount - 1);
    expect(result.after1.hp).toBe(result.initialHP - 1);
    expect(result.after2.count).toBe(result.initialCount - 2);
    expect(result.after2.hp).toBe(result.initialHP - 2);
  });

  test('만료 우선순위 — 가장 오래된 단어부터', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const words = [...g.activeWords];
      // 각 단어에 다른 spawn time — words[2]가 가장 오래된 것
      g.wordSpawnTimes[words[0]] = Date.now() - lifetime - 1000;
      g.wordSpawnTimes[words[1]] = Date.now() - lifetime - 2000;
      g.wordSpawnTimes[words[2]] = Date.now() - lifetime - 9000; // 가장 오래
      g.wordSpawnTimes[words[3]] = Date.now() - lifetime - 500;
      // 다른 단어들은 신선
      [4, 5].forEach(i => { if (words[i]) g.wordSpawnTimes[words[i]] = Date.now(); });

      g.checkWordTimeouts();
      return {
        expired: !g.activeWords.includes(words[2]),
        others: [0, 1, 3].every(i => g.activeWords.includes(words[i])),
      };
    });
    expect(result.expired).toBe(true);
    expect(result.others).toBe(true);
  });

  test('softPause / softResume — spawn time 보정', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const word = g.activeWords[0];
      const t0 = Date.now();
      g.wordSpawnTimes[word] = t0;

      g.softPause();
      const softPausedDuringPause = g.softPaused;

      // 인위적으로 일시정지 시간 시뮬 — _softPauseStart를 과거로
      g._softPauseStart = Date.now() - 3000;
      g.softResume();

      // spawn time이 3000ms 미래로 미뤄짐
      const adjusted = g.wordSpawnTimes[word];
      return {
        softPausedDuringPause,
        softPausedAfterResume: g.softPaused,
        // adjusted - t0 ≈ 3000
        diff: adjusted - t0,
      };
    });
    expect(result.softPausedDuringPause).toBe(true);
    expect(result.softPausedAfterResume).toBe(false);
    expect(result.diff).toBeGreaterThan(2500);
    expect(result.diff).toBeLessThan(3500);
  });

  test('softPaused 상태에서 checkWordTimeouts no-op', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const past = Date.now() - lifetime * 3;
      Object.keys(g.wordSpawnTimes).forEach(w => { g.wordSpawnTimes[w] = past; });

      g.softPause();
      const initialCount = g.activeWords.length;
      g.checkWordTimeouts();
      return { initialCount, afterCount: g.activeWords.length };
    });
    expect(result.afterCount).toBe(result.initialCount);
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
      if (window.game) {
        const f = Date.now() + 9e8;
        Object.keys(window.game.wordSpawnTimes).forEach(w => { window.game.wordSpawnTimes[w] = f; });
      }
      window.scrollTo(0, 0);
    });
    const { docH, vpH, hasVScroll, playMaxH } = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      vpH: window.innerHeight,
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
      playMaxH: getComputedStyle(document.querySelector('.play-scene.is-active')).maxHeight,
    }));
    expect(hasVScroll).toBe(false);
    expect(docH).toBeLessThanOrEqual(vpH);
    expect(playMaxH).not.toBe('none');
  });

  test('1920×1080 데스크톱 — play scene 세로 스크롤 없음', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) {
        const f = Date.now() + 9e8;
        Object.keys(window.game.wordSpawnTimes).forEach(w => { window.game.wordSpawnTimes[w] = f; });
      }
      window.scrollTo(0, 0);
    });
    const { hasVScroll } = await page.evaluate(() => ({
      hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
    }));
    expect(hasVScroll).toBe(false);
  });

  test('1600px+ Start scene — 카드 max-width 확장', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const cardW = await page.evaluate(() => {
      return document.querySelector('.start-card').getBoundingClientRect().width;
    });
    // 1100px (또는 92vw 중 작은 값) 적용 — 1920*92% = 1766, min(1100, 1766) = 1100
    expect(cardW).toBeGreaterThan(900);
    expect(cardW).toBeLessThanOrEqual(1100);
  });
});

// scripts/verify-effects.spec.js
// PR-U Effects.explodeWord + 처치/콤보 사운드

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Effects polish — PR-U', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('Effects.explodeWord 함수 정의 + 파티클 16개 생성', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof Effects.explodeWord !== 'function') return { has: false };
      Effects.explodeWord(500, 300, { isBoss: false });
      const particles = document.querySelectorAll('.td-explode-particle');
      return { has: true, count: particles.length };
    });
    expect(result.has).toBe(true);
    expect(result.count).toBe(16);
  });

  test('보스 단어 explodeWord — 파티클 24개 + 더 강한 효과', async ({ page }) => {
    const result = await page.evaluate(() => {
      Effects.explodeWord(500, 300, { isBoss: true });
      const particles = document.querySelectorAll('.td-explode-particle');
      return {
        count: particles.length,
        sample: particles[0]?.style.background,
      };
    });
    expect(result.count).toBe(24);
    expect(result.sample).toBeTruthy();
  });

  test('처치 시 GameAPI.onWordDestroyed → explodeWord 라우팅', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      window.game = g;
      g._lastSpawnAt = Date.now() - 9999;
      g._countdownActive = false;
      g.update();
      const w = g.fallingWords[0];
      // 단어 통째 입력 → 자동 처치
      for (const c of w.text) g.handleCharInput(c);
      await new Promise(r => setTimeout(r, 50));
      return {
        successWords: g.successWords,
        // explodeWord가 호출되면 DOM에 td-explode-particle 생성됨
        particles: document.querySelectorAll('.td-explode-particle').length,
      };
    });
    expect(result.successWords).toBe(1);
    expect(result.particles).toBeGreaterThan(0);
  });

  test('콤보 10 도달 시 levelUp 사운드 호출 (Sound.play 추적)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      window.game = g;
      const calls = [];
      const orig = Sound.play;
      Sound.play = function(name, vol) {
        calls.push({ name, vol });
        return orig.call(this, name, vol);
      };
      // 콤보 10 도달 시뮬 (combo 9 → +1)
      g.combo = 9;
      g._lastSpawnAt = Date.now() - 9999;
      g._countdownActive = false;
      g.update();
      const w = g.fallingWords[0];
      for (const c of w.text) g.handleCharInput(c);
      Sound.play = orig;
      const hasLevelUp = calls.some(c => c.name === 'levelUp' && c.vol >= 0.4);
      return { combo: g.combo, hasLevelUp, calls };
    });
    expect(result.combo).toBe(10);
    expect(result.hasLevelUp).toBe(true);
  });

  test('prefers-reduced-motion — explodeWord가 강한 파티클 생성 안 함', async ({ page }) => {
    const result = await page.evaluate(() => {
      const orig = window.matchMedia;
      window.matchMedia = (q) => ({ matches: q.includes('reduced'), media: q, addListener: () => {}, removeListener: () => {} });
      Effects.explodeWord(100, 100, { isBoss: false });
      window.matchMedia = orig;
      return {
        explode: document.querySelectorAll('.td-explode-particle').length,
      };
    });
    // reduced-motion 사용자에겐 강한 explode 효과 스킵
    expect(result.explode).toBe(0);
  });
});

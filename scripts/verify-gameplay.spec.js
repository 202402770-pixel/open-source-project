// scripts/verify-gameplay.spec.js
// PR-T 게임플레이 polish — READY 카운트다운 + closest 강조

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Gameplay Polish — PR-T', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('countdown overlay DOM 존재 + 초기 hidden', async ({ page }) => {
    const result = await page.evaluate(() => {
      const overlay = document.getElementById('countdown-overlay');
      const value = document.getElementById('countdown-value');
      return {
        hasOverlay: !!overlay,
        hasValue: !!value,
        initialHidden: overlay?.classList.contains('hidden'),
      };
    });
    expect(result.hasOverlay).toBe(true);
    expect(result.hasValue).toBe(true);
    expect(result.initialHidden).toBe(true);
  });

  test('UI.showCountdown — game._countdownActive set + overlay visible', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      window.game = g;
      UI.showCountdown(g);  // 의도적 await X — 비동기 시작 후 즉시 검사
      await new Promise(r => setTimeout(r, 50));
      return {
        countdownActive: g._countdownActive,
        overlayVisible: !document.getElementById('countdown-overlay').classList.contains('hidden'),
        firstText: document.getElementById('countdown-value').textContent,
      };
    });
    expect(result.countdownActive).toBe(true);
    expect(result.overlayVisible).toBe(true);
    expect(result.firstText).toBe('3');
  });

  test('카운트다운 중 update() no-op (spawn / 낙하 정지)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._countdownActive = true;
      g._lastSpawnAt = Date.now() - 9999; // spawn interval 초과
      g.update();
      const after1 = g.fallingWords.length;
      g._lastUpdateAt = Date.now() - 500;
      g.update();
      const after2 = g.fallingWords.length;
      return { after1, after2 };
    });
    expect(result.after1).toBe(0);
    expect(result.after2).toBe(0);
  });

  test('가장 가까운 단어 — is-closest 클래스', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      window.game._lastSpawnAt = Date.now() - 9999;
      // 단어 2개 spawn
      window.game._countdownActive = false;
      window.game.update();
      window.game._lastSpawnAt = Date.now() - 9999;
      window.game.update();
      // y 강제 — w[1]을 더 아래로
      if (window.game.fallingWords[1]) window.game.fallingWords[1].y = 60;
      if (window.game.fallingWords[0]) window.game.fallingWords[0].y = 20;
      UI.renderFallingWords(window.game);
      const closestEls = document.querySelectorAll('.falling-word.is-closest');
      return {
        closestCount: closestEls.length,
        // y=60인 단어 (두 번째)가 closest여야
        closestText: closestEls[0]?.textContent,
        secondWordText: window.game.fallingWords[1]?.text,
      };
    });
    expect(result.closestCount).toBe(1);
    expect(result.closestText).toBe(result.secondWordText);
  });

  test('lock된 단어가 있으면 closest 표시 없음', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      window.game._lastSpawnAt = Date.now() - 9999;
      window.game._countdownActive = false;
      window.game.update();
      const w = window.game.fallingWords[0];
      window.game.handleCharInput(w.text[0]); // lock
      UI.renderFallingWords(window.game);
      return {
        lockedCount: document.querySelectorAll('.falling-word.is-locked').length,
        closestCount: document.querySelectorAll('.falling-word.is-closest').length,
      };
    });
    expect(result.lockedCount).toBe(1);
    expect(result.closestCount).toBe(0);  // lock 있으면 closest 안 표시
  });
});

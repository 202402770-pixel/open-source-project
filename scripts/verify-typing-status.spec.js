// scripts/verify-typing-status.spec.js
// PR-L: 노트북 panel 키보드 입력 시각 cue 검증

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Typing Status — PR-L', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('typing-status DOM 존재 + 초기엔 empty 표시', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      UI.updateTypingStatus(window.game);
      const empty = document.getElementById('typing-status-empty');
      const word = document.getElementById('typing-status-word');
      return {
        hasEmpty: !!empty,
        hasWord: !!word,
        emptyVisible: empty && !empty.hidden,
        wordHidden: word?.hidden,
      };
    });
    expect(result.hasEmpty).toBe(true);
    expect(result.hasWord).toBe(true);
    expect(result.emptyVisible).toBe(true);
    expect(result.wordHidden).toBe(true);
  });

  test('lock 시 typed/untyped 분할 표시', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      window.game._lastSpawnAt = Date.now() - 9999;
      window.game.update();
      const w = window.game.fallingWords[0];
      window.game.handleCharInput(w.text[0]);
      window.game.handleCharInput(w.text[1]);
      UI.updateTypingStatus(window.game);
      return {
        typed: document.getElementById('ts-typed').textContent,
        untyped: document.getElementById('ts-untyped').textContent,
        emptyHidden: document.getElementById('typing-status-empty').hidden,
        wordHidden: document.getElementById('typing-status-word').hidden,
        expectedTyped: w.text.slice(0, 2),
        expectedUntyped: w.text.slice(2),
      };
    });
    expect(result.typed).toBe(result.expectedTyped);
    expect(result.untyped).toBe(result.expectedUntyped);
    expect(result.emptyHidden).toBe(true);
    expect(result.wordHidden).toBe(false);
  });

  test('단어 처치 후 다시 empty 표시', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      window.game._lastSpawnAt = Date.now() - 9999;
      window.game.update();
      const w = window.game.fallingWords[0];
      for (const c of w.text) window.game.handleCharInput(c);
      UI.updateTypingStatus(window.game);
      return {
        emptyHidden: document.getElementById('typing-status-empty').hidden,
        wordHidden: document.getElementById('typing-status-word').hidden,
        lockedId: window.game.lockedWordId,
      };
    });
    expect(result.lockedId).toBeNull();
    expect(result.emptyHidden).toBe(false);
    expect(result.wordHidden).toBe(true);
  });

  test('hidden-input은 시각 hidden (opacity 0)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const hi = document.getElementById('hidden-input');
      const cs = getComputedStyle(hi);
      return { opacity: cs.opacity, display: cs.display };
    });
    expect(result.opacity).toBe('0');
    expect(result.display).not.toBe('none');
  });

  test('typing-status가 viewport 안 (1920×1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const result = await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      const ts = document.getElementById('typing-status');
      const r = ts.getBoundingClientRect();
      return {
        inView: r.top >= 0 && r.bottom <= window.innerHeight,
        height: Math.round(r.height),
      };
    });
    expect(result.inView).toBe(true);
    expect(result.height).toBeGreaterThan(30);
  });

  test('typing-status가 모바일 viewport 안 (393×851)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    const result = await page.evaluate(async () => {
      document.querySelector('[data-go="play"]').click();
      await new Promise(r => setTimeout(r, 300));
      if (window.game) window.game.softPause();
      const ts = document.getElementById('typing-status');
      const r = ts.getBoundingClientRect();
      return {
        inView: r.top >= 0 && r.bottom <= window.innerHeight,
        height: Math.round(r.height),
      };
    });
    expect(result.inView).toBe(true);
    expect(result.height).toBeGreaterThan(30);
  });
});

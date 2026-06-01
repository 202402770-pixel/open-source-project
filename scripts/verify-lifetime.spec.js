// scripts/verify-lifetime.spec.js
// 단어 시간 제한 시스템 검증 (PR-D / D-1 시안)
// - CONFIG WORD_LIFETIME_MS + DIFFICULTY.wordLifetimeMult
// - Game.getWordLifetimeMs / checkWordTimeouts / _expireWord
// - getMostImpendingExpiryRatio
// - UI.updateWordDanger (.danger / .critical 클래스)
// - Zen 모드는 시간 제한 없음

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Word Lifetime — PR-D', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('CONFIG: WORD_LIFETIME_MS / WARN_RATIO / CRITICAL_RATIO 정의', async ({ page }) => {
    const cfg = await page.evaluate(() => ({
      lifetime: CONFIG.CORE.WORD_LIFETIME_MS,
      warn: CONFIG.CORE.WORD_LIFETIME_WARN_RATIO,
      critical: CONFIG.CORE.WORD_LIFETIME_CRITICAL_RATIO,
      easyMult: CONFIG.DIFFICULTY.easy.wordLifetimeMult,
      normalMult: CONFIG.DIFFICULTY.normal.wordLifetimeMult,
      hardMult: CONFIG.DIFFICULTY.hard.wordLifetimeMult,
    }));
    expect(cfg.lifetime).toBe(8000);
    expect(cfg.warn).toBeGreaterThan(0);
    expect(cfg.critical).toBeGreaterThan(cfg.warn);
    expect(cfg.easyMult).toBeGreaterThan(cfg.normalMult);
    expect(cfg.hardMult).toBeLessThan(cfg.normalMult);
  });

  test('getWordLifetimeMs — 난이도별 분기 (easy > normal > hard)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const easyG = new Game('classic', 'easy');
      const normG = new Game('classic', 'normal');
      const hardG = new Game('classic', 'hard');
      return {
        easy: easyG.getWordLifetimeMs(),
        normal: normG.getWordLifetimeMs(),
        hard: hardG.getWordLifetimeMs(),
      };
    });
    expect(result.easy).toBeGreaterThan(result.normal);
    expect(result.hard).toBeLessThan(result.normal);
    expect(result.normal).toBe(8000);
  });

  test('Zen 모드 — getWordLifetimeMs Infinity, checkWordTimeouts no-op', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('zen', 'normal');
      const initialWords = [...g.activeWords];
      // 매우 오래된 spawn time으로 만들어도 만료 안 됨
      initialWords.forEach(w => { g.wordSpawnTimes[w] = Date.now() - 9999999; });
      const beforeLen = g.activeWords.length;
      g.checkWordTimeouts();
      return {
        lifetime: g.getWordLifetimeMs(),
        beforeLen,
        afterLen: g.activeWords.length,
        ratio: g.getMostImpendingExpiryRatio(),
      };
    });
    expect(result.lifetime).toBe(Infinity);
    expect(result.afterLen).toBe(result.beforeLen);
    expect(result.ratio).toBe(0);
  });

  test('checkWordTimeouts — 만료 단어 expire + takeDamage', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const initialHP = g.currentHP;
      const initialWords = [...g.activeWords];
      // 첫 단어만 만료 처리 (다른 단어는 그대로)
      const expiringWord = initialWords[0];
      g.wordSpawnTimes[expiringWord] = Date.now() - 99999;
      g.checkWordTimeouts();
      return {
        initialHP,
        afterHP: g.currentHP,
        wordRemoved: !g.activeWords.includes(expiringWord),
        spawnTimeRemoved: g.wordSpawnTimes[expiringWord] === undefined,
        missed: g.missed,
      };
    });
    expect(result.afterHP).toBe(result.initialHP - 1);
    expect(result.wordRemoved).toBe(true);
    expect(result.spawnTimeRemoved).toBe(true);
    expect(result.missed).toBe(1);
  });

  test('만료 시 콤보 끊김', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g.combo = 25;
      const word = g.activeWords[0];
      g.wordSpawnTimes[word] = Date.now() - 99999;
      g.checkWordTimeouts();
      return { combo: g.combo };
    });
    expect(result.combo).toBe(0);
  });

  test('정답 시 wordSpawnTimes에서 단어 제거', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      window.UI = window.UI || { renderTargetWord: () => {}, updateHUD: () => {} };
      const targetWord = g.activeWords[0];
      g.handleSuccess(0, targetWord);
      return {
        removedFromActive: !g.activeWords.includes(targetWord),
        removedFromSpawnTimes: g.wordSpawnTimes[targetWord] === undefined,
      };
    });
    expect(result.removedFromActive).toBe(true);
    expect(result.removedFromSpawnTimes).toBe(true);
  });

  test('getMostImpendingExpiryRatio — 0~1 범위', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const word = g.activeWords[0];

      // 신선한 단어 — ratio ≈ 0
      g.wordSpawnTimes[word] = Date.now();
      const fresh = g.getMostImpendingExpiryRatio();

      // 절반 경과 — ratio ≈ 0.5
      g.wordSpawnTimes[word] = Date.now() - lifetime * 0.5;
      const half = g.getMostImpendingExpiryRatio();

      // 만료 임박 — ratio ≈ 1 (cap)
      g.wordSpawnTimes[word] = Date.now() - lifetime * 2;
      const overdue = g.getMostImpendingExpiryRatio();

      return { fresh, half, overdue };
    });
    expect(result.fresh).toBeLessThan(0.05);
    expect(result.half).toBeGreaterThan(0.4);
    expect(result.half).toBeLessThan(0.6);
    expect(result.overdue).toBe(1);
  });

  test('UI.updateWordDanger — ratio 75% → .danger', async ({ page }) => {
    const cls = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const word = g.activeWords[0];
      g.wordSpawnTimes[word] = Date.now() - lifetime * 0.75;
      UI.updateWordDanger(g);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('danger');
    expect(cls).not.toContain('critical');
  });

  test('UI.updateWordDanger — ratio 90% → .critical', async ({ page }) => {
    const cls = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const word = g.activeWords[0];
      g.wordSpawnTimes[word] = Date.now() - lifetime * 0.9;
      UI.updateWordDanger(g);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('critical');
    expect(cls).not.toContain(' danger '); // critical만 적용
  });

  test('UI.updateWordDanger — ratio 30% → 클래스 제거', async ({ page }) => {
    const cls = await page.evaluate(async () => {
      const notebook = document.querySelector('.notebook-input');
      notebook.classList.add('critical'); // 미리 더럽힘
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      const lifetime = g.getWordLifetimeMs();
      const word = g.activeWords[0];
      g.wordSpawnTimes[word] = Date.now() - lifetime * 0.3;
      UI.updateWordDanger(g);
      return notebook.className;
    });
    expect(cls).not.toContain('danger');
    expect(cls).not.toContain('critical');
  });

  test('레벨업 시 새 단어들에 spawn time 재기록', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.UI = window.UI || { renderTargetWord: () => {}, updateHUD: () => {}, showToast: () => {} };
      const g = new Game('classic', 'normal');
      const oldLevel = g.level;
      // 단어 다 처리하면 levelUp
      while (g.activeWords.length > 0) {
        const w = g.activeWords[0];
        g.handleSuccess(0, w);
      }
      const newWords = [...g.activeWords];
      const allHaveSpawn = newWords.every(w => typeof g.wordSpawnTimes[w] === 'number');
      return { oldLevel, newLevel: g.level, newWordCount: newWords.length, allHaveSpawn };
    });
    expect(result.newLevel).toBeGreaterThan(result.oldLevel);
    if (result.newWordCount > 0) expect(result.allHaveSpawn).toBe(true);
  });
});

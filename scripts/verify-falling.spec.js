// scripts/verify-falling.spec.js
// PR-K 정통 타이핑 디펜스 검증
// - fallingWords spawn / 낙하 / 충돌
// - handleCharInput 첫 글자 lock / 마지막 글자 자동 처치 / 오타 무시
// - UI.renderFallingWords DOM 동기화
// - softPause / 보스 / 콤보

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Falling Words — PR-K', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('초기 상태 — fallingWords 빈 배열, wordPool 채워짐', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      return {
        fallingCount: g.fallingWords.length,
        poolLen: g.wordPool.length,
        lockedId: g.lockedWordId,
      };
    });
    expect(result.fallingCount).toBe(0);
    expect(result.poolLen).toBeGreaterThan(0);
    expect(result.lockedId).toBeNull();
  });

  test('update() 호출 시 spawn — 첫 단어 등장', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastUpdateAt = Date.now() - 100;
      g._lastSpawnAt = Date.now() - 9999; // spawn interval 충족
      g.update();
      return {
        fallingCount: g.fallingWords.length,
        firstWord: g.fallingWords[0]?.text,
        firstX: g.fallingWords[0]?.x,
        firstY: g.fallingWords[0]?.y,
      };
    });
    expect(result.fallingCount).toBe(1);
    expect(result.firstWord).toBeTruthy();
    expect(result.firstX).toBeGreaterThanOrEqual(8);
    expect(result.firstX).toBeLessThanOrEqual(88);
    expect(result.firstY).toBe(0);
  });

  test('update() 낙하 — 시간 지나면 y 증가', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update(); // spawn
      const word = g.fallingWords[0];
      const y1 = word.y;
      // 0.5초 시뮬레이션
      g._lastUpdateAt = Date.now() - 500;
      g.update();
      const y2 = word.y;
      return { y1, y2, speed: word.speed };
    });
    expect(result.y2).toBeGreaterThan(result.y1);
  });

  test('handleCharInput 첫 글자 매칭 → lock', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      const word = g.fallingWords[0];
      g.handleCharInput(word.text[0]);
      return {
        lockedId: g.lockedWordId,
        lockedIdMatches: g.lockedWordId === word.id,
        typedIdx: word.typedIndex,
      };
    });
    expect(result.lockedIdMatches).toBe(true);
    expect(result.typedIdx).toBe(1);
  });

  test('마지막 글자 자동 처치 — score + combo + 단어 제거 + lock 해제', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      const word = g.fallingWords[0];
      for (const c of word.text) g.handleCharInput(c);
      return {
        score: g.score,
        combo: g.combo,
        successWords: g.successWords,
        lockedId: g.lockedWordId,
        wordGone: !g.fallingWords.find(w => w.id === word.id),
      };
    });
    expect(result.score).toBe(10);
    expect(result.combo).toBe(1);
    expect(result.successWords).toBe(1);
    expect(result.lockedId).toBeNull();
    expect(result.wordGone).toBe(true);
  });

  test('오타 — lock 유지 + typedIndex 그대로', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      const word = g.fallingWords[0];
      g.handleCharInput(word.text[0]); // lock
      g.handleCharInput('!'); // 오타
      return { lockedId: g.lockedWordId, typedIdx: word.typedIndex };
    });
    expect(result.lockedId).not.toBeNull();
    expect(result.typedIdx).toBe(1); // 안 늘어남
  });

  test('바닥 도달 → _expireWord + takeDamage + 콤보 끊김', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      const word = g.fallingWords[0];
      g.combo = 5;
      word.y = 100; // 바닥 강제
      const hpBefore = g.currentHP;
      g.update();
      return {
        hpBefore,
        hpAfter: g.currentHP,
        missed: g.missed,
        combo: g.combo,
        wordGone: !g.fallingWords.find(w => w.id === word.id),
      };
    });
    expect(result.hpAfter).toBe(result.hpBefore - 1);
    expect(result.missed).toBe(1);
    expect(result.combo).toBe(0);
    expect(result.wordGone).toBe(true);
  });

  test('softPause 시 update no-op (낙하/spawn 둘 다)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update(); // 첫 spawn
      const y1 = g.fallingWords[0].y;
      const count1 = g.fallingWords.length;

      g.softPause();
      g._lastUpdateAt = Date.now() - 500;
      g.update(); // softPaused
      return {
        y1, y2: g.fallingWords[0].y,
        count1, count2: g.fallingWords.length,
      };
    });
    expect(result.y2).toBe(result.y1);
    expect(result.count2).toBe(result.count1);
  });

  test('UI.renderFallingWords — DOM에 .falling-word 요소 동기화', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'normal');
      window.game._lastSpawnAt = Date.now() - 9999;
      window.game.update();
      window.game.update(); // 1~2 단어
      UI.renderFallingWords(window.game);
      const els = document.querySelectorAll('.falling-word');
      return {
        domCount: els.length,
        gameCount: window.game.fallingWords.length,
        firstText: els[0]?.textContent,
      };
    });
    expect(result.domCount).toBe(result.gameCount);
    expect(result.domCount).toBeGreaterThan(0);
    expect(result.firstText).toBeTruthy();
  });

  test('보스 단어 — Lv3+ 등장 확률 (강제 trigger)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('classic', 'normal');
      g.level = 5;
      // Math.random을 0.01로 강제 (BOSS.PROBABILITY 0.05보다 작음)
      const origRandom = Math.random;
      Math.random = () => 0.01;
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      Math.random = origRandom;
      return {
        firstIsBoss: g.fallingWords[0]?.isBoss,
      };
    });
    expect(result.firstIsBoss).toBe(true);
  });

  test('Zen 모드 — 바닥 도달해도 HP 안 깎임', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const g = new Game('zen', 'normal');
      g._lastSpawnAt = Date.now() - 9999;
      g.update();
      const word = g.fallingWords[0];
      word.y = 100;
      g.update();
      return {
        hp: g.currentHP,
        missed: g.missed,
      };
    });
    expect(result.hp).toBe(Infinity);
    // missed는 그래도 증가 (통계용)
    expect(result.missed).toBe(1);
  });
});

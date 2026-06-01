// scripts/verify-feedback.spec.js
// 시각/입력 피드백 polish 검증 (PR-B)
// - 콤보 글로우 3단계 (10/20/30)
// - 단어 실패 시 body shake
// - 재시작/goToMenu soft (location.reload 제거)
// - Input/PauseControls idempotent

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Feedback Polish — PR-B', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('CONFIG.SCORING.COMBO_GLOW_TIERS 정의 — [10, 20, 30]', async ({ page }) => {
    const tiers = await page.evaluate(() => CONFIG.SCORING.COMBO_GLOW_TIERS);
    expect(tiers).toEqual([10, 20, 30]);
  });

  test('콤보 글로우 1단계 (콤보 10~19) → glow-combo10', async ({ page }) => {
    const cls = await page.evaluate(() => {
      Effects.toggleGlow(true, 15);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('glow-combo10');
    expect(cls).not.toContain('glow-combo20');
    expect(cls).not.toContain('glow-combo30');
  });

  test('콤보 글로우 2단계 (콤보 20~29) → glow-combo20', async ({ page }) => {
    const cls = await page.evaluate(() => {
      Effects.toggleGlow(true, 25);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('glow-combo20');
    expect(cls).not.toContain('glow-combo10');
    expect(cls).not.toContain('glow-combo30');
  });

  test('콤보 글로우 3단계 (콤보 30+) → glow-combo30', async ({ page }) => {
    const cls = await page.evaluate(() => {
      Effects.toggleGlow(true, 42);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('glow-combo30');
    expect(cls).not.toContain('glow-combo20');
    expect(cls).not.toContain('glow-combo10');
  });

  test('콤보 끊김 → toggleGlow(false) → 모든 단계 클래스 제거', async ({ page }) => {
    const cls = await page.evaluate(() => {
      Effects.toggleGlow(true, 35);
      Effects.toggleGlow(false);
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).not.toMatch(/glow-combo(5|10|20|30)/);
  });

  test('단계 전환 시 이전 클래스 제거 (10 → 20 → 30)', async ({ page }) => {
    const classes = await page.evaluate(() => {
      const el = document.querySelector('.notebook-input');
      Effects.toggleGlow(true, 12);
      const after10 = el.className;
      Effects.toggleGlow(true, 22);
      const after20 = el.className;
      Effects.toggleGlow(true, 32);
      const after30 = el.className;
      return { after10, after20, after30 };
    });
    expect(classes.after10).toMatch(/glow-combo10/);
    expect(classes.after10).not.toMatch(/glow-combo(20|30)/);
    expect(classes.after20).toMatch(/glow-combo20/);
    expect(classes.after20).not.toMatch(/glow-combo(10|30)/);
    expect(classes.after30).toMatch(/glow-combo30/);
    expect(classes.after30).not.toMatch(/glow-combo(10|20)/);
  });

  test('문자열 인자 호환 — toggleGlow(true, "combo10")', async ({ page }) => {
    const cls = await page.evaluate(() => {
      Effects.toggleGlow(true, 'combo10');
      return document.querySelector('.notebook-input').className;
    });
    expect(cls).toContain('glow-combo10');
  });

  test('handleFailure → triggerErrorShake 발화 (body.shake)', async ({ page }) => {
    // 게임 시작 → 잘못된 단어 제출
    await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'easy');
      // handleFailure 직접 호출 (단어 미스 시뮬레이션)
      window.game.handleFailure();
    });
    // shake 클래스는 300ms 후 자동 제거됨. 동기 호출 직후엔 적용돼야 함.
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain('shake');
  });

  test('재시작 버튼 — location.reload 제거 (페이지 유지)', async ({ page }) => {
    // location.reload가 호출되는지 감시
    const reloaded = await page.evaluate(() => {
      let reloadCalled = false;
      const origReload = location.reload.bind(location);
      // location.reload는 readonly라 정확한 감시는 어렵지만,
      // 페이지 이동 시 navigation 이벤트 발생함을 활용하지 않고
      // restart 버튼 클릭이 동기적으로 reload를 호출하지 않는지 확인.
      // 대안: restart 버튼 핸들러 코드에 'reload' 문자열 없음 검증
      const handlerSrc = document.getElementById('restart-btn') ? 'inline' : 'none';
      return { handlerSrc };
    });
    // Game.js goToMenu 와 main.js restartBtn 핸들러 둘 다 reload 제거됐는지 소스 검사
    const sources = await page.evaluate(async () => {
      const game = await fetch('/js/game.js').then(r => r.text());
      const main = await fetch('/js/main.js').then(r => r.text());
      return {
        gameHasReload: /location\.reload\s*\(/.test(game),
        mainHasReload: /location\.reload\s*\(/.test(main),
      };
    });
    expect(sources.gameHasReload).toBe(false);
    expect(sources.mainHasReload).toBe(false);
  });

  test('Game.goToMenu — UI.showScene("start") 호출 + window.game = null', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.game = new Game('classic', 'easy');
      window.game.goToMenu();
      const startActive = document.querySelector('[data-scene="start"]').classList.contains('is-active');
      return { startActive, gameIsNull: window.game === null };
    });
    expect(result.startActive).toBe(true);
    expect(result.gameIsNull).toBe(true);
  });

  test('Input.init idempotent — 두 번 호출해도 콜백만 갱신', async ({ page }) => {
    const result = await page.evaluate(() => {
      let counter = 0;
      const cb1 = () => { counter += 1; };
      const cb2 = () => { counter += 10; };

      // 첫 호출 — 리스너 등록
      Input.init(cb1, () => {});
      const inputEl = document.getElementById('hidden-input');
      inputEl.value = 'a';
      inputEl.dispatchEvent(new Event('input'));

      // 두 번째 호출 — 콜백 교체만
      Input.init(cb2, () => {});
      inputEl.value = 'ab';
      inputEl.dispatchEvent(new Event('input'));

      // 첫 호출의 cb1이 두 번째 input 이벤트에서 또 호출되면 11 (1+10), 갱신되면 11 OK이지만
      // 만약 리스너가 중복되면 첫 호출 시 1, 두 번째 시 12 (cb1+cb2 둘 다) = 총 13.
      // 갱신만 되면: 첫 호출 cb1 발화 (counter=1), 두 번째 cb2 발화 (counter=11).
      return { counter, initialized: Input._initialized };
    });
    expect(result.counter).toBe(11);
    expect(result.initialized).toBe(true);
  });
});

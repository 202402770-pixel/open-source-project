// scripts/verify-modes.spec.js
// PR-I 모드별 차이 가시화 검증
// - mode-badge: 4모드 다른 텍스트 + 색상
// - HP panel: Zen은 숨김 / 나머지는 표시
// - board-timer: Classic 경과(TIME) / Time Attack 카운트다운(TIME LEFT) /
//                Zen 카운트다운(ZEN) / Daily 경과(DAILY)
// - 실시간 갱신 (1초 후 시간 변화)

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

const MODES = [
  { key: 'classic',    label: 'CLASSIC',      timerLabel: 'TIME',      hpVisible: true,  countdown: false },
  { key: 'timeattack', label: 'TIME ATTACK',  timerLabel: 'TIME LEFT', hpVisible: true,  countdown: true },
  { key: 'zen',        label: 'ZEN',          timerLabel: 'ZEN',       hpVisible: false, countdown: true },
  { key: 'daily',      label: 'DAILY',        timerLabel: 'DAILY',     hpVisible: true,  countdown: false },
];

test.describe('Mode Differences — PR-I', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  for (const m of MODES) {
    test(`${m.key} — 배지 "${m.label}" + 타이머 "${m.timerLabel}" + HP ${m.hpVisible ? '표시' : '숨김'}`, async ({ page }) => {
      const result = await page.evaluate(async (modeKey) => {
        await WordData.loadWords();
        window.game = null;
        window.selectedMode = modeKey;
        await window.start(modeKey, 'normal');
        if (window.game) window.game.softPause();
        await new Promise(r => setTimeout(r, 50));
        UI.updateHUD(window.game);

        return {
          badge: document.getElementById('mode-badge')?.textContent,
          badgeData: document.getElementById('mode-badge')?.dataset.mode,
          hpDisplay: getComputedStyle(document.getElementById('hp-panel')).display,
          timerLabel: document.getElementById('board-timer-label')?.textContent,
          timerValue: document.getElementById('board-timer-value')?.textContent,
        };
      }, m.key);

      expect(result.badge).toBe(m.label);
      expect(result.badgeData).toBe(m.key);
      expect(result.timerLabel).toBe(m.timerLabel);
      expect(result.timerValue).toMatch(/^\d{2}:\d{2}$/);
      if (m.hpVisible) {
        expect(result.hpDisplay).not.toBe('none');
      } else {
        expect(result.hpDisplay).toBe('none');
      }
    });
  }

  test('Time Attack 카운트다운 — 시간이 줄어듦', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.selectedMode = 'timeattack';
      await window.start('timeattack', 'normal');
      // softPause 없이 시간 흐르게
      await new Promise(r => setTimeout(r, 100));
      UI.updateHUD(window.game);
      const t1 = document.getElementById('board-timer-value').textContent;
      await new Promise(r => setTimeout(r, 1500));
      UI.updateHUD(window.game);
      const t2 = document.getElementById('board-timer-value').textContent;
      window.game.isGameOver = true;
      return { t1, t2 };
    });
    // mm:ss → 초 변환
    const toSec = (s) => { const [m, ss] = s.split(':').map(Number); return m * 60 + ss; };
    expect(toSec(result.t2)).toBeLessThan(toSec(result.t1));
  });

  test('Classic 경과 시간 — 시간이 증가', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      window.selectedMode = 'classic';
      await window.start('classic', 'normal');
      await new Promise(r => setTimeout(r, 100));
      UI.updateHUD(window.game);
      const t1 = document.getElementById('board-timer-value').textContent;
      await new Promise(r => setTimeout(r, 1500));
      UI.updateHUD(window.game);
      const t2 = document.getElementById('board-timer-value').textContent;
      window.game.isGameOver = true;
      return { t1, t2 };
    });
    const toSec = (s) => { const [m, ss] = s.split(':').map(Number); return m * 60 + ss; };
    expect(toSec(result.t2)).toBeGreaterThan(toSec(result.t1));
  });
});

// scripts/verify-comprehensive.spec.js
// PR-J 종합 viewport 검증
// 7 viewport × Start/Play 깨짐 없음 + 모드 배지 / 타이머

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'netbook 1024×600',    w: 1024, h: 600,  minWFH: 80 },
  { name: 'HD 1280×720',         w: 1280, h: 720,  minWFH: 100 },
  { name: 'laptop 1366×768',     w: 1366, h: 768,  minWFH: 100 },
  { name: 'desktop 1920×1080',   w: 1920, h: 1080, minWFH: 100 },
  { name: '4K 2560×1440',        w: 2560, h: 1440, minWFH: 100 },
  { name: 'tablet 768×1024',     w: 768,  h: 1024, minWFH: 80 },
  { name: 'mobile 393×851',      w: 393,  h: 851,  minWFH: 80 },
];

test.describe('Comprehensive Viewport — PR-J', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} — Start + Play 깨짐 없음`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('tutorial_done', 'true');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Start scene
      const startCheck = await page.evaluate(() => {
        const sc = document.querySelector('.start-card');
        const r = sc.getBoundingClientRect();
        return {
          hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
          cardFits: r.top >= 0 && r.bottom <= window.innerHeight,
        };
      });
      expect(startCheck.hasVScroll).toBe(false);
      expect(startCheck.cardFits).toBe(true);

      // Play scene
      const playCheck = await page.evaluate(async () => {
        document.querySelector('[data-go="play"]').click();
        await new Promise(r => setTimeout(r, 600));
        if (window.game) window.game.softPause();
        const wf = document.querySelector('.word-field').getBoundingClientRect();
        return {
          hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
          wfH: Math.round(wf.height),
          wfFits: wf.top >= 0 && wf.bottom <= window.innerHeight,
          modeBadge: document.getElementById('mode-badge')?.textContent,
          timerLabel: document.getElementById('board-timer-label')?.textContent,
        };
      });
      expect(playCheck.hasVScroll).toBe(false);
      expect(playCheck.wfH).toBeGreaterThanOrEqual(vp.minWFH);
      expect(playCheck.wfFits).toBe(true);
      expect(playCheck.modeBadge).toBeTruthy();
      expect(playCheck.timerLabel).toBeTruthy();
    });
  }
});

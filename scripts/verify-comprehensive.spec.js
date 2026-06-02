// scripts/verify-comprehensive.spec.js
// PR-J 종합 viewport 검증
// 8 viewport × Start/Play 모두 깨짐 없음 + 작은 세로 viewport에서도 fit

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'netbook 1024×600',    w: 1024, h: 600,  rotateExpected: false, minWFH: 90 },
  { name: 'HD 1280×720',         w: 1280, h: 720,  rotateExpected: false, minWFH: 120 },
  { name: 'laptop 1366×768',     w: 1366, h: 768,  rotateExpected: false, minWFH: 120 },
  { name: 'desktop 1920×1080',   w: 1920, h: 1080, rotateExpected: false, minWFH: 160 },
  { name: '4K 2560×1440',        w: 2560, h: 1440, rotateExpected: false, minWFH: 200 },
  { name: 'tablet 768×1024',     w: 768,  h: 1024, rotateExpected: false, minWFH: 90 },
  { name: 'mobile 393×851',      w: 393,  h: 851,  rotateExpected: false, minWFH: 90 },
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
        if (!sc) return { missing: true };
        const r = sc.getBoundingClientRect();
        return {
          docH: document.documentElement.scrollHeight,
          vpH: window.innerHeight,
          hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
          cardFits: r.top >= 0 && r.bottom <= window.innerHeight,
        };
      });
      expect(startCheck.hasVScroll).toBe(false);
      expect(startCheck.cardFits).toBe(true);

      // Play scene
      const playCheck = await page.evaluate(async () => {
        document.querySelector('[data-go="play"]').click();
        await new Promise(r => setTimeout(r, 400));
        if (window.game) window.game.softPause();
        await new Promise(r => setTimeout(r, 100));
        const wf = document.querySelector('.word-field').getBoundingClientRect();
        const ph = document.querySelector('.text-placeholder');
        const phR = ph?.getBoundingClientRect();
        return {
          docH: document.documentElement.scrollHeight,
          hasVScroll: document.documentElement.scrollHeight > window.innerHeight,
          wfH: Math.round(wf.height),
          wfFits: wf.top >= 0 && wf.bottom <= window.innerHeight,
          phFits: phR ? (phR.top >= 0 && phR.bottom <= window.innerHeight) : false,
          modeBadge: document.getElementById('mode-badge')?.textContent,
          timerLabel: document.getElementById('board-timer-label')?.textContent,
        };
      });
      expect(playCheck.hasVScroll).toBe(false);
      expect(playCheck.wfH).toBeGreaterThanOrEqual(vp.minWFH);
      expect(playCheck.wfFits).toBe(true);
      expect(playCheck.phFits).toBe(true);
      expect(playCheck.modeBadge).toBeTruthy();
      expect(playCheck.timerLabel).toBeTruthy();
    });
  }
});

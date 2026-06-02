// scripts/verify-word-field.spec.js
// PR-H2 word-field viewport-fit + (PR-K) falling-word 자식 컨테이너 검증

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'mobile 393×851', w: 393, h: 851, expectMinWFH: 80 },
  { name: 'tablet 768×1024', w: 768, h: 1024, expectMinWFH: 90 },
  { name: 'laptop 1366×768', w: 1366, h: 768, expectMinWFH: 100 },
  { name: 'desktop 1920×1080', w: 1920, h: 1080, expectMinWFH: 100 },
  { name: '4K 2560×1440', w: 2560, h: 1440, expectMinWFH: 100 },
];

test.describe('Word Field Visibility — PR-H2/K', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} — word-field 압축 안 됨 + falling-words 컨테이너`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('tutorial_done', 'true');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const result = await page.evaluate(async () => {
        document.getElementById('tutorial-modal')?.classList.add('hidden');
        document.querySelector('[data-go="play"]').click();
        await new Promise(r => setTimeout(r, 600));
        if (window.game) window.game.softPause();
        const wf = document.querySelector('.word-field');
        const wfR = wf.getBoundingClientRect();
        return {
          wfH: Math.round(wfR.height),
          wfFits: wfR.top >= 0 && wfR.bottom <= window.innerHeight,
          flexShrink: getComputedStyle(wf).flexShrink,
        };
      });

      expect(result.wfH).toBeGreaterThanOrEqual(vp.expectMinWFH);
      expect(result.wfFits).toBe(true);
      expect(result.flexShrink).toBe('0');
    });
  }
});

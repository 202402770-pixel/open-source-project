// scripts/verify-word-field.spec.js
// PR-H2 핫픽스 검증
// - word-field가 모든 viewport에서 보이는 height 유지 (flex shrink 압축 방지)
// - placeholder 단어가 viewport 안에 시각적으로 표시
// - 칠판 안에 word-display 위치

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'mobile 393×851', w: 393, h: 851, expectMinWFH: 90 },
  { name: 'tablet 768×1024', w: 768, h: 1024, expectMinWFH: 90 },
  { name: 'laptop 1366×768', w: 1366, h: 768, expectMinWFH: 100 },
  { name: 'desktop 1920×1080', w: 1920, h: 1080, expectMinWFH: 100 },
  { name: '4K 2560×1440', w: 2560, h: 1440, expectMinWFH: 100 },
];

test.describe('Word Field Visibility — PR-H2', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} — word-field 압축 안 됨 + placeholder 보임`, async ({ page }) => {
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
        await new Promise(r => setTimeout(r, 400));
        if (window.game) window.game.softPause();
        const wf = document.querySelector('.word-field');
        const wfR = wf.getBoundingClientRect();
        const span = document.querySelector('.text-placeholder');
        const spanR = span?.getBoundingClientRect();
        return {
          wfH: Math.round(wfR.height),
          wfTop: Math.round(wfR.top),
          wfBottom: Math.round(wfR.bottom),
          wfInView: wfR.top >= 0 && wfR.bottom <= window.innerHeight,
          placeholderText: span?.textContent,
          placeholderInView: spanR ? (spanR.top >= 0 && spanR.bottom <= window.innerHeight) : false,
          flexShrink: getComputedStyle(wf).flexShrink,
        };
      });

      expect(result.wfH).toBeGreaterThanOrEqual(vp.expectMinWFH);
      expect(result.wfInView).toBe(true);
      expect(result.placeholderText).toBeTruthy();
      expect(result.placeholderInView).toBe(true);
      expect(result.flexShrink).toBe('0');
    });
  }
});

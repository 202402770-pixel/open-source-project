// scripts/verify-a11y.spec.js
// PR-S 접근성 검증

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Accessibility — PR-S', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('모든 모달에 role="dialog" + aria-modal="true"', async ({ page }) => {
    const modals = await page.evaluate(() => {
      const ids = ['settings-modal', 'tutorial-modal', 'pause-modal', 'ranking-modal', 'achievement-modal', 'attendance-modal'];
      return ids.map(id => {
        const el = document.getElementById(id);
        return { id, role: el?.getAttribute('role'), ariaModal: el?.getAttribute('aria-modal'), ariaLabel: el?.getAttribute('aria-label') };
      });
    });
    for (const m of modals) {
      expect(m.role, `${m.id} role`).toBe('dialog');
      expect(m.ariaModal, `${m.id} aria-modal`).toBe('true');
      expect(m.ariaLabel, `${m.id} aria-label`).toBeTruthy();
    }
  });

  test('tutorial-dots — role="group" 추가 (aria-prohibited-attr fix)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const el = document.querySelector('.tutorial-dots');
      return { role: el?.getAttribute('role'), ariaLabel: el?.getAttribute('aria-label') };
    });
    expect(result.role).toBe('group');
    expect(result.ariaLabel).toBeTruthy();
  });

  test('Esc 키 — Settings 모달 닫기', async ({ page }) => {
    const result = await page.evaluate(async () => {
      UI.openSettings();
      await new Promise(r => setTimeout(r, 100));
      const openBefore = !document.getElementById('settings-modal').classList.contains('hidden');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await new Promise(r => setTimeout(r, 100));
      const closedAfter = document.getElementById('settings-modal').classList.contains('hidden');
      return { openBefore, closedAfter };
    });
    expect(result.openBefore).toBe(true);
    expect(result.closedAfter).toBe(true);
  });

  test('Esc 키 — Tutorial 모달 닫기', async ({ page }) => {
    const result = await page.evaluate(async () => {
      UI.openTutorial(0);
      await new Promise(r => setTimeout(r, 100));
      const openBefore = !document.getElementById('tutorial-modal').classList.contains('hidden');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await new Promise(r => setTimeout(r, 100));
      const closedAfter = document.getElementById('tutorial-modal').classList.contains('hidden');
      return { openBefore, closedAfter };
    });
    expect(result.openBefore).toBe(true);
    expect(result.closedAfter).toBe(true);
  });

  test('Esc 키 — Ranking 모달 닫기', async ({ page }) => {
    const result = await page.evaluate(async () => {
      UI.toggleRankingModal(true);
      await new Promise(r => setTimeout(r, 100));
      const openBefore = !document.getElementById('ranking-modal').classList.contains('hidden');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await new Promise(r => setTimeout(r, 100));
      const closedAfter = document.getElementById('ranking-modal').classList.contains('hidden');
      return { openBefore, closedAfter };
    });
    expect(result.openBefore).toBe(true);
    expect(result.closedAfter).toBe(true);
  });

  test('color-contrast — primary 버튼 / eyebrow / tutorial-step 색 변경됨', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Tutorial 열어서 tutorial-step 표시
      UI.openTutorial(0);
      const eyebrow = document.querySelector('.eyebrow');
      const primaryBtn = document.querySelector('.td-btn--primary');
      const tStep = document.querySelector('.tutorial-step');
      return {
        eyebrowColor: eyebrow ? getComputedStyle(eyebrow).color : null,
        primaryBg: primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : null,
        primaryColor: primaryBtn ? getComputedStyle(primaryBtn).color : null,
        tStepColor: tStep ? getComputedStyle(tStep).color : null,
      };
    });
    // eyebrow → accent-deep #b87a00 = rgb(184, 122, 0)
    expect(result.eyebrowColor).toMatch(/rgb\(184, 122, 0\)/);
    // primary btn bg → accent-deep, color → white
    expect(result.primaryBg).toMatch(/rgb\(184, 122, 0\)/);
    expect(result.primaryColor).toMatch(/rgb\(255, 255, 255\)/);
    // tutorial-step → #6b4a08 = rgb(107, 74, 8)
    expect(result.tStepColor).toMatch(/rgb\(107, 74, 8\)/);
  });
});

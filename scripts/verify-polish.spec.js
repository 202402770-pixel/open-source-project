// scripts/verify-polish.spec.js
// PR-G polish 검증
// - word-display placeholder (입력 전 첫 활성 단어 회색 표시)
// - 도전과제 잠금해제 전용 토스트 (toast--achievement)

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Polish — PR-G', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('word-display placeholder — 입력 전 첫 활성 단어 표시', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const words = ['mouse', 'keyboard', 'monitor'];
      UI.renderTargetWord(words, '');
      const wd = document.getElementById('word-display');
      const spans = Array.from(wd.querySelectorAll('span:not(.cursor)'));
      const text = spans.map(s => s.textContent).join('');
      const classes = spans.map(s => s.className);
      return { text, classes, spanCount: spans.length };
    });
    expect(result.text).toBe('mouse');
    expect(result.spanCount).toBe(5);
    expect(result.classes.every(c => c === 'text-placeholder')).toBe(true);
  });

  test('word-display placeholder — 사용자 입력 시작 시 placeholder 해제', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await WordData.loadWords();
      const words = ['mouse'];
      UI.renderTargetWord(words, '');
      const beforeClass = document.querySelector('#word-display span:not(.cursor)')?.className;
      UI.renderTargetWord(words, 'm');
      const afterClass = document.querySelector('#word-display span:not(.cursor)')?.className;
      return { beforeClass, afterClass };
    });
    expect(result.beforeClass).toBe('text-placeholder');
    expect(result.afterClass).not.toBe('text-placeholder');
  });

  test('도전과제 토스트 — showAchievementToast 함수 존재 + 발화 시 toast--achievement 클래스', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (typeof UI.showAchievementToast !== 'function') return { hasFn: false };
      UI.showAchievementToast('첫 받아적기', '첫 단어 처치', 'ST');
      const toast = document.querySelector('.toast.toast--achievement');
      return {
        hasFn: true,
        exists: !!toast,
        hasEyebrow: !!toast?.querySelector('.toast-eyebrow'),
        eyebrowText: toast?.querySelector('.toast-eyebrow')?.textContent,
        ariaLive: toast?.getAttribute('aria-live'),
        hasGoldAccent: !!toast?.querySelector('.toast-accent--gold'),
      };
    });
    expect(result.hasFn).toBe(true);
    expect(result.exists).toBe(true);
    expect(result.hasEyebrow).toBe(true);
    expect(result.eyebrowText).toContain('도전과제');
    expect(result.ariaLive).toBe('polite');
    expect(result.hasGoldAccent).toBe(true);
  });

  test('Achievements.complete → showAchievementToast 라우팅', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Achievements 첫 도전과제(FIRST_WORD) 잠금해제
      Achievements.check(ACHIEVEMENT_IDS.FIRST_WORD, 1);
      const toast = document.querySelector('.toast.toast--achievement');
      return {
        exists: !!toast,
        title: toast?.querySelector('.toast-title')?.textContent,
      };
    });
    expect(result.exists).toBe(true);
    expect(result.title).toBe('첫 받아적기');
  });

  test('toast--achievement — 일반 toast와 외형 분리', async ({ page }) => {
    const result = await page.evaluate(() => {
      UI.showToast('일반', '메시지', 'OK');
      UI.showAchievementToast('업적', '잠금해제', 'BADGE');
      const normal = document.querySelectorAll('.toast:not(.toast--achievement)').length;
      const achievement = document.querySelectorAll('.toast.toast--achievement').length;
      return { normal, achievement };
    });
    expect(result.normal).toBeGreaterThan(0);
    expect(result.achievement).toBe(1);
  });
});

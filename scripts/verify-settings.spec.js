// scripts/verify-settings.spec.js
// Settings 실제 동작 검증 (PR-A)
// - difficulty 양방향 동기화 (Start 모달 ↔ Settings 모달)
// - customWords가 WordData 분기에 반영
// - 라이브 미리보기 (모션/대비/볼륨)
// - language select disabled
// - localStorage 영속화

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Settings — 실제 동작 (PR-A)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('tutorial_done', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('difficulty: Settings 변경 → Start 모달 active 동기화', async ({ page }) => {
    await page.evaluate(() => UI.setSettingsChoice('difficulty', 'hard'));
    const startActive = await page.evaluate(() => {
      const group = document.querySelector('[aria-label="난이도 선택"]');
      const active = group.querySelector('.td-toggle.is-active');
      return active ? active.textContent.trim().toUpperCase() : null;
    });
    expect(startActive).toBe('HARD');
  });

  test('difficulty: Start 모달 변경 → Settings active 동기화', async ({ page }) => {
    await page.evaluate(() => {
      const group = document.querySelector('[aria-label="난이도 선택"]');
      const normalBtn = Array.from(group.querySelectorAll('.td-toggle'))
        .find(b => b.textContent.trim().toUpperCase() === 'NORMAL');
      normalBtn.click();
    });
    const settingsValue = await page.evaluate(() => UI.getActiveDifficulty());
    expect(settingsValue).toBe('normal');
    const settingsActive = await page.evaluate(() => {
      const btn = document.querySelector('[data-setting-group="difficulty"].is-active');
      return btn ? btn.dataset.settingValue : null;
    });
    expect(settingsActive).toBe('normal');
  });

  test('customWords: textarea 입력 → WordData 분기에 반영', async ({ page }) => {
    await page.evaluate(() => {
      UI.settingsState.lecture.customWords = 'stack, queue, graph';
      UI.applySettings();
    });
    const result = await page.evaluate(() => ({
      hasCustom: WordData.customWords !== null,
      sample: WordData.getWordsByLevel(1),
      daily: WordData.getDailyWords(3),
    }));
    expect(result.hasCustom).toBe(true);
    expect(result.sample).toEqual(['stack', 'queue', 'graph']);
    expect(result.daily).toEqual(['stack', 'queue', 'graph']);
  });

  test('customWords: 비우면 기본 단어 DB 복원', async ({ page }) => {
    await page.evaluate(() => {
      UI.settingsState.lecture.customWords = 'foo, bar';
      UI.applySettings();
    });
    await page.evaluate(() => {
      UI.settingsState.lecture.customWords = '';
      UI.applySettings();
    });
    const result = await page.evaluate(() => ({
      hasCustom: WordData.customWords !== null,
      sample: WordData.getWordsByLevel(1),
    }));
    expect(result.hasCustom).toBe(false);
    expect(result.sample.length).toBeGreaterThan(0);
    expect(result.sample).toContain('mouse');
  });

  test('라이브 미리보기: 모션 줄이기 체크박스 → data-motion 반영', async ({ page }) => {
    await page.click('#show-settings-btn');
    await page.click('[data-settings-tab="appearance"]');
    await page.check('#settings-reduced-motion');
    const attr = await page.getAttribute('html', 'data-motion');
    expect(attr).toBe('reduced');
  });

  test('라이브 미리보기: 고대비 체크박스 → data-contrast 반영', async ({ page }) => {
    await page.click('#show-settings-btn');
    await page.click('[data-settings-tab="appearance"]');
    await page.check('#settings-high-contrast');
    const attr = await page.getAttribute('html', 'data-contrast');
    expect(attr).toBe('high');
  });

  test('라이브 미리보기: 사운드 볼륨 슬라이더 → Sound.settings 반영', async ({ page }) => {
    await page.click('#show-settings-btn');
    await page.click('[data-settings-tab="sound"]');
    await page.fill('#settings-bgm-volume', '55');
    await page.dispatchEvent('#settings-bgm-volume', 'input');
    const result = await page.evaluate(() => ({
      bgmVolume: Sound.settings.bgmVolume,
      stateBgm: UI.settingsState.sound.bgmVolume,
    }));
    expect(result.bgmVolume).toBeCloseTo(0.55, 2);
    expect(result.stateBgm).toBe(55);
  });

  test('테마 선택 → Themes 전역 적용 + localStorage 영속화', async ({ page }) => {
    await page.evaluate(() => UI.setSettingsChoice('theme', 'neon'));
    const after = await page.evaluate(() => ({
      domTheme: document.documentElement.getAttribute('data-theme'),
      lsTheme: localStorage.getItem('td_theme'),
      stateTheme: UI.settingsState.appearance.theme,
    }));
    expect(after.domTheme).toBe('neon');
    expect(after.lsTheme).toBe('neon');
    expect(after.stateTheme).toBe('neon');
  });

  test('language select: disabled 상태로 데드 UI 정직 표기', async ({ page }) => {
    await page.click('#show-settings-btn');
    const disabled = await page.getAttribute('#settings-language', 'disabled');
    expect(disabled).not.toBeNull();
    const helpText = await page.textContent('#settings-language-help');
    expect(helpText).toContain('Custom Words');
  });

  test('localStorage 영속화: 새로고침 후에도 설정 유지', async ({ page }) => {
    await page.evaluate(() => {
      UI.setSettingsChoice('theme', 'cyber');
      UI.setSettingsChoice('difficulty', 'hard');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const restored = await page.evaluate(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      difficulty: UI.getActiveDifficulty(),
    }));
    expect(restored.theme).toBe('cyber');
    expect(restored.difficulty).toBe('hard');
  });
});

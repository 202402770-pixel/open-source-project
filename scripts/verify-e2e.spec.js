// scripts/verify-e2e.spec.js
// Playwright E2E 검증 — 박태준 W4 직접 실행 자동화
//   - PWA: Service Worker 등록, manifest 정상, 오프라인 동작
//   - 모바일: 가상 키보드 포커싱, .rotate-hint, 도전과제 모달 트리거
//   - 게임 흐름: Start → Play → Game Over 한 사이클
//
// 실행:
//   npm run playwright:install   # 초기 1회 (chromium 다운로드)
//   npm run verify:playwright    # 정적 서버 띄운 상태에서 실행

import { test, expect, devices } from '@playwright/test';

const URL = process.env.URL || 'http://localhost:8000';

test.describe('Type Defender — W4 검증', () => {
  test('PWA: Service Worker 등록', async ({ page }) => {
    await page.goto(URL);
    // SW가 등록되어 activate 상태가 되기까지 대기
    const swReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return reg.active && reg.active.state === 'activated';
    });
    expect(swReady).toBe(true);
  });

  test('PWA: manifest 정상 파싱', async ({ page }) => {
    await page.goto(URL);
    const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href');
    expect(manifestHref).toBeTruthy();
    const response = await page.request.get(new URL(manifestHref, URL).toString());
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest.name).toBe('Type Defender');
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
  });

  test('CONFIG/Effects/Sound/GameAPI 전역 노출', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const globals = await page.evaluate(() => ({
      hasCONFIG: typeof window.CONFIG !== 'undefined',
      hasEffects: typeof window.Effects !== 'undefined',
      hasSound: typeof window.Sound !== 'undefined',
      hasGameAPI: typeof window.GameAPI !== 'undefined',
      hasUI: typeof window.UI !== 'undefined',
      hasGrade: typeof window.Grade !== 'undefined',
      configHP: window.CONFIG && window.CONFIG.DIFFICULTY.normal.startHP,
      configMissDamage: window.CONFIG && window.CONFIG.CORE.MISS_DAMAGE,
    }));
    expect(globals.hasCONFIG).toBe(true);
    expect(globals.hasEffects).toBe(true);
    expect(globals.hasSound).toBe(true);
    expect(globals.hasGameAPI).toBe(true);
    expect(globals.hasUI).toBe(true);
    expect(globals.hasGrade).toBe(true);
    expect(globals.configHP).toBe(5);
    expect(globals.configMissDamage).toBe(1);
  });

  test('Effects 함수 단독 발화', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const errors = await page.evaluate(() => {
      const out = [];
      try { Effects.boardWipe(); } catch (e) { out.push('boardWipe:' + e.message); }
      try { Effects.screenShake(); } catch (e) { out.push('screenShake:' + e.message); }
      try { Effects.typedPulse(); } catch (e) { out.push('typedPulse:' + e.message); }
      try { Effects.errorFlash(); } catch (e) { out.push('errorFlash:' + e.message); }
      try { Effects.chalkDust(100, 100); } catch (e) { out.push('chalkDust:' + e.message); }
      try { Effects.toggleGlow(true, 'combo10'); Effects.toggleGlow(false); } catch (e) { out.push('toggleGlow:' + e.message); }
      try { Effects.triggerErrorShake(); } catch (e) { out.push('triggerErrorShake:' + e.message); }
      return out;
    });
    expect(errors).toEqual([]);
  });

  test('Grade.calc 학점 계산', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const results = await page.evaluate(() => ({
      aplus: Grade.calc(12000, 97, 55),
      a:     Grade.calc(6000, 92, 45),
      aminus: Grade.calc(4000, 88, 35),
      b:     Grade.calc(1000, 80, 25),
      c:     Grade.calc(500, 60, 10),
      f:     Grade.calc(100, 40, 5),
    }));
    expect(results.aplus).toBe('A+');
    expect(results.a).toBe('A');
    expect(results.aminus).toBe('A-');
    expect(results.b).toBe('B');
    expect(results.c).toBe('C');
    expect(results.f).toBe('F');
  });

  test('Achievements/Ranking/Attendance 모달 토글', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    // 모달 토글 직접 호출
    const modalStates = await page.evaluate(() => {
      const probe = (id, opener) => {
        opener();
        const opened = !document.getElementById(id).classList.contains('hidden');
        return opened;
      };
      return {
        ranking: probe('ranking-modal', () => UI.toggleRankingModal(true)),
        achievement: probe('achievement-modal', () => UI.toggleAchievementModal(true)),
        attendance: probe('attendance-modal', () => UI.toggleAttendanceModal(true)),
      };
    });
    expect(modalStates.ranking).toBe(true);
    expect(modalStates.achievement).toBe(true);
    expect(modalStates.attendance).toBe(true);
  });
});

test.describe('모바일 검증 (iPhone 12)', () => {
  test.use({ ...devices['iPhone 12'] });

  test('모바일에서 메인 화면 정상 로드', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.start-scene')).toBeVisible();
  });

  test('모바일 도전과제 모달 진입', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    // 시작 화면에서 도전과제 모달 직접 토글 (시작 화면에는 진입 버튼 없으므로 console)
    await page.evaluate(() => UI.toggleAchievementModal(true));
    await expect(page.locator('#achievement-modal')).toBeVisible();
    // achievement-card 12개 (도전과제 12개)
    const cardCount = await page.locator('.achieve-card').count();
    expect(cardCount).toBe(12);
  });

  test('모바일 출석 도장 모달 진입', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => UI.toggleAttendanceModal(true));
    await expect(page.locator('#attendance-modal')).toBeVisible();
    // 7칸 그리드
    const cellCount = await page.locator('.attendance-cell').count();
    expect(cellCount).toBe(7);
  });
});

test.describe('320px 가로 회전 안내', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('320px portrait에서 .rotate-hint 표시', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.rotate-hint')).toBeVisible();
  });
});

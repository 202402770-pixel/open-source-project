// scripts/verify-e2e.spec.js
// Playwright E2E — 데스크톱 케이스 (PWA / 전역 / Effects / Grade / 모달)
// 모바일·320px 케이스는 별도 파일 (verify-mobile.spec.js / verify-rotate.spec.js)

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Type Defender — W4 데스크톱 검증', () => {
  test('PWA: Service Worker 등록', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const swReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return reg.active && reg.active.state === 'activated';
    });
    expect(swReady).toBe(true);
  });

  test('PWA: manifest 정상 파싱', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href');
    expect(manifestHref).toBeTruthy();
    const response = await page.request.get(new URL(manifestHref, BASE_URL).toString());
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest.name).toBe('Type Defender');
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
  });

  test('CONFIG/Effects/Sound/GameAPI 전역 노출', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // 주의: top-level `const X`는 window에 attach 안 됨 (script scope) — typeof 직접 체크 사용
    const globals = await page.evaluate(() => ({
      hasCONFIG: typeof CONFIG !== 'undefined',
      hasEffects: typeof Effects !== 'undefined',
      hasSound: typeof Sound !== 'undefined',
      hasGameAPI: typeof GameAPI !== 'undefined',
      hasUI: typeof UI !== 'undefined',
      hasGrade: typeof Grade !== 'undefined',
      configHP: typeof CONFIG !== 'undefined' ? CONFIG.DIFFICULTY.normal.startHP : null,
      configMissDamage: typeof CONFIG !== 'undefined' ? CONFIG.CORE.MISS_DAMAGE : null,
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
    await page.goto(BASE_URL);
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
    await page.goto(BASE_URL);
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
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const modalStates = await page.evaluate(() => {
      const probe = (id, opener) => {
        opener();
        return !document.getElementById(id).classList.contains('hidden');
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

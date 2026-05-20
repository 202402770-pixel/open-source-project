'use strict';

/* ════════════════════════════════════════════════════════════════════
 * Effects Bindings — GameAPI 슬롯에 effects 함수 등록
 *
 * game-api.js의 콜백 슬롯에 effects.js의 시각 효과를 라우팅한다.
 * 김지우 코드의 hook 호출이 들어오면 자동으로 작동.
 *
 * 등록 슬롯:
 *   onCorrectChar    → Effects.typedPulse()      정타 펄스
 *   onWrongChar      → Effects.errorFlash()      오타 박스 플래시
 *   onWordDestroyed  → Effects.chalkDust(x, y)   분필 가루
 *
 * 미등록 슬롯 (의도적):
 *   onComboChange — 현재 김지우 game.js가 Effects.toggleGlow를 직접
 *   호출하는 패턴 유지. CONFIG화·임계값 일원화는 별도 회의 후 작업.
 *
 * 의존: window.GameAPI (game-api.js), window.Effects (effects.js)
 * 로드 순서: main.js 직전이 안전 (모든 dependency 정의 후)
 *
 * 콘솔 단독 테스트:
 *   GameAPI.onCorrectChar();
 *   GameAPI.onWrongChar();
 *   GameAPI.onWordDestroyed(400, 300);
 * ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof GameAPI === 'undefined') {
    console.error('[effects-bindings] GameAPI 미정의 — game-api.js 로드 순서 확인');
    return;
  }
  if (typeof Effects === 'undefined') {
    console.error('[effects-bindings] Effects 미정의 — effects.js 로드 순서 확인');
    return;
  }

  GameAPI.onCorrectChar = function (/* char */) {
    Effects.typedPulse();
  };

  GameAPI.onWrongChar = function (/* char */) {
    Effects.errorFlash();
  };

  GameAPI.onWordDestroyed = function (x, y) {
    Effects.chalkDust(x, y);
  };
})();

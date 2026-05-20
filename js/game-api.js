'use strict';

/* ════════════════════════════════════════════════════════════════════
 * GameAPI — 게임 상태 변화 → 외부 모듈 알림 슬롯
 *
 * game.js / input.js 내부 상태 변화 시점에 호출되는 콜백 슬롯들.
 * 슬롯이 null이면 호출은 no-op (게임은 정상 동작).
 * effects-bindings.js 같은 외부 모듈이 슬롯에 함수를 등록한다.
 *
 * Why 슬롯 패턴:
 *  - game.js (김지우 영역) 내부에 effects/UI 코드가 박히지 않음
 *  - 슬롯이 비어 있어도 게임은 동작
 *  - 콘솔에서 직접 콜백 등록·발동해 단독 테스트 가능
 *
 * 사용 (구독자 측 — effects 등):
 *   GameAPI.onComboChange = (c) => { ... };
 *
 * 사용 (publisher 측 — game/input):
 *   if (GameAPI.onComboChange) GameAPI.onComboChange(state.combo);
 *
 * Hook 4개 — 김지우가 본인 코드 4지점에 호출 1줄씩 추가 예정:
 *   onComboChange(newCombo)   — game.js, state.combo 갱신 직후
 *   onCorrectChar(char)       — input.js, 정타 판정 분기
 *   onWrongChar(char)         — input.js, 오타 판정 분기
 *   onWordDestroyed(x, y)     — game.js, Word destroy 위치
 * ════════════════════════════════════════════════════════════════════ */

window.GameAPI = {
  onComboChange:   null, // function(newCombo: number)
  onCorrectChar:   null, // function(char: string)
  onWrongChar:     null, // function(char: string)
  onWordDestroyed: null, // function(x: number, y: number)
};

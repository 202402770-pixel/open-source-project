'use strict';

/* ════════════════════════════════════════════════════════════════════
 * Grade — 학점 계산
 *
 * 게임 종료 시 점수·정확도를 받아 학점 string을 반환한다.
 * 임계값은 CONFIG.GRADE에서 가져온다 (W1 박태준 정의).
 *
 * 반환 string은 UI.stampGrade()의 셀렉터(.stamp[data-grade="..."])와
 * 동일한 형식을 유지한다: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'F'
 *
 * Why 별도 모듈:
 *  - game.js의 게임 루프와 분리해 단위 테스트 가능
 *  - 임계값 조정이 잦은 영역이라 응집도 높게 격리
 * ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof CONFIG === 'undefined' || !CONFIG.GRADE) {
    console.error('[grade] CONFIG.GRADE 미정의 — config.js 로드 순서 확인 필요');
    return;
  }

  const G = CONFIG.GRADE;

  /**
   * 점수와 정확도를 받아 학점을 반환한다.
   * @param {number} score    - 게임 종료 시점 누적 점수
   * @param {number} accuracy - 정확도 (0 ~ 100)
   * @returns {'A+'|'A'|'A-'|'B'|'C'|'F'}
   */
  function calc(score, accuracy) {
    const s = Number(score) || 0;
    const a = Number(accuracy) || 0;

    if (a >= G.APLUS.minAccuracy   && s >= G.APLUS.minScore)   return 'A+';
    if (a >= G.A.minAccuracy       && s >= G.A.minScore)       return 'A';
    if (a >= G.A_MINUS.minAccuracy && s >= G.A_MINUS.minScore) return 'A-';
    if (a >= G.B.minAccuracy       && s >= G.B.minScore)       return 'B';
    if (a >= G.C.minAccuracy       && s >= G.C.minScore)       return 'C';
    return 'F';
  }

  window.Grade = Object.freeze({ calc });
})();

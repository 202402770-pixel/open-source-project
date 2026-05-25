'use strict';

/* ════════════════════════════════════════════════════════════════════
 * Grade — 학점 계산
 *
 * 게임 종료 시 점수·정확도·WPM을 받아 학점 string을 반환한다.
 * 임계값은 CONFIG.GRADE에서 가져온다.
 *
 * 반환 string: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'F'
 * 사용처: ui.js의 showGameOver()에서 받아 .stamp DOM의 className에 매핑
 *        (예: 'A+' → 'stamp-a-plus' 클래스 → --color-grade-aplus 컬러)
 *
 * Why 별도 모듈:
 *  - game.js의 게임 루프와 분리해 단위 테스트 가능
 *  - 임계값 조정이 잦은 영역이라 응집도 높게 격리
 *
 * WPM 임계값 추가 — 박태준 결정 2026-05-23 (WORK_PLAN.md §3 W2)
 *   세 조건(정확도·점수·WPM) 모두 충족해야 해당 학점 부여 (AND 매핑).
 * ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof CONFIG === 'undefined' || !CONFIG.GRADE) {
    console.error('[grade] CONFIG.GRADE 미정의 — config.js 로드 순서 확인 필요');
    return;
  }

  const G = CONFIG.GRADE;

  /**
   * 점수·정확도·WPM을 받아 학점을 반환한다.
   * @param {number} score    - 게임 종료 시점 누적 점수
   * @param {number} accuracy - 정확도 (0 ~ 100)
   * @param {number} [wpm=0]  - 분당 단어수 (Words Per Minute)
   * @returns {'A+'|'A'|'A-'|'B'|'C'|'F'}
   */
  function calc(score, accuracy, wpm) {
    const s = Number(score) || 0;
    const a = Number(accuracy) || 0;
    const w = Number(wpm) || 0;

    if (a >= G.APLUS.minAccuracy   && s >= G.APLUS.minScore   && w >= G.APLUS.minWpm)   return 'A+';
    if (a >= G.A.minAccuracy       && s >= G.A.minScore       && w >= G.A.minWpm)       return 'A';
    if (a >= G.A_MINUS.minAccuracy && s >= G.A_MINUS.minScore && w >= G.A_MINUS.minWpm) return 'A-';
    if (a >= G.B.minAccuracy       && s >= G.B.minScore       && w >= G.B.minWpm)       return 'B';
    if (a >= G.C.minAccuracy       && s >= G.C.minScore       && w >= G.C.minWpm)       return 'C';
    return 'F';
  }

  window.Grade = Object.freeze({ calc });
})();

/**
 * Type Defender — Visual Effects
 * --------------------------------------------------------------------------
 * 게임에 시각적 텐션을 더하는 작은 효과 모듈.
 *
 * 현재 공개 API:
 *   Effects.chalkDust(x, y, container?)   단어 파괴 분필 가루 파티클 8개
 *   Effects.typedPulse(element?)          정타 시 노트 펄스 (scale 1.02)
 *   Effects.errorFlash(element?)          오타 시 노트 박스 플래시 (typing-error)
 *   Effects.toggleGlow(active, type)      콤보 글로우 (combo5/combo10)
 *   Effects.triggerErrorShake()           오타 시 body shake
 *
 * 설계 원칙:
 * - DOM 파티클 사용 (Canvas 미사용 — 프로젝트 정책)
 * - transform + opacity 위주 (reflow 없음, GPU 가속)
 * - prefers-reduced-motion 감지 시 효과 즉시 스킵
 * - 종료 후 자동 cleanup (메모리 누수 방지)
 *
 * 의존성: js/config.js의 CONFIG.EFFECTS (먼저 로드되어 있어야 함)
 * 참고: DESIGN.md §5.2 단어 완성 인터랙션 / WORK_PLAN.md §3 W1 박태준
 */

const Effects = {
  /**
   * 단어 파괴 시 분필 가루 파티클을 (x, y) 좌표에서 방사형으로 흩뿌린다.
   *
   * @param {number} x - 파괴 위치 x (viewport 좌표 또는 container 상대 좌표)
   * @param {number} y - 파괴 위치 y
   * @param {HTMLElement} [container=document.body] - 파티클 부착 부모
   *
   * 예시:
   *   word.element.addEventListener('destroy', e => {
   *     const rect = e.target.getBoundingClientRect();
   *     Effects.chalkDust(rect.left + rect.width / 2, rect.top + rect.height / 2);
   *   });
   */
  chalkDust(x, y, container = document.body) {
    // 접근성 — 모션 줄이기 사용자에겐 효과 스킵
    if (Effects._reducedMotion()) return;

    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.EFFECTS) || {
      CHALK_DUST_PARTICLES: 8,
      CHALK_DUST_DURATION: 400,
      CHALK_DUST_DISTANCE: 60,
    };

    const count = cfg.CHALK_DUST_PARTICLES;
    const duration = cfg.CHALK_DUST_DURATION;
    const distance = cfg.CHALK_DUST_DISTANCE;

    for (let i = 0; i < count; i++) {
      // 8방향 균등 분포 + 약간의 랜덤 흔들림으로 자연스럽게
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const power = 0.7 + Math.random() * 0.6;
      const dx = Math.cos(angle) * distance * power;
      const dy = Math.sin(angle) * distance * power;

      const particle = document.createElement('div');
      particle.className = 'td-chalk-dust';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: var(--color-chalk, #f4f4eb);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity ${duration}ms ease-out;
        will-change: transform, opacity;
      `;
      container.appendChild(particle);

      // 다음 프레임에 transition 시작 (CSS transition 동작 보장)
      requestAnimationFrame(() => {
        particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        particle.style.opacity = '0';
      });

      // 종료 후 DOM에서 제거 — 누적 방지
      setTimeout(() => particle.remove(), duration + 50);
    }
  },

  /**
   * PR-U: 단어 처치 시 강한 폭발 파티클 (chalkDust 강화판).
   * 16 파티클 × 2 색 (chalk + chalk-yellow), 더 멀리 (120px), 회전 추가.
   *
   * @param {number} x 처치 위치 x
   * @param {number} y 처치 위치 y
   * @param {object} opts { isBoss?: boolean, container?: HTMLElement }
   */
  explodeWord(x, y, opts = {}) {
    if (Effects._reducedMotion()) {
      // 모션 줄이기 시 짧은 1회 펄스만
      Effects.chalkDust(x, y, opts.container);
      return;
    }

    const container = opts.container || document.body;
    const isBoss = !!opts.isBoss;
    const count = isBoss ? 24 : 16;
    const duration = isBoss ? 600 : 480;
    const distance = isBoss ? 160 : 120;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const power = 0.6 + Math.random() * 0.7;
      const dx = Math.cos(angle) * distance * power;
      const dy = Math.sin(angle) * distance * power - 12; // 약간 위로 (중력처럼)
      const rot = (Math.random() - 0.5) * 720;

      // 색상 교차 — chalk / chalk-yellow / accent (boss)
      let color = 'var(--color-chalk, #f4f4eb)';
      if (isBoss) {
        color = i % 3 === 0 ? 'var(--color-accent, #d97706)' :
                i % 3 === 1 ? 'var(--color-chalk-yellow, #f6d76a)' :
                              'var(--color-chalk, #f4f4eb)';
      } else if (i % 4 === 0) {
        color = 'var(--color-chalk-yellow, #f6d76a)';
      }

      const size = isBoss ? 9 : 7;
      const particle = document.createElement('div');
      particle.className = 'td-explode-particle';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) rotate(0deg);
        transition: transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1),
                    opacity ${duration}ms ease-out;
        will-change: transform, opacity;
        box-shadow: 0 0 4px ${color};
      `;
      container.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform =
          `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(0.4)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), duration + 50);
    }
  },

  /**
   * 정타 시 입력 노트가 살짝 펄스(scale 1.02 → 1)한다.
   * CSS: .notebook-input.typed-pulse 키프레임
   * @param {HTMLElement} [element] - 대상 요소 (기본: .notebook-input)
   */
  typedPulse(element) {
    if (Effects._reducedMotion()) return;
    const target = element || document.querySelector('.notebook-input');
    if (!target) return;
    const dur = (typeof CONFIG !== 'undefined' && CONFIG.EFFECTS && CONFIG.EFFECTS.TYPED_PULSE_DURATION) || 80;
    target.classList.remove('typed-pulse');
    void target.offsetWidth; // reflow — 연속 호출 시 애니메이션 재시작 보장
    target.classList.add('typed-pulse');
    setTimeout(() => target.classList.remove('typed-pulse'), dur + 20);
  },

  /**
   * 오타 시 입력 노트가 typing-error 색으로 박스 플래시한다.
   * CSS: .notebook-input.error-flash 키프레임
   * 김지우의 triggerErrorShake(body 흔들림)와는 다른 시각 채널이라 공존 OK.
   * @param {HTMLElement} [element] - 대상 요소 (기본: .notebook-input)
   */
  errorFlash(element) {
    if (Effects._reducedMotion()) return;
    const target = element || document.querySelector('.notebook-input');
    if (!target) return;
    const dur = (typeof CONFIG !== 'undefined' && CONFIG.EFFECTS && CONFIG.EFFECTS.ERROR_SHAKE_DURATION) || 200;
    target.classList.remove('error-flash');
    void target.offsetWidth;
    target.classList.add('error-flash');
    setTimeout(() => target.classList.remove('error-flash'), dur + 20);
  },

  /**
   * (내부) 사용자가 OS 설정에서 모션 줄이기를 켰는지.
   * matchMedia 미지원 환경(아주 오래된 브라우저)에선 false 반환.
   */
  _reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  },

    /**
     * 콤보 글로우 — 단계화 (PR-B).
     *
     * @param {boolean} active - 글로우 켜기/끄기
     * @param {number|string} [arg] -
     *   숫자 전달 시 현재 콤보 값 (CONFIG.SCORING.COMBO_GLOW_TIERS로 자동 분기)
     *   문자열 'combo5'/'combo10'/'combo20'/'combo30' 전달 시 직접 클래스 지정 (호환)
     *
     * 클래스 단계 (강도 점진):
     *   glow-combo10 (콤보 10~19) — 노랑
     *   glow-combo20 (콤보 20~29) — 진한 노랑 + 큰 글로우
     *   glow-combo30 (콤보 30+)   — 액센트 색 + 최대 글로우
     */
    toggleGlow(active, arg) {
        // PR-L: 셀렉터 우선순위 — typing-status (PR-K 입력 cue) → .notebook-input (호환)
        const notebook = document.getElementById('typing-status')
            || document.querySelector('.notebook-input');
        if (!notebook) return;
        notebook.classList.remove('glow-combo5', 'glow-combo10', 'glow-combo20', 'glow-combo30');
        if (!active) return;

        // 숫자 인자 — 콤보 값으로 단계 자동 결정
        if (typeof arg === 'number') {
            const tiers = (typeof CONFIG !== 'undefined' && CONFIG.SCORING && CONFIG.SCORING.COMBO_GLOW_TIERS) || [10, 20, 30];
            if (arg >= tiers[2]) notebook.classList.add('glow-combo30');
            else if (arg >= tiers[1]) notebook.classList.add('glow-combo20');
            else if (arg >= tiers[0]) notebook.classList.add('glow-combo10');
            return;
        }

        // 문자열 인자 — 직접 클래스 지정 (호환)
        if (arg === 'combo30') notebook.classList.add('glow-combo30');
        else if (arg === 'combo20') notebook.classList.add('glow-combo20');
        else if (arg === 'combo10') notebook.classList.add('glow-combo10');
        else notebook.classList.add('glow-combo5');
    },

    triggerErrorShake() {
        const body = document.body;
        body.classList.remove('shake');
        void body.offsetWidth;
        body.classList.add('shake');
        setTimeout(() => {
            body.classList.remove('shake');
        }, 300);
    },

  /**
   * 레벨업 트랜지션 — 칠판에 흰 분필가루 띠가 가로로 쓸고 지나감 (W3 박태준).
   * CSS: .blackboard.wipe + @keyframes board-wipe
   * 지속은 CONFIG.EFFECTS.LEVELUP_TRANSITION 따름.
   * 중간 시점에 콜백 발화 — 단원 텍스트 교체에 사용 가능.
   *
   * @param {Function} [callback] - wipe 중간 시점(dur/2)에 호출. 단원 텍스트 갱신용
   */
  boardWipe(callback) {
    const dur = (typeof CONFIG !== 'undefined' && CONFIG.EFFECTS && CONFIG.EFFECTS.LEVELUP_TRANSITION) || 600;
    if (Effects._reducedMotion()) {
      if (typeof callback === 'function') callback();
      return;
    }
    const board = document.querySelector('.blackboard');
    if (!board) {
      if (typeof callback === 'function') callback();
      return;
    }
    board.classList.remove('wipe');
    void board.offsetWidth; // reflow — 연속 호출 시 애니메이션 재시작
    board.classList.add('wipe');
    if (typeof callback === 'function') {
      setTimeout(callback, dur / 2);
    }
    setTimeout(() => board.classList.remove('wipe'), dur + 20);
  },

  /**
   * 보스 단어 등장 시 화면 흔들림 (W3 박태준).
   * CSS: body.boss-shake + @keyframes boss-shake
   * 지속/강도는 CONFIG.BOSS.SHAKE_DURATION / SHAKE_INTENSITY 따름.
   */
  screenShake(duration, intensity) {
    if (Effects._reducedMotion()) return;
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.BOSS) || {};
    const dur = duration || cfg.SHAKE_DURATION || 200;
    const itn = intensity || cfg.SHAKE_INTENSITY || 6;
    const body = document.body;
    body.style.setProperty('--shake-intensity', `${itn}px`);
    body.classList.remove('boss-shake');
    void body.offsetWidth;
    body.classList.add('boss-shake');
    setTimeout(() => body.classList.remove('boss-shake'), dur + 20);
  }
};

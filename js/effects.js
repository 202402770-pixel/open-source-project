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

    toggleGlow(active, type) {
        const notebook = document.querySelector('.notebook-input');
        if (!notebook) return;
        notebook.classList.remove('glow-combo5', 'glow-combo10');
        if (active) {
            if (type === 'combo10') {
                notebook.classList.add('glow-combo10');
            } else {
                notebook.classList.add('glow-combo5');  
            }
        }
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

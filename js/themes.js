/**
 * Type Defender — Theme System
 * --------------------------------------------------------------------------
 * 외관 테마 전환 + localStorage 지속.
 * 기본 테마는 'classroom' (시안 E "강의 필기"). 다른 테마(Neon / Retro / Cyber /
 * Minimal)는 W3 Settings 외관 탭에서 추가될 예정.
 *
 * 동작 방식:
 *   <html data-theme="classroom"> 속성을 설정 → CSS가 [data-theme="..."] 셀렉터로
 *   토큰 변수를 오버라이드. classroom은 tokens.css의 기본값을 그대로 사용하므로
 *   별도 오버라이드 CSS 없음.
 *
 * 사용 예:
 *   Themes.apply('classroom');   // 즉시 적용
 *   Themes.save('neon');         // localStorage에 저장 + 적용
 *   const name = Themes.load();  // 현재 저장된 테마 (없으면 default)
 *
 * 참고: DESIGN.md §2 디자인 토큰, WORK_PLAN.md §3 W1 박태준
 */

const Themes = {
  /** 사용 가능한 테마 목록 (W1에는 classroom만 활성. 나머지는 W3에서 추가) */
  AVAILABLE: ['classroom'],

  /** 새 방문자에게 보여줄 기본 테마 (시안 E) */
  DEFAULT: 'classroom',

  /** localStorage 키 — 다른 영역과 충돌 방지를 위해 td_ 프리픽스 */
  STORAGE_KEY: 'td_theme',

  /**
   * 테마를 즉시 적용한다 (localStorage 저장은 안 함).
   * @param {string} name - 테마 이름
   */
  apply(name) {
    const safe = this.AVAILABLE.includes(name) ? name : this.DEFAULT;
    document.documentElement.setAttribute('data-theme', safe);
    return safe;
  },

  /**
   * 저장된 테마 이름을 반환한다. 없으면 DEFAULT.
   * @returns {string}
   */
  load() {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT;
    } catch (_) {
      // localStorage 차단된 환경 (시크릿 모드 등) 대비
      return this.DEFAULT;
    }
  },

  /**
   * 테마를 localStorage에 저장하고 즉시 적용한다.
   * @param {string} name - 테마 이름
   */
  save(name) {
    if (!this.AVAILABLE.includes(name)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, name);
    } catch (_) {
      // 저장 실패해도 적용은 진행
    }
    this.apply(name);
  },

  /**
   * 페이지 로드 시 1회 호출. 저장된 테마 또는 DEFAULT를 적용.
   */
  init() {
    this.apply(this.load());
  },
};

// 페이지 로드 시점에 자동 초기화
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Themes.init());
  } else {
    Themes.init();
  }
}

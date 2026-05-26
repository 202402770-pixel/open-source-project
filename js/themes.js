/**
 * Type Defender — Theme System
 * --------------------------------------------------------------------------
 * 외관 테마 전환 + localStorage 지속.
 *
 * W3 Settings 외관 탭에서 다음 5개 테마를 지원한다.
 * - classroom
 * - neon
 * - retro
 * - cyber
 * - minimal
 *
 * 동작 방식:
 *   <html data-theme="classroom"> 속성을 설정
 *   CSS가 [data-theme="..."] 셀렉터로 토큰 변수를 오버라이드한다.
 */

const Themes = {
  AVAILABLE: ['classroom', 'neon', 'retro', 'cyber', 'minimal'],

  DEFAULT: 'classroom',

  STORAGE_KEY:
    typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.THEME
      ? CONFIG.STORAGE.THEME
      : 'td_theme',

  apply(name) {
    const safe = this.AVAILABLE.includes(name) ? name : this.DEFAULT;
    document.documentElement.setAttribute('data-theme', safe);
    return safe;
  },

  load() {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      return this.AVAILABLE.includes(savedTheme) ? savedTheme : this.DEFAULT;
    } catch (_) {
      return this.DEFAULT;
    }
  },

  save(name) {
    const safe = this.AVAILABLE.includes(name) ? name : this.DEFAULT;

    try {
      localStorage.setItem(this.STORAGE_KEY, safe);
    } catch (_) {
      // localStorage 저장 실패 시에도 화면 적용은 진행
    }

    this.apply(safe);
  },

  init() {
    this.apply(this.load());
  },
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Themes.init());
  } else {
    Themes.init();
  }
}
/**
 * Type Defender — Game Configuration
 * --------------------------------------------------------------------------
 * 모든 게임 매직 넘버의 단일 출처. game.js / word.js / input.js 등 게임 로직은
 * 직접 숫자를 박지 말고 이 객체를 참조한다.
 *
 * 값을 바꾸면 게임 밸런스가 바뀐다 — 변경 시 5주차 회의에서 합의 후 PR.
 *
 * 참고: DESIGN.md §3 / WORK_PLAN.md §3 W1 박태준
 */

const CONFIG = {
  /* ────────────────────────────────────────────────────────────────────
   * Core Game Loop
   * ──────────────────────────────────────────────────────────────────── */
  CORE: {
    BASE_SPEED: 80,                  // 단어 낙하 기본 속도 (px/s)
    BASE_SPAWN_INTERVAL: 2000,       // 단어 생성 기본 주기 (ms)
    SPAWN_MIN_INTERVAL: 500,         // 단어 생성 주기 하한 (ms)
    LEVEL_UP_INTERVAL: 30000,        // 레벨업 주기 (ms, 30s)
    SPEED_MULT_PER_LEVEL: 0.15,      // 레벨당 속도 가산 비율
    SPAWN_REDUCTION_PER_LEVEL: 150,  // 레벨당 spawn 주기 단축 (ms)
    PLAY_AREA_TOP_PADDING: 0,        // 단어 spawn 시작 y (px)
  },

  /* ────────────────────────────────────────────────────────────────────
   * Difficulty Multipliers (Easy / Normal / Hard)
   * ──────────────────────────────────────────────────────────────────── */
  DIFFICULTY: {
    easy:   { speedMult: 0.7, spawnMult: 1.4, startHP: 7 },
    normal: { speedMult: 1.0, spawnMult: 1.0, startHP: 5 },
    hard:   { speedMult: 1.4, spawnMult: 0.6, startHP: 3 },
  },

  /* ────────────────────────────────────────────────────────────────────
   * Modes (Classic / Time Attack / Zen / Daily)
   * ──────────────────────────────────────────────────────────────────── */
  MODES: {
    classic:    { hasHP: true,  hasCombo: true,  timeLimit: 0,    seeded: false },
    timeattack: { hasHP: true,  hasCombo: true,  timeLimit: 120,  seeded: false },
    zen:        { hasHP: false, hasCombo: false, timeLimit: 180,  seeded: false },
    daily:      { hasHP: true,  hasCombo: true,  timeLimit: 0,    seeded: true  },
  },

  /* ────────────────────────────────────────────────────────────────────
   * Scoring
   * ──────────────────────────────────────────────────────────────────── */
  SCORING: {
    WORD_DESTROY_BASE: 10,           // 정답 기본 점수
    COMBO_MULTIPLIER: 2,             // 콤보 가산 비율 (10 + combo * 2)
    BOSS_BONUS: 200,                 // 보스 단어 처치 보너스
    COMBO_GLOW_THRESHOLD: 10,        // 콤보 N 이상에서 노트 글로우
  },

  /* ────────────────────────────────────────────────────────────────────
   * Boss Word (시안 E의 "기말고사 핵심 키워드")
   * ──────────────────────────────────────────────────────────────────── */
  BOSS: {
    PROBABILITY: 0.05,               // 5% 등장 확률
    MIN_LEVEL: 3,                    // Lv 3+ 부터만 등장
    SHAKE_DURATION: 200,             // 등장 시 화면 흔들림 (ms)
    SHAKE_INTENSITY: 6,              // 흔들림 강도 (px)
  },

  /* ────────────────────────────────────────────────────────────────────
   * Grade Thresholds (Game Over 학점 계산용)
   * 학점 = 정확도 + 점수의 함수. W2 박태준이 calcGrade()에서 사용.
   * ──────────────────────────────────────────────────────────────────── */
  GRADE: {
    APLUS: { minAccuracy: 95, minScore: 10000 },
    A:     { minAccuracy: 90, minScore: 5000 },
    A_MINUS: { minAccuracy: 85, minScore: 3000 },
    B:     { minAccuracy: 75, minScore: 0 },
    C:     { minAccuracy: 50, minScore: 0 },
    // 위 기준 모두 미달이면 F
  },

  /* ────────────────────────────────────────────────────────────────────
   * Effects · Animation Timing
   * ──────────────────────────────────────────────────────────────────── */
  EFFECTS: {
    CHALK_DUST_PARTICLES: 8,         // 단어 파괴 시 분필 가루 개수
    CHALK_DUST_DURATION: 400,        // 파티클 애니메이션 길이 (ms)
    CHALK_DUST_DISTANCE: 60,         // 파티클 흩어지는 거리 (px)
    TYPED_PULSE_DURATION: 80,        // 정타 시 노트 펄스 (ms)
    ERROR_SHAKE_DURATION: 200,       // 오타 시 노트 흔들림 (ms)
    ERROR_SHAKE_DISTANCE: 6,         // 오타 흔들림 강도 (px)
    LEVELUP_TRANSITION: 600,         // 칠판 wipe 트랜지션 (ms)
  },

  /* ────────────────────────────────────────────────────────────────────
   * Language Switch Policy
   * Settings에서 언어 변경 시 활성 단어 처리 방식.
   * 'drop' : 모두 즉시 destroy 후 새 언어로 spawn 재개 (권장)
   * 'finish' : 기존 단어는 끝까지 두고 신규만 새 언어
   * ──────────────────────────────────────────────────────────────────── */
  LANGUAGE_SWITCH_POLICY: 'drop',

  /* ────────────────────────────────────────────────────────────────────
   * Daily Mode (출석 도장)
   * ──────────────────────────────────────────────────────────────────── */
  DAILY: {
    STREAK_MAX: 7,                   // 출석 도장 그리드 칸 수
    SEED_DATE_FORMAT: 'YYYYMMDD',    // 시드 생성용 (예: 20260518)
  },

  /* ────────────────────────────────────────────────────────────────────
   * Audio
   * ──────────────────────────────────────────────────────────────────── */
  AUDIO: {
    MASTER_VOLUME_DEFAULT: 0.6,
    SFX_VOLUME_DEFAULT: 0.7,
    BGM_VOLUME_DEFAULT: 0.3,
    CHALK_PITCH_VARIANCE: 0.05,      // 분필 소리 ±5% pitch 랜덤화
  },

  /* ────────────────────────────────────────────────────────────────────
   * localStorage Keys (td_ 프리픽스로 충돌 방지)
   * ──────────────────────────────────────────────────────────────────── */
  STORAGE: {
    HIGH_SCORE:        'td_high_score',
    THEME:             'td_theme',
    TUTORIAL_DONE:     'td_tutorial_done',
    DAILY_STREAK:      'td_daily_streak',
    DAILY_LAST_DATE:   'td_daily_last_date',
    ACHIEVEMENTS:      'td_achievements',
    LEADERBOARD:       'td_leaderboard',
    SETTINGS_LECTURE:  'td_settings_lecture',
    SETTINGS_APPEAR:   'td_settings_appearance',
    SETTINGS_SOUND:    'td_settings_sound',
  },
};

// 단순 동결 — 게임 도중 실수로 값 바뀌는 일 방지
if (typeof Object.freeze === 'function') {
  Object.freeze(CONFIG);
  Object.freeze(CONFIG.CORE);
  Object.freeze(CONFIG.DIFFICULTY);
  Object.freeze(CONFIG.MODES);
  Object.freeze(CONFIG.SCORING);
  Object.freeze(CONFIG.BOSS);
  Object.freeze(CONFIG.GRADE);
  Object.freeze(CONFIG.EFFECTS);
  Object.freeze(CONFIG.DAILY);
  Object.freeze(CONFIG.AUDIO);
  Object.freeze(CONFIG.STORAGE);
}

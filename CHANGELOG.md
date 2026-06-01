# Changelog

Type Defender 변경 이력. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따른다.

---

## [Unreleased] — 2026-06-02 사용성 개선 시리즈

W1~W5 5주 프로젝트 마감 후 박태준(Tech Lead) 주도 사용성 개선. 7 PR 시리즈로 진행. 모든 PR squash-merge.

### [PR-G] polish 묶음 — `polish/word-placeholder-toast-docs` (#64)
- **단어 placeholder**: 칠판 word-display가 입력 전엔 비어있어 무엇을 입력해야 할지 시각적으로 불명확했음 → 첫 활성 단어를 회색 placeholder로 표시 (`.text-placeholder`, opacity 0.4)
- **도전과제 토스트 강화**: 잠금해제가 일반 토스트와 외형 동일했음 → 황금 액센트 + glow 펄스 + bell 사운드 + 5초 노출 + "도전과제 달성" eyebrow + `aria-live="polite"`
- **문서 갱신**: README 게임 방법에 시간 제한·테마·재시작 정확히 반영. CHANGELOG 신규 추가.

### [PR-F] 풀 viewport 핫픽스 — `fix/full-viewport-dogfood` (#63)
- **모바일 viewport-fit**: 393×851에서 doc 1574 → **851** (정확 fit). `@media (max-width: 1023px)`에 `min/max-height: 100dvh` + `overflow: hidden` + 자식 영역 vh 비율 제한. PR-E가 1024+만 fix했던 누락.
- **단어 spawn 시차 (CONFIG.CORE.WORD_SPAWN_STAGGER_MS: 1500)**: PR-E "1개씩 만료"가 60fps gameLoop 호출로 무효화되어 즉사 미해결이었음. `_recordSpawnTimes`가 단어별 `i × stagger` 시차 분산.
- `getMostImpendingExpiryRatio`: 미래 spawn 음수 비율 `Math.max(0, ...)` 방지.
- `sw.js` CACHE_VERSION td-v3 → td-v4.
- spec 신규 8건.

### [PR-E] dogfood 핫픽스 1차 — `fix/dogfood-hotfix` (#62)
- **PR-D 자동 게임오버 즉사 fix**: 6단어가 동일 spawn time으로 동시 만료해 한 번에 HP -6 즉사하던 버그. `checkWordTimeouts`가 가장 오래된 1개만 처리.
- **softPause/softResume**: overlay 없이 시간만 정지. `Settings/Tutorial` 모달 열림 + `visibilitychange` 시 자동 발화. 일시정지 동안 흐른 시간만큼 spawn time 보정.
- **데스크톱 viewport-fit (1024+)**: `max-height: 100vh` + `overflow: hidden` + 큰 영역 height clamp. 1920×1080 / 1366×768 세로 스크롤 해결.
- **Start 카드 폭** (1600+): `min(860, 100%)` → `min(1100, 92vw)`. 와이드 모니터 dead space 줄임.
- `window.game` 노출 (`start()` 시 `window.game = game`). `sw.js` td-v2 → td-v3.
- spec 신규 10건.

### [PR-D] 단어 시간 제한 (D-1) — `feat/word-lifetime` (#61)
- **단어 lifetime 시스템**: Easy 12s / Normal 8s / Hard 5.6s / Zen 무제한. CONFIG: `WORD_LIFETIME_MS`, `DIFFICULTY.wordLifetimeMult`.
- `Game.checkWordTimeouts` / `_expireWord` / `getMostImpendingExpiryRatio` 추가. gameLoop에서 호출.
- **시각 경고**: 65%+ `.danger` (붉은 외곽), 85%+ `.critical` (강한 글로우 + 펄스 0.45s). `prefers-reduced-motion` 시 펄스 스킵.
- 시안 E "받아쓰기" 메타포 유지 — 단어가 정적으로 활성됨 + 시간 제한만 추가.
- spec 신규 11건.

### [PR-C] 폰트 비동기 + script defer — `perf/mobile-lighthouse` (#60)
- 폰트 CDN preload + onload swap stylesheet 패턴 (render-blocking 제거). Pretendard + Google Fonts (Black Han Sans / Gaegu / JetBrains Mono).
- script 13개 전부 `defer` 추가.
- preconnect 보강 (`cdn.jsdelivr.net`).
- `sw.js` td-v1 → td-v2.
- Lighthouse desktop 100 / mobile 98 안정.

### [PR-B] 피드백 polish + 재시작 soft — `feat/feedback-polish` (#59)
- **콤보 글로우 단계화**: 1단계 → 3단계. `CONFIG.SCORING.COMBO_GLOW_TIERS: [10, 20, 30]`. `Effects.toggleGlow`가 콤보 값 받아 자동 분기. CSS `.glow-combo20/30` 추가 (점진 강도 + `pulse-glow-accent`).
- **단어 실패 화면 떨림**: `handleFailure`에 `triggerErrorShake` 추가 (글자 단위 errorFlash와 별개 채널).
- **재시작 soft**: `location.reload()` 제거. 같은 모드/난이도로 새 Game 즉시 시작. `Game.goToMenu`는 Start scene 복귀 + `window.game = null`.
- **Input/PauseControls idempotent**: 재시작 시 이벤트 리스너 중복 등록 방지.
- spec 신규 11건.

### [PR-A] Settings Lecture 탭 기능화 — `feat/settings-functional` (#58)
- **difficulty 양방향 동기화**: SoT를 `UI.settingsState.lecture.difficulty`로 통일. `main.js`의 `selectedDifficulty` 변수 제거 → `UI.getActiveDifficulty()`.
- **customWords 게임 적용**: `WordData.setCustomWords` 분기로 모든 레벨에 우선 사용. 비우면 기본 영문 DB 복원.
- **language select 정직 표기**: 12개 옵션 disabled + `(PR-D 예정)` 라벨. 기본값 `ko` → `en`. Custom Words 사용 유도.
- **라이브 미리보기 통일**: 모션/대비/사운드 토글 즉시 `applySettings + saveSettings` (테마/폰트와 일관).
- spec 신규 10건.

### 누적 수치
- **diff**: +1488 / −83 (16 files)
- **Playwright**: 60건 통과 (32 신규 사용성 + 28 기존 W1~W5)
- **Lighthouse**: desktop 100 / mobile 98
- **회귀**: 0건

---

## [W5] 2026-05-28 — Code Freeze + QA + Deploy

- LICENSE 정리 (MIT + 폰트/사운드/라이브러리 개별)
- README 데모 URL + 실행 방법 + 팀 + SoT 4개
- 단어 DB lint 스크립트 (`scripts/wordData-lint.js`)
- Vercel 프로덕션 배포 (https://open-source-project-virid.vercel.app)
- PRESENTATION.md 발표 슬라이드 10장 초안
- meeting-notes.md 회고 섹션

## [W4] — Mobile + Polish + Performance
- 모바일 입력 처리 (`Input.init` 터치 포커싱, 가상 키보드)
- PWA 인프라 (`manifest.json` + `sw.js` cache-first)
- 모바일 반응형 (Pixel 5 emulation 통과)
- 가로 회전 안내 (≤320px portrait)
- 검증 자동화 (`scripts/verify-lighthouse.sh` + `verify-e2e.spec.js`)

## [W3] — Tutorial + Pause + Settings
- 보스 단어 (Lv 3+ 5% 확률 + 종소리 + 화면 흔들림 + +200 보너스)
- 레벨업 트랜지션 (`Effects.boardWipe` 칠판 wipe + 단원 텍스트 교체)
- Daily 출석 도장 (7일 그리드)
- Tutorial 5슬라이드 + Pause 모달 + Settings 3탭 (강의/외관/사운드)

## [W2] — Main Screens
- Start / Play / Game Over scene 구조
- 학점 시스템 (`grade.js` A+/A/A-/B/C/F)
- GameAPI publish-subscribe 슬롯 4개 (`onComboChange/onCorrectChar/onWrongChar/onWordDestroyed`)
- `effects-bindings.js` GameAPI → Effects 라우팅
- 기획서 정렬 (HP 5, MISS_DAMAGE 1)

## [W1] — Foundation
- 디자인 토큰 37개 (`css/tokens.css`)
- 게임 설정 11섹션 (`js/config.js`)
- W1 컴포넌트 12종 (`components.html`)
- 디자인 시각화 (`design-system.html`)

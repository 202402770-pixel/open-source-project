# Changelog

Type Defender 변경 이력. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따른다.

---

## [Unreleased] — 2026-06-02~03 사용성 개선 + 정통 타이핑 디펜스 전환

W1~W5 5주 프로젝트 마감 후 박태준(Tech Lead) 주도 **15 PR 시리즈**. 시안 E "받아쓰기" 메타포 → 정통 타이핑 디펜스 (ZType 스타일)로 게임 본질 전환.

### [PR-N] 입력 손실 fix + 게임 밸런스 (ZType 리서치) — `feat/balance-input-fix` (#72)
박태준 첫 방문자 시뮬레이션 — **3.5초 만에 즉사** (HP 7→0, score 0).
- **입력 손실 fix** (main.js): `slice(-1)` → `slice(lastValLength)`. 늘어난 모든 글자 차례 처리. IME / 빠른 타이핑 / autocomplete 손실 방지.
- **밸런스 재조정** (config.js, ZType / Flow Theory 리서치 기반):
  - `FALL_SPEED_BASE` 8 → 6 / `SPAWN_INTERVAL_BASE` 2000 → 3500
  - `SPAWN_MAX_ACTIVE` 6 → 4 / `SPAWN_INITIAL_DELAY` 0 → 1500
  - easy speedMult 0.7→0.45, spawnMult 1.4→1.0
- **시작 grace** (game.js): 게임 시작 후 1.5초 대기 후 첫 spawn.
- **Tutorial 마지막 버튼**: "반격할게요" → "게임 시작".
- 결과: mouse 5글자 → score 10 / combo 1 / HP 7 유지 (이전 score 0 / HP 0 / Game Over)

### [PR-M] 메타포 정리 + 단어 시각 강화 + 학점 도장 polish — `feat/metaphor-cleanup-polish` (#71)
박태준 UI/UX audit 결과 시안 E 메타포 잔재 + 단어 시각 강화 묶음.
- **텍스트 정리**: "강의 필기 디펜스" → "Type Defender", "받아적을게요" → "게임 시작", "성적표" → "결과", "다시 수강" → "다시 도전" + "메뉴로", "강의실 설정" → "설정", "강의가 잠시 멈췄습니다" → "일시정지", "데모 종료" → "끝내기"
- Tutorial 5슬라이드 정통 메커닉 설명 (단어 낙하 / lock / 자동 처치 / 콤보·보스 / 모드)
- 칠판 제목: "자료구조 핵심 키워드" → "LEVEL N" (동적)
- W1 컴포넌트 보기 링크 제거 (학교 데모 노출)
- **단어 시각**: Gaegu cursive → JetBrains Mono. font-size +20%. letter-spacing 0.04em. text-shadow 강화
- **학점 도장**: size +10px, font 4rem, border 12px. 학점별 box-shadow glow (A+ 펄스 / F 빨강)
- **메뉴로 버튼**: Game Over에 추가 — 다른 모드/난이도 변경 가능

### [PR-L] 키보드 입력 시각 cue + lock 단어 진행 표시 — `fix/input-visual-cue` (#70)
박태준 라이브 dogfood — "입력창이 안 보임. 직접 입력해보고 디버깅 해라" 지적. PR-K 정통 디펜스 완성 후 빠진 UX 조각.
- 진단: hidden-input opacity:0 + 노트북 panel 안내 없음 → 사용자가 어디 입력하는지 모름
- 노트북 panel을 `#typing-status` 시각 cue 영역으로 재활용
  - lock 없음: "⌨ 키보드로 단어를 입력하세요"
  - lock 있음: `mou` (녹색) + cursor + `se` (회색) — 큰 글씨 진행
- `UI.updateTypingStatus(game)` gameLoop마다 호출
- 호환 fix: `effects.js toggleGlow` 셀렉터 `.notebook-input` → `#typing-status`

### [PR-K] 정통 타이핑 디펜스 — 단어 낙하 + 글자별 lock — `feat/falling-words-canonical` (#69)
박태준 "단어 떨어지는 느낌이 없다 → 정통 타이핑 디펜스로 가자" 지시. 시안 E "받아쓰기" **메타포 폐기**. ZType / TypingDefence 스타일로 게임 본질 전환.

**데이터 모델 변경**:
- `activeWords: string[]` → `fallingWords: Word[]` (id, text, x, y, speed, typedIndex, isBoss)
- 좌표 % 기반 (viewport 적응)

**game.js 핵심**:
- `update()`: gameLoop마다. 낙하 + spawn + 충돌
- `handleCharInput(char)`: 첫 글자 매칭 → lock → 글자별 진행 → 마지막 글자 자동 처치
- `_destroyWord`: score + 콤보 + chalkDust at word position + 보스 보너스
- `_expireWord`: HP -1 + 콤보 끊김 + shake

**CONFIG.CORE 신규**:
- FALL_SPEED_BASE / FALL_FLOOR_RATIO / SPAWN_INTERVAL_BASE / SPAWN_MAX_ACTIVE / SPAWN_X_MIN/MAX / WORD_DANGER_RATIO / WORD_CRITICAL_RATIO

**UI**:
- `UI.renderFallingWords(game)`: word-field 안에 `.falling-word` 절대 위치, Map 기반 element 재사용
- `.fw-typed` (녹색) / `.fw-untyped` (chalk) / `.is-locked` 노란 outline / `.is-boss` 액센트 + boss-glow-pulse

**폐기**: PR-D 시간 제한 시스템 (wordSpawnTimes, checkWordTimeouts, getWordLifetimeMs, WORD_LIFETIME_*) / PR-F spawn stagger / PR-G placeholder.

### [PR-J] 작은 세로 viewport(<=700px) Start 카드 컴팩트 — `fix/start-scene-small-viewport` (#68)
박태준 종합 dogfood 결과 1024×600 netbook viewport에서 Start scene 세로 스크롤 14px 초과.
- `@media (max-height: 700px)`: `.scene` padding 32→16, `.start-card` padding 48→24×32, h1 5vh 기반 clamp, 자식 gap/margin 축소
- 결과: 8 viewport (320·393·768·1024·1280·1366·1920·2560) 깨짐 없음 확인

### [PR-I] 게임모드 차이 가시화 — 배지·타이머·HP — `fix/mode-differences` (#67)
박태준 dogfood — 4모드 다 똑같이 보임. 진짜 원인:
- board-timer "01:24" HTML placeholder — 갱신 코드 없음
- Zen HP 숨김 코드는 있는데 `.hp-meter`만 숨김 → `.hp-panel` 전체 숨겨야
- HUD에 모드 표시 자체가 없음

해결:
- `#mode-badge` HUD 추가, data-mode별 색상 (Classic 갈색 / TIME ATTACK 빨강 / Zen 녹색 / Daily 보라)
- `#hp-panel` ID + Zen 시 `display:none`
- `#board-timer-value` / `#board-timer-label` ID + 모드별 라벨 (TIME 경과 / TIME LEFT 카운트다운 / ZEN / DAILY)
- 10초 이하 `.is-urgent` 빨간 펄스 (prefers-reduced-motion 스킵)

### [PR-H2] word-field flex-shrink + 모바일 HUD 컴팩트 — `fix/word-field-shrink` (#66)
박태준 라이브 dogfood — PR-H placeholder color 적용 후에도 단어 안 보임. 진단:
- blackboard min-height: 0 (PR-E) + flex column에서 word-field가 4px까지 압축
- 자식 합 280 > blackboard 가용 167 → flex shrink

해결:
- `.play-scene.is-active .word-field { flex-shrink: 0; }`
- 데스크톱(1024+): clamp(160, 28vh, 320) → clamp(120, 22vh, 240). illustration 22vh→16vh, notebook 30vh→24vh
- 모바일(<=1023): 동일 패턴 + HUD .hud-pill padding/font 작게 (4줄 wrap → 2줄)

### [PR-H] placeholder 칠판 대비 + sw 자동 reload — `fix/placeholder-contrast` (#65)
박태준 라이브 dogfood 스크린샷 — 칠판에 placeholder 안 보임. 진단 2건:
- **placeholder color**: PR-G에서 `text-mute` 베이지 → 짙은 녹색 칠판 위에서 **대비 0**. opacity 0.4까지 invisible.
- **sw cache**: PR-G 머지·배포됐는데 `UI.renderTargetWord`가 옛 코드. 새 sw activate됐지만 기존 탭은 옛 컨트롤러 유지. 사용자는 두 번 reload 해야.

해결:
- `text-placeholder` color → `chalk-dim` + opacity 0.75 (칠판 위 가독)
- index.html `controllerchange` listener: 새 sw 활성화 시 1회 자동 reload (`_swRefreshing` guard)

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

### 누적 수치 (PR-A ~ PR-N, 15 PR)
- **diff**: +2,800 / −1,300 (28 files)
- **Playwright**: 79건 통과 (PR-A~G 32 + PR-K~N 신규 + PR-D~F 폐기·갱신)
- **Lighthouse**: desktop 100 / mobile 98
- **회귀**: 0건
- **PWA cache**: td-v1 (W5) → td-v13 (PR-N)
- **라이브**: https://open-source-project-virid.vercel.app

### 시리즈 흐름 (메타 회고)

**박태준 단독 dogfood 사이클**:
1. 시안 E "받아쓰기" 메타포로 W5 마감
2. PR-A~G: 사용성 개선 (Settings / 콤보 / 폰트 / 단어 시간 제한 / 모바일 / placeholder)
3. PR-H~J: dogfood 핫픽스 (placeholder 대비 / word-field 압축 / 모드 차이 / netbook)
4. PR-K: **메타포 폐기** → 정통 타이핑 디펜스 (ZType 스타일)
5. PR-L~N: 정통 게임 완성 (입력 cue / 메타포 텍스트 정리 / 밸런스)

**박태준 dogfood의 본질** — 자동 spec 79건이 못 잡은 사용자 경험 결함을 라이브 직접 클릭/타이핑으로 잡음:
- PR-E: 메뉴 만지는 5-8초간 즉사
- PR-F: 60fps 호출에 즉사 무효화
- PR-H: 칠판 위 색 대비 + PWA cache 정책
- PR-H2: word-field flex shrink 4px 압축
- PR-I: 4모드 시각 차이 0
- PR-L: 입력창 어디 있는지 불명
- PR-N: 빠른 입력 손실 + 즉사 밸런스

**ZType 리서치 적용** (PR-N): SPAWN_INITIAL_DELAY, easy speedMult 0.45, SPAWN_MAX_ACTIVE 4 — Flow Theory + Bushnell's Law 기반.

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

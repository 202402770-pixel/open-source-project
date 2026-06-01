# W2 Claude Code 세션 시작 프롬프트 (W1 완료 후)

> **`---PROMPT START---`부터 `---PROMPT END---` 사이를 복사**해서 새 Claude Code 세션 첫 메시지로 붙여넣으세요. 새 세션이 5초 만에 W2 작업 컨텍스트를 갖춥니다.
>
> **W1은 100% 완료된 상태** (milestone closed, 이슈 11/11 closed). 단 새 세션은 W2 시작 전 W1을 한번 더 검토 → 통과 시 W2 진입.
>
> 마지막 갱신: 2026-05-20 (W1 종료 직후, PR #20 머지 완료)

---PROMPT START---

오픈소스SW 수업 팀 프로젝트 **Type Defender**의 **W2 (Main Screens Assembly)**를 시작하려고 해. 이전 W1 세션 컨텍스트가 끊겼으니 핵심 정보 먼저 전달할게.

## 프로젝트 정체성

- **무엇:** 화면 위에서 떨어지는 단어를 타이핑해 파괴하는 바닐라 JS 아케이드 게임 (시안 E "강의 필기" 컨셉)
- **수업:** 오픈소스SW (한국외대)
- **팀(3인):** 박태준(Tech Lead, GitHub: `puze8681`) / 전재형(팀장·repo owner+admin, GitHub: `202402770-pixel`) / 김지우(GitHub: `oyend`)
- **나 = 박태준**
- **레포:** https://github.com/202402770-pixel/open-source-project (private)
- **Figma:** https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO
- **로컬:** `/Users/parktaejun/projects/open-source-project` (clone됨, main 동기화 상태)

## 단일 진실 원천 4개 (이 순서로 우선)

1. 🎨 **Figma** — 픽셀 단위 진실
2. 📐 [`DESIGN.md`](https://github.com/202402770-pixel/open-source-project/blob/main/DESIGN.md) — 토큰·인터랙션·접근성 명세
3. 🗓 [`WORK_PLAN.md`](https://github.com/202402770-pixel/open-source-project/blob/main/WORK_PLAN.md) — 5주 분배표 v0.4 (디자인 100% 사전 완성 + 팀원 HTML/CSS/JS 학습 완료 전제, W5에 모든 항목 분배해 W6 없이 완료)
4. 🤝 [`CONTRIBUTING.md`](https://github.com/202402770-pixel/open-source-project/blob/main/CONTRIBUTING.md) — Git 컨벤션 (GitHub Flow + Conventional Commits 한국어 + Squash & Merge)

## W1 종료 상태 — main 히스토리 + 머지된 PR

```
5eb50b3 refactor(game): 매직 넘버 → CONFIG.* 참조 + index.html 정리 (PR #20, 박태준)
868d6bd Merge pull request #18 (전재형 W1 변형 4건 — non-squash, 컨벤션 위반)
b6652c8 Merge branch 'main' into feat/issue-3...
ebd0661 feat: add component state demos (전재형 PR #18 실제 변경)
9e549ca docs: deprecate MIGRATION.md (PR #17)
dfd2ee5 feat(w1): 김지우 components ... (PR #1)
3429408 docs: add migration plan (PR #15, 이후 deprecated)
cd4c4e5 feat(w1): foundation — tokens · fonts · theme · config · effects (PR #2, 박태준)
9d3b961 feat: add interactive toggle and README (전재형 init)
4660130 init: create type defender W1 components (전재형 init)
4aa2c5b Initial commit
```

- W1 milestone **CLOSED (11/11)** ✅
- 트래커 이슈 #14 CLOSED ✅
- 이슈 #12 (Branch protection) won't fix — Org 마이그레이션 안 함
- MIGRATION.md DEPRECATED 처리됨
- 박태준이 PR #20에서 매직 넘버 치환 + index.html script 순서 정리 + localStorage 키 통일

## 🔍 새 세션 첫 작업 — W1 검토 (W2 진입 전 필수)

박태준 요청: **W2 시작 전에 W1을 한번 더 쭉 검토해서 진짜 더 할 게 없는지 확인**하고 진행. 다음을 순서대로 실행:

### Phase 1 — 형식 검증 (5분, 자동)

```bash
cd /Users/parktaejun/projects/open-source-project
git checkout main && git pull

# 1) W1 milestone 진행도
gh api repos/202402770-pixel/open-source-project/milestones/1 --jq '"\(.title) — \(.state) — closed: \(.closed_issues) / open: \(.open_issues)"'
# → "W1 Foundation — closed — closed: 11 / open: 0" 기대

# 2) 모든 W1 이슈 상태
gh issue list --repo 202402770-pixel/open-source-project --milestone "W1 Foundation" --state all --limit 20

# 3) 열린 PR (W2 작업)
gh pr list --repo 202402770-pixel/open-source-project --state open
# → #16 (전재형 W2 design) 정도 예상

# 4) main 동작 확인
open index.html
# → 게임 화면이 뜨고 단어 입력 가능한지 / DevTools 콘솔에 에러 없는지
```

### Phase 2 — DESIGN.md/WORK_PLAN.md vs 실제 코드 비교 (10분)

WORK_PLAN.md §3 W1에 명시한 산출물 12개 항목 vs 실제 main을 비교:

**박태준 (W1 자기 분량 8건):**
- [x] CONTRIBUTING.md 팀에 공유
- [x] PR + Issue 템플릿 (`.github/`)
- [x] .editorconfig / .prettierrc / .gitignore
- [x] `css/tokens.css` (Color 37 + 타입 + 스페이싱 + 그림자)
- [x] 웹폰트 4종 (Pretendard / Black Han Sans / Gaegu / JetBrains Mono)
- [x] `js/config.js` 11 섹션
- [x] `js/effects.js` 분필 가루 파티클
- [x] `js/themes.js` 강의 필기 기본 테마

**전재형 (UI 컴포넌트 6종):**
- [x] Button + Toggle (size·variant·state 모두)
- [x] Word Chip 4 난이도 + 입력 진행 상태
- [x] HUD Pill 4 톤 (default/accent/good/bad)
- [x] Professor 3 포즈 (writing/watching/angry)
- [x] Student Desk 5 variants (NPC 4 + YOU)
- [x] components.html 데모

**김지우 (4 컴포넌트 + 도전과제 + 게임 코어):**
- [x] Notebook Input
- [x] HP Bar 3 상태
- [x] Toast
- [x] Grade Stamp 5 학점
- [x] 도전과제 12개 정의 (강의 메타포 라인업)
- [x] game.js / word.js / input.js / main.js / ui.js / wordData.js

→ **각 항목을 실제 파일/클래스로 검증**. 모두 ✓ 면 통과.

### Phase 3 — W1에서 W2/W3으로 이월된 미해결 점검 (5분)

PR #20 커밋 메시지에 명시된 W2 이월 항목들:

- 🟡 **HP 100 시스템 vs `CONFIG.DIFFICULTY.normal.startHP=5` 충돌** — 김지우 game.js는 HP 0~100을 쓰는데 박태준 config는 5개 HP. 게임 디자인 결정 필요
- 🟡 `takeDamage(20)` — 단어 미스 시 -20 데미지, config화 필요
- 🟡 `combo >= 5` 두 번째 글로우 임계값 — config에 별도 키 추가 검토
- 🟡 **학점 계산 함수 `calcGrade(score, accuracy, wpm)`** — W2 박태준 첫 작업

이 4개는 **W2 박태준 작업 범위에 자연스럽게 들어감**.

### Phase 4 — 회고 + 결정

검토 결과를 박태준에게 보고:
1. 빠진 산출물 있나? (없으면 W2 진입)
2. 컨벤션 위반 1건 (전재형 PR #18 self-merge + non-squash) 회의에서 언급 필요한가?
3. 전재형의 W2 PR #16 어떻게 처리할지? (이미 올라온 상태)
4. **즉시 W2 진입 vs 회의 후 진입** 결정

## W2 박태준 목표 (검토 통과 후)

WORK_PLAN.md §3 W2:
- [ ] **학점 계산 함수** — `score`+`accuracy`+`wpm` → A+/A/A-/B/C/F. `CONFIG.GRADE` 임계값 사용. 가장 독립적이라 W2 첫 작업 후보 — 브랜치 `feat/grade-calc`, 파일 `js/grade.js`
- [ ] **콤보 시스템** + 콤보 ≥10일 때 노트 글로우 (현 김지우 코드와 통합)
- [ ] **키 입력 효과** — 정타 0.08s 펄스 / 오타 6px shake 0.2s + `--color-typing-error` 플래시
- [ ] **Word 클래스 리팩터링** — DOM 단순화, 파괴 시 `Effects.chalkDust` 호출
- [ ] **언어 전환 정책 적용** — `CONFIG.LANGUAGE_SWITCH_POLICY = 'drop'` 코드 반영
- [ ] **HP 시스템 결정 + config 통합** (W1 이월)
- [ ] PR 리뷰 + 머지 — 전재형 #16 + 김지우 W2 PR

W2 동료 의존성:
- **전재형 PR #16** (이미 OPEN): W2 메인 화면 design 작업 — 박태준 리뷰 필요
- **김지우**: Game Over 성적표 (Figma 8:2) + 통계 계산 — 박태준 학점 함수 의존

## W1 회고 (새 세션 알아둘 점)

- **컨벤션 위반 1건** — 전재형이 본인 PR #18을 박태준 리뷰 없이 self-merge + 일반 Merge (Squash 아님). main에 merge commit 2개 끼었음. 코드는 정상이라 사후 인정. 다음부턴 박태준 리뷰 강제 (사람 합의).
- **Branch protection 미설정** — Org 마이그레이션도 안 함. 사고 방지는 "사람 합의 + 박태준 리뷰"에 의존.
- **localStorage 키 통일됨** — `td_*` 프리픽스. 기존 사용자 데이터 1회 손실.

## 박태준의 환경 / 톤 선호

- **언어:** 한국어 답변, 코드는 영문, 커밋·이슈는 한국어 OK
- **톤:** 직설적·솔직. 트레이드오프 명시, 불확실한 건 명시. 과한 칭찬·감탄 금지
- **포맷:** 표·코드블록·체크리스트 적극 활용, 긴 단락은 짧게 쪼개
- **결정:** 옵션 비교 → 추천 → 사용자 선택 패턴
- **`gh` CLI:** 박태준 본인 토큰 인증됨
- **로컬 환경:** macOS, zsh, `/Users/parktaejun/projects/open-source-project`

## 첫 메시지 — 새 세션이 답할 것

위 컨텍스트 흡수했음을 확인하고 **W1 검토 Phase 1~4를 순서대로 진행**한 뒤 결과 보고. 그 다음 박태준에게 다음 중 어떻게 시작할지 질문:

**A.** 검토 통과 → 즉시 W2 박태준 첫 작업 (`js/grade.js` 학점 함수, 가장 독립적)
**B.** 검토 통과 → 먼저 전재형 PR #16 리뷰부터
**C.** 검토에서 발견된 미해결 항목 처리 → 그 후 W2 진입
**D.** 다른 우선순위 (사용자가 알려줄 것)

준비됐어. W1 검토부터 시작하자.

---PROMPT END---

## 사용 방법

1. Claude Code 새 세션 시작
2. 위 PROMPT START~END 사이를 첫 메시지로 붙여넣기
3. 새 세션이 W1 검토 Phase 1~4 실행 + 결과 보고
4. 박태준이 옵션 A/B/C/D 선택 → W2 진행

## 컨텍스트 절약 팁

- 이 파일 자체를 새 세션에 읽으라고 하지 말 것 — 토큰 낭비
- 위 PROMPT 약 2,200 토큰 — 새 세션 시작 시 7% 미만
- 필요한 파일은 새 세션이 그때그때 `Read`/`grep`로 가져옴

## W3 / W4 / W5 프롬프트 만들 때

매 주차 종료 시 이 파일을 복사해 `W3_SESSION_PROMPT.md`, `W4_SESSION_PROMPT.md`, `W5_SESSION_PROMPT.md`로 갱신:

1. **"W1 종료 상태" → "W{N-1} 종료 상태"** 부분에 그 주차의 머지된 PR 목록 + milestone 종료 상태
2. **"W2 박태준 목표" → "W{N} 박태준 목표"** 로 WORK_PLAN.md §3 해당 주차로 갱신
3. **W{N-1} 검토 Phase 1~4** — 직전 주차의 산출물 체크리스트로 갱신
4. **W1 회고** → 누적되는 회고로 (회의록 형식)

# Type Defender — 5-Week Work Plan

> **수업:** 오픈소스SW
> **팀:** 전재형(팀장), 박태준, 김지우
> **기간:** 5주 (Week 1 ~ Week 5)

> ⚠️ **이 계획의 전제 (v0.4)**
> 1. 디자인은 박태준이 5주 시작 전에 **100% 완성**해 두었다 (Figma + DESIGN.md).
> 2. 팀원 전원이 HTML / CSS / JavaScript 기초를 이미 학습 완료한 상태다.
> 3. **W5가 끝나면 프로젝트가 완료된다 — W6는 없다.** 추가 아이디어는 발표 슬라이드의 "Future Work"로만.
>
> 따라서 W1부터 학습 시간 없이 **바로 구현에 진입**한다.
> 디자인 결정 0%, 학습 시간 0%, 5주 모두 코드 작성에 집중하되,
> 누락 없이 5주 안에 마칠 수 있도록 모든 항목을 W1~W5에 명시적으로 분배해 두었다.

---

## 0. 시작 전 합의 사항

### 0.1 단일 진실 원천 (Single Source of Truth)

작업 중 "어떻게 보일지" 의심되면 무조건 아래를 우선시한다:

| 우선순위 | 자료 | 용도 |
|---|---|---|
| 1 | 🎨 [Figma](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO) | 픽셀 단위 위치·크기·색상 |
| 2 | [DESIGN.md](DESIGN.md) | 토큰 정의·인터랙션 명세 |
| 3 | [design-system.html](design-system.html) | 토큰·컴포넌트 시각 확인 |

> **금지:** "내가 봤을 땐 이게 더 예쁜데" — 이건 W6 이후에 다음 디자인 라운드에서.

### 0.2 협업 규칙
- 모든 변경은 **PR**을 통해서만 `main`으로 들어간다 ([CONTRIBUTING.md](CONTRIBUTING.md))
- 팀원(전재형·김지우)의 모든 PR은 **박태준이 1차 리뷰** 후 머지 (구현 협업 안전망)
- 매주 월요일 20시 정기 회의 — 진척도 점검 + 다음 주 계획 확정
- 막히면 24시간 안에 팀 채팅으로 도움 요청

### 0.3 역할

| 사람 | 역할 | 주된 책임 |
|---|---|---|
| **박태준** | Tech Lead · Reviewer | 아키텍처·게임 코어 로직·인프라·코드 리뷰 게이트 |
| **전재형 (팀장)** | UI/UX Implementation | 화면 조립 + 컴포넌트 (UI 계열) + 발표 |
| **김지우** | Data · Components · QA | 컴포넌트 (입력/표시 계열) + 데이터·도전과제 + QA |

> 역할은 고정이 아니라 **주된 책임 영역**. 막히면 페어로.

### 0.4 Definition of Done — 매 주차 공통
- 해당 주차 PR이 모두 `main`에 머지됨
- **Figma 화면과 실제 코드 결과를 나란히 놓고 비교** — 명백한 차이 없음
- 머지된 코드가 **로컬 + Vercel preview**에서 정상 동작 확인됨
- 스크린샷이 회의록에 첨부됨

---

## 1. 5주 로드맵 (한눈에)

```
Week 1 ──── Week 2 ──── Week 3 ──── Week 4 ──── Week 5
Foundation  Main         Tutorial+    Mobile +    Code Freeze
+ Component Screens      Pause+       Polish +    + QA + Deploy
Library     (Desktop)    Settings     Performance + 발표
            Assembly     + State
```

| 주차 | 주제 | 핵심 산출물 |
|---|---|---|
| **W1** | Foundation + 컴포넌트 라이브러리 | 토큰 + 폰트 + Git 인프라 + 컴포넌트 12종 (Button, Word, HUD, Notebook, HP, Toast, Grade, Toggle, Professor, Desk 등) |
| **W2** | 메인 화면 조립 (Desktop) | Start + Play + Game Over 한 사이클 완전 동작 |
| **W3** | 부 화면 + State 변형 | Tutorial 5장 + Pause + Settings 3탭 + Leaderboard + Achievements + Boss/LevelUp/Daily |
| **W4** | 모바일 + 폴리시 + 성능 | 모든 화면 모바일 반응형 · <480 안내 · 60fps 검증 · PWA |
| **W5** | QA · 배포 · 발표 | 🚨 Code Freeze · 버그 · 접근성 · Vercel 배포 · 시연 + 발표자료 |

---

## 2. Figma 노드 ID 참조표

작업할 때 화면을 빨리 찾기 위한 인덱스. 클릭하면 Figma 해당 화면으로 점프.

### Desktop (1440×900)
| 화면 | 노드 ID | 직접 링크 |
|---|---|---|
| Start | `6:4` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=6-4 |
| Play | `7:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=7-2 |
| Game Over | `8:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=8-2 |
| Pause | `15:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=15-2 |
| Settings · 강의 | `16:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=16-2 |
| Settings · 외관 | `18:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=18-2 |
| Settings · 사운드 | `19:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=19-2 |
| Leaderboard | `20:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-2 |
| Achievements | `20:138` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-138 |
| State · Boss 등장 | `21:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=21-2 |
| State · Level up | `21:29` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=21-29 |

### Mobile (375×812)
| 화면 | 노드 ID | 직접 링크 |
|---|---|---|
| Start | `11:4` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=11-4 |
| Play | `12:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=12-2 |
| Game Over | `13:2` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=13-2 |
| Pause | `15:14` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=15-14 |
| Settings · 강의 | `16:68` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=16-68 |
| Settings · 외관 | `18:78` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=18-78 |
| Settings · 사운드 | `19:79` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=19-79 |
| Leaderboard | `20:78` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-78 |
| Achievements | `20:217` | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-217 |
| <480 안내 | (Mobile 페이지 끝) | https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO |

### Components / Illustrations
| 컴포넌트 | 노드 ID |
|---|---|
| Button (36 variants) | `2:80` |
| Toggle | `2:87` |
| Word Chip (8 variants) | `2:108` |
| HUD Pill (4 variants) | `2:125` |
| Notebook Input | `3:16` |
| HP Bar (3 variants) | `3:36` |
| Toast | `3:55` |
| Grade Stamp (5 variants) | `3:70` |
| Daily Attendance | `21:59` |
| Professor (3 poses) | `4:36` |
| Student Desk (5) | `4:77` |
| Chalkboard (2 sizes) | `4:90` |

---

## 3. 주차별 상세

### Week 1 — Foundation + Component Library (5/4 ~ 5/10)

> **목표:** 5주 일정의 기초공사 + **재사용 컴포넌트 12종**을 미리 다 만든다.
> W2부터 화면 조립이 단순한 import + 배치로 끝나도록 한다.

#### 박태준 (Tech Lead · Infra)
- [ ] [CONTRIBUTING.md](CONTRIBUTING.md) 팀에 공유 + 1차 회의 Q&A
- [ ] GitHub 저장소 정비 — Branch protection · `.github/pull_request_template.md` · Issue 템플릿
- [ ] `.editorconfig` · `.prettierrc` · `.gitignore` 정비
- [ ] **Figma 토큰 → `css/tokens.css` 추출** (CSS 변수)
  - 컬러 37개 (`--color-surface-paper`, `--color-chalkboard-mid` 등)
  - 폰트 패밀리 4개 (`--font-ui`, `--font-chalk`, `--font-mono`, `--font-title`)
  - 폰트 사이즈 9단계 / 스페이싱 9단계 / 그림자 5종 / 라디우스 5종
- [ ] `index.html` 웹폰트 4종 로드 (Pretendard / Black Han Sans / Gaegu / JetBrains Mono — Google Fonts CDN)
- [ ] `js/game.js` 매직 넘버 → `js/config.js` 분리 (선언적 설정)
- [ ] **단어 파괴 분필 가루 파티클** (8개 div, 0.4s 애니메이션)
- [ ] **`js/themes.js`에 강의 필기 테마 등록** + 기본값으로 설정 (기존 Neon/Retro/Cyber/Minimal은 외관 옵션으로 유지)

#### 전재형 (UI 컴포넌트 6종)
- [ ] **Button + Toggle** (Figma [2:80](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=2-80) / [2:87](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=2-87))
  - primary / secondary / ghost · sm/md/lg · default/hover/active/disabled
- [ ] **Word Chip** (Figma [2:108](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=2-108))
  - easy / medium / hard / boss 4 난이도 + 입력 진행 상태
- [ ] **HUD Pill** (Figma [2:125](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=2-125))
  - default / accent / good / bad 4 톤
- [ ] **Professor + Student Desk 일러스트** (Figma [4:36](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=4-36) / [4:77](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=4-77))
  - Professor 3 포즈 (writing / watching / angry)
  - Student Desk 5 variants (NPC 4 + Player)
- [ ] **컴포넌트 데모 페이지** — `components.html` (단독 렌더링 + 상태별 시각 확인)

#### 김지우 (입력/표시 컴포넌트 4종 + 도전과제 정의)
- [ ] **Notebook Input** (Figma [3:16](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=3-16))
  - 종이 톤 + 줄무늬 + 연필 + 친 글자(초록) + 안 친 글자(회색) + 커서 + 메타
- [ ] **HP Bar** (Figma [3:36](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=3-36))
  - 3 상태 (ok ≥65% / warn 30~65% / danger <30%) + 색상 자동 전환
- [ ] **Toast** (Figma [3:55](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=3-55))
  - 종이 카드 + 도장 아이콘 + 제목 + 설명 + 우상단 슬라이드 인
- [ ] **Grade Stamp** (Figma [3:70](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=3-70))
  - 5 학점 (A+ / A / B / C / F) + 학점별 색 토큰 + -12deg 회전
- [ ] **도전과제 12개 정의** — `js/achievements.js`
  - 첫 받아적기 / 집중력(콤보 10) / 집중력 폭발(콤보 50) / 우등생(A+) / 졸업(LV15) / 속전속결(WPM100) / 개근(7일 Daily) / 보스 헌터 / 완벽주의 / 야간 자율학습 / 독학 / 수석

#### Definition of Done
- `css/tokens.css`가 main에 머지되어 다른 CSS 파일이 `@import`해서 사용 가능
- 4종 웹폰트가 실제 페이지에서 로드됨 (네트워크 탭 확인)
- **컴포넌트 12종이 `components.html` 데모 페이지에서 단독 렌더링** (스토리북 역할)
- 도전과제 12개의 잠금해제 조건이 코드로 명세됨 (구현은 W2~W4)

---

### Week 2 — Main Screens Assembly (5/11 ~ 5/17)

> **목표:** Start + Play + Game Over **세 메인 화면**을 Figma 그대로 옮긴다.
> W1에서 만든 컴포넌트를 import해서 조립하므로 새로운 CSS는 최소한.
> 한 사이클 (Start → Play → Game Over → Restart)이 완전히 동작.

#### 박태준
- [ ] **학점 계산 함수** — `score`, `accuracy`, `wpm` 입력 → A+/A/A-/B/C/F 출력
  - 임계값을 `js/config.js`에 명시 (A+ ≥95%+10000점 등)
- [ ] **콤보 시스템** + 콤보 ≥10일 때 노트 글로우 효과
- [ ] **키 입력 효과** (`js/input.js`)
  - 정타: 노트 0.08s 펄스
  - 오타: 노트 좌우 6px shake (0.2s) + `--color-typing-error` 플래시
- [ ] **Word 클래스 리팩터링** — DOM 구조 단순화, 파괴 시 W1 파티클 효과 호출
- [ ] **언어 전환 시 진행 단어 처리 정책** — 게임 중 언어 변경 시 활성 단어를 어떻게 할지 결정 (drop 권장: 모두 즉시 destroy + 새 언어로 spawn 재개) → `config.js`에 정책 명시 + `setWordLanguage()` 호출 시 적용
- [ ] PR 리뷰 + 머지 (병목 방지)

#### 전재형 (메인 화면 2개)
- [ ] **Start 화면 구현** ([Figma 6:4](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=6-4))
  - 강의실 벽+마룻바닥 그라디언트 배경
  - 칠판 안 큰 타이틀 (Black Han Sans)
  - HIGH SCORE 라인 + 모드(4) / 언어(12) / 난이도(3) 토글
  - "받아적을게요" CTA + 책상 5개 (W1 Student Desk 인스턴스)
- [ ] **Play 화면 구현** ([Figma 7:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=7-2))
  - 벽+바닥 배경 + HUD 좌3 우3 pill (W1 HUD Pill 사용)
  - HP 게이지 바 (W1 HP Bar 사용)
  - 미니 칠판 (단원 텍스트 + Gaegu)
  - 단어 낙하 영역 (W1 Word Chip 사용)
  - 책상 5개 + Notebook (W1 Notebook Input 사용)

#### 김지우 (Game Over + 통계)
- [ ] **Game Over 성적표 화면** ([Figma 8:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=8-2))
  - 종이 카드 + -1deg 회전 + paper shadow
  - **Grade Stamp** (W1 컴포넌트) 학점 매핑
  - "★ NEW RECORD! ★" 조건부 표시
  - 통계 그리드 (점수/콤보/레벨/divider/WPM/정확도/단어수)
  - 액션 버튼 4개 (다시 수강 / 순위표 / 도전과제 / 공유)
- [ ] **통계 계산 함수** — WPM, 정확도, 단어수 산출 + 박태준 학점 함수와 연결
- [ ] W1 컴포넌트의 게임 통합 점검 — Word Chip이 실제 낙하 동작에서 멀쩡한지

#### Definition of Done
- 게임 한 사이클 (Start → Play → Game Over → Restart)이 끊김 없이 동작
- Start / Play / Game Over 모두 Figma와 픽셀 단위 거의 일치 (5px 이내)
- HP가 변할 때 색상이 자연스럽게 바뀜 (ok→warn→danger)
- 단어를 깨면 분필 가루가 흩어짐 (W1 박태준 작업 + W2 통합)

---

### Week 3 — Tutorial + Pause + Settings + State (5/18 ~ 5/24)

> **목표:** 부 화면(Tutorial / Pause / Settings) + 오버레이(Leaderboard / Achievements) + 게임 액션 변형(Boss / LevelUp / Daily)을 모두 완성.
> 데스크톱 기준 모든 화면이 끝나는 주차.

#### 박태준 (게임 액션)
- [ ] **보스 단어 등장** ([Figma 21:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=21-2))
  - 5% 확률 등장 (Lv 3+) + 종소리 + 화면 흔들림 0.2s + 처치 시 +200 보너스
- [ ] **레벨업 트랜지션** ([Figma 21:29](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=21-29))
  - 칠판 wipe (구단원 페이드 + 흰 분필가루 띠 + 신단원 노란 글씨)
  - LV.X 토스트 (1.2s 자동 닫힘) · duration 600ms ease-out
- [ ] **Daily 출석 도장** ([Figma 21:59](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=21-59))
  - localStorage에 7일 출석 기록 + done/today/pending 3 상태

#### 전재형 (Tutorial · Pause · Settings 3탭)
- [ ] **Tutorial 5 슬라이드**
  - 점 인디케이터 + 일러스트 영역 + 다음/다음에 버튼
  - 마지막 슬라이드: "받아적을게요" → Play 시작
- [ ] **Tutorial 첫 실행 분기 로직**
  - Start 화면 진입 시 `localStorage.tutorial_done` 체크
  - 미설정이면 자동으로 Tutorial 띄우기, "다음에..."로 닫으면 그때부터 `tutorial_done = true`
  - "도움말" 버튼으로 언제든 다시 볼 수 있게 (Settings 외관 탭 또는 Start 좌하단)
- [ ] **Pause 오버레이** ([Figma 15:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=15-2))
  - 배경 sepia + dim 0.55 + 종이 카드 + PAUSED + "메뉴로 나가기"
- [ ] **Settings 화면 3탭** ([16:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=16-2) / [18:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=18-2) / [19:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=19-2))
  - 강의 탭: 12 언어 + 3 난이도 + Custom Words 펼침
  - 외관 탭: 5 테마 카드 + 폰트 크기 3 + 모션줄이기/고대비
  - 사운드 탭: 마스터/효과음/BGM 슬라이더 + 분필 소리 3 + 키보드/종/레벨업

#### 김지우 (오버레이 + 사운드)
- [ ] **Leaderboard 오버레이** ([Figma 20:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-2))
  - 8명 순위 + YOU 행 강조 + 전체/이번주/오늘 탭
  - localStorage 기반 (서버 없음)
- [ ] **Achievements 오버레이** ([Figma 20:138](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=20-138))
  - W1에서 정의한 12 도전과제 그리드 표시
  - 획득(액센트 도장) / 미획득(자물쇠 + 점선) / 필터 3종
- [ ] **사운드 효과 추가** — 분필 / 종 / 레벨업 (라이선스 확인된 무료 음원)
- [ ] **AudioContext unlock** — 브라우저 자동재생 정책 대응. 첫 키 입력 시 `audioCtx.resume()` 호출 + 무음 buffer 1회 재생으로 unlock
- [ ] **도전과제 잠금해제 트리거** 코드 연결 (게임 이벤트 → unlocked 처리)
- [ ] **모드별 동작 검증**
  - Classic: HP 5에서 시작, 단어 미스 시 -1
  - Time Attack: 120초 타이머 + 종료 시 통계 화면
  - Zen: 3분 타이핑 테스트 (HP 무한, WPM/정확도만 측정 + HUD HP/콤보 숨김)
  - Daily: 시드 기반 단어 (`seededRandom`) + 출석 도장 연동

#### Definition of Done
- 모든 데스크톱 화면 (메인 3 + 부 3 + 오버레이 2 = 8개) 완성
- Settings 3탭 값이 localStorage 저장 + 게임에 반영됨
- 보스 단어가 나오면 "와 큰일났다" 텐션 명확히 느껴짐
- 레벨업 시 칠판이 깔끔하게 닦이고 새 단원이 나타남
- **4개 모드(Classic / Time Attack / Zen / Daily) 모두 처음~끝 정상 동작**
- **Tutorial이 첫 실행 시 자동 표시 + 이후엔 안 뜸 (localStorage 동작)**
- **사운드가 첫 키 입력 후부터 정상 재생 (브라우저 자동재생 정책 통과)**

---

### Week 4 — Mobile + Polish + Performance (5/25 ~ 5/31)

> **목표:** 모든 화면을 모바일 반응형으로 + 60fps 성능 + PWA 검증.
> 게임을 "어떤 디바이스에서도 즐길 수 있게" 만든다.

#### 박태준 (성능 + 모바일 입력)
- [ ] **모바일 입력 처리** — `js/input.js`
  - 가상 키보드 대응 (모바일 브라우저)
  - 화면 터치 시 hidden input 포커싱
- [ ] **성능 최적화** — Chrome DevTools Performance
  - 60fps 유지 검증 (단어 20개 동시)
  - DOM reflow 분석 + transform/opacity 위주 재구성
- [ ] **PWA 동작 검증** — manifest, sw.js, offline 시 동작
- [ ] **단어 충돌 방지** — 새 단어 spawn 시 기존 단어와 겹치지 않게 X 위치 조정

#### 전재형 (메인 화면 모바일)
- [ ] **모바일 — Start / Play / Game Over** (Figma [11:4](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=11-4) · [12:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=12-2) · [13:2](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO?node-id=13-2))
  - 768px 미만 미디어 쿼리
  - HUD 단일 행 → 2행 3열
  - 책상 5→2개 + 칠판 컴팩트
- [ ] **모바일 — Tutorial / Pause / Settings 3탭**
  - Settings 탭 바를 가로 스크롤로 변경 (필요 시)
  - 모달이 화면 폭 100% 사용
- [ ] **모바일 인터랙션** — 터치 친화 (버튼 최소 44px 높이 보장)

#### 김지우 (오버레이 모바일 + QA)
- [ ] **모바일 — Leaderboard / Achievements**
  - 카드 폭 100% / 정보 압축 (Desktop의 일부 컬럼 숨김)
- [ ] **<480 안내 화면** — `min-width: 320px` 미만에서 안내 카드
  - "그래도 진행할게요" / "브라우저 전체화면 / 가로로 회전" 안내
- [ ] **모바일 도전과제 트리거 검증** — 모든 도전과제가 모바일에서도 정상 잠금해제되는지
- [ ] **Lighthouse 1차 측정** — 성능 / 접근성 / SEO 점수 기록

#### Definition of Done
- 모든 화면이 모바일(375px)에서 사용 가능
- 데스크톱 60fps 유지 (단어 20개 동시 시점)
- PWA 설치 + 오프라인 시 정상 로드
- Lighthouse 성능 ≥85, 접근성 ≥90

---

### Week 5 — Code Freeze · QA · Deploy · 발표 (6/1 ~ 6/7)

> **🚨 CODE FREEZE — 새 기능 추가 금지.** 버그 잡고, 다듬고, 발표 준비.

#### 박태준
- [ ] 코드 리뷰 — 5주간 쌓인 TODO/FIXME 제거 또는 이슈화
- [ ] [QA_CRITERIA.md](QA_CRITERIA.md) 기반 **체크리스트 통과** 검증
- [ ] **Vercel 프로덕션 배포** (`vercel --prod --yes --token $VERCEL_TOKEN`)
- [ ] PWA 동작 최종 검증 — manifest, sw.js, offline
- [ ] 성능 최종 — 60fps + LCP < 1.5s
- [ ] **`LICENSE` 파일 추가** (MIT 권장) + 사용한 오픈소스 음원·폰트 라이선스 명시
- [ ] **README.md 정비** — 데모 URL · 스크린샷 · 팀 · 라이선스 · 사용한 오픈소스

#### 전재형
- [ ] **접근성 점검**
  - `prefers-reduced-motion` 동작 확인
  - 키보드만으로 전 화면 조작 가능
  - 명도 대비 4.5:1 이상 (Lighthouse / axe DevTools)
- [ ] **Figma vs 실제 비교** — 모든 화면 스크린샷을 나란히 놓고 명백한 차이 잡기
- [ ] **발표 자료 작성** (슬라이드 10장 내외)
  1. 표지 — Type Defender + 팀
  2. 컨셉 — 시안 E "강의 필기" 메타포
  3. 데모 시연 — Start → Play → Game Over
  4. 디자인 시스템 — Figma 스크린샷
  5. 기술 스택 — 바닐라 JS의 이유
  6. 팀 + 역할
  7. 사용한 오픈소스 — 라이선스 명시
  8. 회고 — 잘된 것 / 아쉬운 것
  9. Future Work
  10. Q&A / Thanks
- [ ] 시연 시나리오 리허설 1회

#### 김지우
- [ ] **버그 사냥** — 4 모드 × 3 난이도 × 12 언어 = 144 조합 중 랜덤 샘플 30개 플레이
- [ ] 발견된 버그를 GitHub Issue → PR로 직접 수정 시도
- [ ] 단어 DB 오타·중복 검수
- [ ] **회고록 작성** — 팀이 배운 것 / 다음에 다르게 할 것

#### Definition of Done — 프로젝트 완료 기준
- ✅ Vercel 프로덕션 URL이 동작
- ✅ README가 처음 보는 사람이 빌드/실행 가능한 수준
- ✅ LICENSE 파일이 저장소 루트에 존재
- ✅ 발표 + 시연 5분 안에 끝낼 수 있음
- ✅ 회고록이 [meeting-notes.md](meeting-notes.md)에 첨부됨
- ✅ §7 산출물 체크리스트의 모든 항목이 ✓
- ✅ 4개 모드 모두 정상 동작 확인됨 (W3 검증 + W5 QA)

> **W5가 끝나면 프로젝트는 완료.** 추가 기능 아이디어는 발표 슬라이드의 "Future Work"에만 등재하고 코드는 손대지 않는다.

---

## 4. 의존성 그래프 (병렬화 가이드)

```
W1 ─ Foundation + Component Library
     │
     ├── 박태준: tokens.css + 폰트 + config.js + 파티클 ──┐
     ├── 전재형: Button/Toggle/Word/HUD/Professor/Desk ──┤
     └── 김지우: Notebook/HPBar/Toast/GradeStamp/도전과제┤
                                                        │
                                                        ▼
W2 ─ Main Screens Assembly
     │ (W1 컴포넌트 import해서 조립)
     ├── 박태준: 학점함수 + 콤보 + 입력효과 + Word 리팩터 ─┐
     ├── 전재형: Start + Play 조립 ──────────────────────┤
     └── 김지우: Game Over + 통계 계산 ──────────────────┤
                                                        │
                                                        ▼
W3 ─ Tutorial + Pause + Settings + State
     │
     ├── 박태준: Boss + LevelUp + Daily 도장 ────────────┐
     ├── 전재형: Tutorial 5 + Pause + Settings 3탭 ──────┤
     └── 김지우: Leaderboard + Achievements + 사운드 ────┤
                                                        │
                                                        ▼
W4 ─ Mobile + Polish + Performance
     │
     ├── 박태준: 모바일 입력 + 60fps + PWA + 충돌 방지 ──┐
     ├── 전재형: 모바일 메인 3 + Tutorial/Pause/Settings ┤
     └── 김지우: 모바일 오버레이 + <480 + Lighthouse ────┤
                                                        │
                                                        ▼
W5 ─ Code Freeze · QA · Deploy · 발표
     │
     ├── 박태준: 배포 + 성능 + README ──┐
     ├── 전재형: 접근성 + 발표 + 리허설 ┤
     └── 김지우: 버그 + 회고 ───────────┘
```

**Critical Path:** W1 컴포넌트 12종 머지 → W2 화면 조립 → W3 Settings/Overlay/State → W4 모바일.
W1이 늦으면 W2~W4가 모두 미뤄짐. **W1을 가장 빨리 끝내는 게 일정 안정성에 직결된다.**

---

## 5. 리스크 관리

| 리스크 | 영향 | 완화책 |
|---|---|---|
| W1 컴포넌트 12종 미완성 | W2~W4 조립 지연 | 컴포넌트별로 완료 즉시 머지 → 다른 사람이 다음 컴포넌트로 이동. 하나라도 W1 끝까지 안 되면 W2 첫날 우선 완료 |
| Git/PR 컨벤션 어김 | main 히스토리 깨짐 | [CONTRIBUTING.md](CONTRIBUTING.md) 정독 + 박태준 1차 리뷰 강제 |
| 시험·과제 겹침 | 가용 시간 ↓ | 매주 회의에서 그 주 가용 시간 먼저 공유 + 어려운 컴포넌트는 박태준이 떠맡기 |
| Figma vs 코드 괴리 | 재작업 발생 | DoD에 "Figma와 코드 나란히 비교" 명시 |
| 새 기능 욕심 | 마감 펑크 | W5는 Code Freeze. 후보는 "Future Work" 슬라이드 |
| Vercel 배포 첫 시도 실패 | 발표 시연 불가 | 5/30 안에 dry-run 1회 + 백업으로 GitHub Pages 검토 |
| **디자인 변경 욕심** | 5주 일정 폭주 | "디자인 변경 = W6 이후" 원칙. 작은 텍스트 변경만 인라인 OK |
| 모바일 가상 키보드 이슈 | 모바일 플레이 불가 | W4 박태준 우선순위. 안 되면 모바일은 "구경용"으로 솔직히 표기 |

---

## 6. "디자인은 박태준이 만든 Figma 그대로" 원칙

이 프로젝트의 핵심 약속:

1. **팀원은 Figma에 있는 것을 코드로 옮긴다.** "이게 더 나아요"라는 제안은 W6 이후로 미룬다.
2. **박태준은 디자인 변경을 만들지 않는다.** 5주 동안 Figma 파일은 동결(frozen). 변경이 정말 필요하면 회의에서 합의 후 박태준이 Figma에 반영, 그 다음 팀원이 코드 동기화.
3. **이유:** 평가 시 "디자인 / 개발 분리"가 명확해야 협업 평가 항목에서 점수가 잘 나옴 + 팀원이 디자인 결정에 머리 쓰지 않고 구현에만 집중하면 결과물 품질이 더 높아짐.

---

## 7. 산출물 체크리스트 (제출용)

학기말에 제출할 것들 미리 정리.

- [ ] 코드 (GitHub 저장소 링크)
- [ ] 배포 URL (Vercel)
- [ ] 🎨 [Figma 파일](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO) — view-only 공유 링크
- [ ] [README.md](README.md) — 빌드/실행 · 스크린샷 · 팀 · 사용한 오픈소스
- [ ] [DESIGN.md](DESIGN.md) · [design-system.html](design-system.html)
- [ ] [WORK_PLAN.md](WORK_PLAN.md) · [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] [QA_CRITERIA.md](QA_CRITERIA.md) — 체크리스트 결과 포함
- [ ] [meeting-notes.md](meeting-notes.md) — 5~10주차 회의록 추가
- [ ] 발표 슬라이드 (PDF 또는 링크)
- [ ] 회고록 (lessons-learned)
- [ ] LICENSE (MIT 권장)

---

## 8. 변경 이력

| 일자 | 버전 | 변경 |
|---|---|---|
| 2026-05-04 | v0.1 | 시안 E 채택 후 5주 분배표 초안 (디자인+개발 통합 가정) |
| 2026-05-04 | v0.2 | 디자인 100% 사전 완성 전제로 전면 재작성 (Figma 노드 ID 참조표 추가, 모든 W의 디자인 작업 항목 제거) |
| 2026-05-04 | v0.3 | HTML/CSS/JS 학습 완료 전제로 재작성 — W1을 "환경 셋업 + 첫 PR 연습"에서 "Foundation + 컴포넌트 라이브러리 12종"으로 강화. 학습 자료 섹션 제거. W2부터 컴포넌트 import 조립 방식. 의존성 그래프 / 리스크 표 갱신. |
| 2026-05-04 | **v0.4** | **W6 없이 W1~W5만으로 프로젝트 완료** 보장. 누락 5건을 명시적으로 분배: 강의 필기 테마 등록(W1) · 언어 전환 시 단어 처리 정책(W2) · Tutorial 첫 실행 분기(W3) · AudioContext unlock(W3) · LICENSE 파일(W5). 4개 모드별 동작 검증을 W3 김지우에 추가. W5 DoD를 "프로젝트 완료 기준"으로 격상. |

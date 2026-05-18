# Type Defender — Design System

> **Concept E · "강의 필기"** — 교실 일러스트 + 필기 받아적기 메타포
> 모든 디자인 결정의 단일 진실 원천(Single Source of Truth).
> Figma 작업과 코드 구현은 모두 이 문서를 기준으로 한다.

> 🎨 **Figma 파일:** https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO
> 📋 **시각 레퍼런스:** [design-system.html](design-system.html)
> 🗓 **5주 작업 분배:** [WORK_PLAN.md](WORK_PLAN.md)

---

## 1. 디자인 컨셉

### 1.1 한 줄 요약
> "교수님이 칠판에 빠르게 적어 내리는 필기를, 학생인 플레이어가 키보드로 받아적어 학점을 지키는 게임."

### 1.2 메타포 매핑
게임 메커닉을 "강의실"의 일상 행동으로 치환한다. 추상적 게임 시스템이 곧 학생의 경험과 일치하도록 만드는 것이 이 디자인의 핵심.

| 게임 시스템 | 강의실 메타포 | 시각·사운드 표현 |
|---|---|---|
| 떨어지는 단어 | 칠판에서 흘러내리는 필기 | 칠판 글씨 → 분필 가루처럼 책상 위로 떨어짐 |
| 정타 | 받아적기 성공 | 노트에 글자 누적 + 분필 소리 `tk` |
| 오타 | 받아적기 실수 | 빨간 X + 페이지 흔들림 |
| 단어 바닥 도달 (HP -1) | 필기 누락 | "MISSED!" + 교수님 정면 응시 |
| 콤보 | 집중력 게이지 | 콤보 ↑ → 노트가 환하게 빛남 |
| 레벨 업 | 진도 빨라짐 (12주차 → 13주차) | 칠판이 휙 지워지고 새 단원 등장 |
| HP 0 (게임 오버) | F학점 위기 | 성적표 화면 |
| 보스 단어 | "기말고사 핵심 키워드" | 큰 글자 + 빨간 박스 + 종소리 |
| Slow 아이템 | "교수님이 잠깐 칠판 응시" | 화면 채도 ↓ + 단어 0.5x 속도 |
| Daily 모드 | "오늘의 출석 퀴즈" | 매일 같은 시드 + 출석 도장 UI |
| Zen 모드 | "자율학습 / 모의 타자 시험" | 칠판 비우고 흰 종이 인터페이스 |

### 1.3 무드 키워드
- **따뜻함** — 형광등 베이지 톤의 강의실
- **약간의 긴장감** — 분필이 빠르게 부딪히는 소리, 시계 초침
- **레트로** — 80~90년대 한국 대학 강의실(나무 책상, 백묵, 출석부)
- **친근함** — 캐릭터 일러스트는 단순화·기하학적, AI slop 회피
- **읽기 좋음** — 게임이지만 교실 분위기 → 폰트 가독성이 우선

### 1.4 No-go (이 디자인에서 피하는 것)
- 사이버펑크 / 네온 / 글리치 (기존 4테마는 *추가 옵션*으로 유지하되 기본 테마를 E로 교체)
- 3D 렌더, 복잡한 그라디언트, 글래스모피즘
- 만화체 SD 캐릭터 (저작권/AI 풍 회피, 단순 도형 조합으로 표현)
- 폰트 4종 이상 혼용

---

## 2. 디자인 토큰

CSS 커스텀 프로퍼티로 구현. 모든 컴포넌트는 토큰을 참조한다 (직접 색상값 사용 금지).

### 2.1 컬러

```css
:root {
  /* ── Surface (배경 / 표면) ─────────────────────── */
  --color-wall-top:       #d9cea6;  /* 강의실 벽 상단 */
  --color-wall-bottom:    #cfc196;  /* 강의실 벽 하단 */
  --color-floor-top:      #c4956a;  /* 마룻바닥 상단 */
  --color-floor-bottom:   #b8895e;  /* 마룻바닥 하단 */
  --color-paper:          #fdf9ee;  /* 노트/필기장 종이 */
  --color-paper-line:     #d4c89a;  /* 필기장 줄 */

  /* ── Chalkboard (칠판) ────────────────────────── */
  --color-board-top:      #2e6b4a;
  --color-board-mid:      #1a5c3a;
  --color-board-bottom:   #225e3f;
  --color-board-frame:    #8b7355;  /* 나무 프레임 */
  --color-board-tray:     #a0916e;  /* 분필 받침대 */
  --color-chalk:          #f4f4eb;  /* 분필 흰색 (살짝 노랑) */
  --color-chalk-dim:      #c8c8b8;  /* 흐려진 분필 (이전 단원) */
  --color-chalk-yellow:   #f6d76a;  /* 강조 분필 */

  /* ── Wood (나무 가구) ─────────────────────────── */
  --color-wood-light:     #b8956b;
  --color-wood-mid:       #a07040;
  --color-wood-dark:      #8a6030;

  /* ── Brand / Accent ──────────────────────────── */
  --color-accent:         #d97706;  /* 출석부 빨강·주황 (CTA) */
  --color-accent-deep:    #b45309;
  --color-success:        #15803d;  /* 정타·A학점 */
  --color-warn:           #b45309;  /* 콤보·경고 */
  --color-danger:         #c2410c;  /* HP 위험 */
  --color-info:           #1e6091;  /* 학번·정보 */

  /* ── Grade (학점 컬러) ────────────────────────── */
  --color-grade-aplus:    #15803d;  /* A+ */
  --color-grade-a:        #166534;  /* A / A- */
  --color-grade-b:        #ca8a04;  /* B */
  --color-grade-c:        #ea580c;  /* C */
  --color-grade-f:        #c2410c;  /* F (게임오버) */

  /* ── Text ────────────────────────────────────── */
  --color-text:           #2b241a;  /* 본문 (다크 브라운) */
  --color-text-soft:      #5a4d3a;
  --color-text-mute:      #8a7a62;
  --color-text-on-board:  #f4f4eb;  /* 칠판 위 흰 분필 */
  --color-text-on-paper:  #2b241a;  /* 종이 위 검정 */

  /* ── State ───────────────────────────────────── */
  --color-typed:          #15803d;  /* 이미 친 글자 (초록) */
  --color-untyped:        #f4f4eb;  /* 아직 안 친 글자 (분필 흰) */
  --color-error:          #c2410c;  /* 오타 */
  --color-cursor:         #f6d76a;  /* 커서 (노랑 분필) */
}
```

### 2.2 타이포그래피

**폰트 패밀리**
- **본문 (UI):** `'Pretendard Variable', 'Pretendard', 'Noto Sans KR', system-ui, sans-serif`
- **칠판 글씨:** `'Gaegu', 'Nanum Pen Script', cursive` — 손글씨 느낌
- **숫자 / 점수:** `'JetBrains Mono', 'D2Coding', monospace` — 등폭(가변폭으로 흔들리지 않음)
- **타이틀 / 강조:** `'Black Han Sans', 'Pretendard Variable', sans-serif` — 굵직한 한글 임팩트

> **Why:** 칠판에는 손글씨, 노트(입력영역)에는 단정한 sans-serif, HUD 숫자에는 등폭. 메타포 일관성 우선.

**스케일** (8pt grid 변형, 1.25 ratio)
```
--font-size-xs:    12px   /* 라벨, 보조 */
--font-size-sm:    14px   /* 캡션 */
--font-size-base:  16px   /* 본문 */
--font-size-md:    20px   /* 단어 (easy) */
--font-size-lg:    26px   /* 단어 (medium) */
--font-size-xl:    32px   /* 단어 (hard) */
--font-size-2xl:   44px   /* 단어 (boss) */
--font-size-3xl:   56px   /* 화면 타이틀 */
--font-size-4xl:   84px   /* 게임오버 / 학점 */
```

**굵기**
```
--font-weight-regular: 400
--font-weight-medium:  500
--font-weight-bold:    700
--font-weight-black:   900   /* 타이틀 전용 */
```

**라인 높이**
```
--line-tight:    1.1   /* 타이틀 */
--line-snug:     1.3   /* 단어 / 칠판 */
--line-normal:   1.5   /* 본문 */
--line-loose:    1.7   /* 긴 설명문 (튜토리얼) */
```

### 2.3 스페이싱 (8pt grid)
```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
--space-7: 48px
--space-8: 64px
--space-9: 96px
```

### 2.4 라디우스
```
--radius-sm:  4px    /* 칩, 라벨 */
--radius-md:  8px    /* 버튼, 입력 */
--radius-lg:  16px   /* 카드, 패널 */
--radius-xl:  24px   /* 모달 */
--radius-pill: 999px
```

### 2.5 그림자 (강의실 분위기 = 부드럽고 따뜻한 그림자)
```
--shadow-sm:  0 1px 2px rgba(43, 36, 26, 0.10);
--shadow-md:  0 4px 8px rgba(43, 36, 26, 0.12);
--shadow-lg:  0 12px 24px rgba(43, 36, 26, 0.18);
--shadow-board: 0 6px 0 #6b573f, 0 12px 24px rgba(0,0,0,0.25);  /* 칠판 입체 */
--shadow-paper: 0 2px 0 #d4c89a, 0 8px 16px rgba(43, 36, 26, 0.10);  /* 종이 입체 */
```

### 2.6 모션
```
--duration-instant:  80ms
--duration-fast:    180ms
--duration-base:    260ms
--duration-slow:    420ms
--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-snap:   cubic-bezier(0.4, 0.0, 0.2, 1);
```

**모션 원칙**
- 단어 파괴: 분필 가루처럼 8개 파티클이 짧게 0.4s에 흩어짐
- 콤보 ≥ 10: 노트 종이가 살짝 1.02배 펄스
- 레벨 업: 칠판이 위에서 아래로 닦이는 transition (0.6s)
- 게임 오버 진입: 화면 sepia(0.4) + slow motion 0.8s
- `prefers-reduced-motion: reduce` → 모든 애니메이션 0.01ms로 단축 (필수)

### 2.7 z-index 스케일
```
--z-bg:        0     /* 벽 */
--z-board:     10    /* 칠판 */
--z-prof:      20    /* 교수 캐릭터 */
--z-falling:   30    /* 떨어지는 단어 */
--z-floor:     40    /* 바닥 */
--z-desks:     50    /* 책상 + 학생 */
--z-hud:       60    /* HUD */
--z-input:     70    /* 입력영역 */
--z-overlay:   80    /* 일시정지/모달 */
--z-toast:     90    /* 도전과제 토스트 */
--z-fullscreen: 100
```

---

## 3. 컴포넌트 카탈로그

각 컴포넌트는 **States × Variants × A11y**를 명시. Figma에서는 1 컴포넌트 = 1 컴포넌트 셋(Variants 포함)으로 만든다.

### 3.1 Button

**Variants**
- `primary` — 출석부 빨강 (CTA: GAME START)
- `secondary` — 나무톤 보더 (서브 액션)
- `ghost` — 투명 + 호버 시 paper 톤
- `mode` / `theme` / `lang` / `diff` — 토글 (active 상태)

**Sizes:** `sm` (32px), `md` (44px·기본), `lg` (56px·시작 화면)

**States:** default, hover, active(눌림), focus(2px outline), disabled

**A11y:** 모든 버튼 `min-height: 44px` 보장, `:focus-visible` 윤곽선 필수.

### 3.2 Word Chip (떨어지는 단어)

분필로 적힌 텍스트가 칠판에서 떼어져 천천히 내려오는 형태.

**Variants** (난이도별)
| Variant | font-size | color | shadow | 등장 빈도 (Lv 5 기준) |
|---|---|---|---|---|
| easy | `--font-size-md` | `--color-untyped` | sm | 50% |
| medium | `--font-size-lg` | `--color-chalk-yellow` | sm | 30% |
| hard | `--font-size-xl` | `--color-untyped`, 외곽선 굵게 | md | 15% |
| boss | `--font-size-2xl` | `--color-error` (분필 빨강) + 깜빡임 | shadow-board | 5% |

**States:**
- `default` — 분필 흰색
- `partial` — 친 글자: `--color-typed` (초록), 안 친 글자: `--color-untyped` (흰)
- `destroying` — 0.4s 동안 8개 파편으로 분해 후 제거
- `missed` — 바닥 도달 시 빨간 X 0.3s 플래시 후 제거

### 3.3 Notebook Input (입력 영역)

화면 하단의 **노트 종이** 메타포. 타이핑 중인 글자가 여기에 누적 표시.

**Anatomy**
```
┌─────────────────────────────────────────────────┐
│ ✏️  [친 글자: 초록][안 친 글자: 회색]│커서       │  ← 노트 줄
│   JavaScript · LV.5 · MISSED: 3                  │  ← 메타 정보
└─────────────────────────────────────────────────┘
```

**State:**
- 정타 진행: 글자 추가 시 0.08s 펄스
- 오타: 페이지 좌우로 6px 흔들림 + `--color-error` 플래시
- 콤보 10+: 종이 글로우 (`--color-chalk-yellow`)

### 3.4 HUD Pill (상단 정보)

좌측: 교수님 상태 / 점수 / 학점
우측: 콤보 / WPM / 시간 (또는 모드별 표시)

**Anatomy**
```
[ 라벨 ][ 값 ]
```
- 작은 라벨(--color-text-mute) + 큰 값
- 배경: `rgba(253, 249, 238, 0.85)` (반투명 종이)
- 테두리: 1px solid `--color-paper-line`

**Variants:**
- `default` / `accent` (콤보 강조) / `good` (학점 A+) / `bad` (HP 위험)

### 3.5 HP Bar

전통적 하트 5개 → **출석부 게이지**로 변경.

```
HP  [████████░░░░] 65%
```
- 색상: 65%↑ 초록, 30~65% 노랑, 30%↓ 빨강(깜빡임)
- HP 변화 시 0.3s 트랜지션
- 0 도달 시 게이지가 빨갛게 깨지는 효과

### 3.6 Chalkboard Panel

화면 상단 큰 칠판. 단원 / 진도 / 점수 등을 분필 글씨로 표시.

**구성**
- 나무 프레임 (`--color-board-frame`, 8px 보더)
- 표면 그라디언트 (top→bottom 어두워짐)
- 분필 가루 흔적 (radial-gradient subtle)
- 하단 분필 받침대 (`--color-board-tray`)

**용도**
- Play 화면: 떨어지는 단어들의 출처 + 단원 표시 (`> 12주차: 해시맵`)
- 시작 화면: 게임 타이틀
- 게임 오버: "성적표"

### 3.7 Professor Character

CSS Box-model 기반의 단순 픽셀 캐릭터. SVG도 가능 (변형 쉬움).

**구성요소**
- 머리: `--color-skin` (#f5d5b8) + 안경 + 머리카락
- 몸: 회색 정장 (`--color-prof-suit` #7f8c8d)
- 팔 두 개 (오른팔에 분필)
- 다리 두 개

**State (애니메이션 트리거)**
| 상태 | 트리거 | 애니메이션 |
|---|---|---|
| writing | 기본 | 오른팔 위아래 0.6s loop |
| watching | 5초마다 1초 | 정면 응시, 팔 멈춤 |
| angry | HP -1 발생 | 머리 좌우 흔들림 0.4s + "빨리 받아적으세요!" |
| celebrating | 보스 단어 처치 | 박수 0.8s |

### 3.8 Student Desk

플레이어 + NPC 4명 (총 5개 책상, 가로 배치).

- 책상: 나무 상판 + 다리 2개
- 학생: 단순 원형 머리 + 사각 몸통
- 플레이어 책상: 초록 배지("YOU") + 노트가 책상 위에 있음
- NPC 학생: 머리/몸 색상 랜덤 (5색 팔레트 안에서)
- 콤보 ≥ 20일 때 NPC들이 0.3s 살짝 고개를 플레이어 쪽으로 돌림 (시기 어린 시선)

### 3.9 Toast / Achievement

화면 우측 상단 슬라이드 인.
- 종이 카드 (paper shadow)
- 도장 형태 아이콘 + 제목 + 한 줄 설명

### 3.10 Modal / Overlay

- 배경: `rgba(43, 36, 26, 0.6)` (브라운 톤 backdrop)
- 컨테이너: `--color-paper` 종이 + `--shadow-paper`
- 등장: scale 0.96 → 1, opacity 0 → 1, 0.26s

---

## 4. 화면 명세

각 화면은 와이어프레임 → Figma 프레임 1:1로 옮기기 좋게 명시.

### 4.1 Start (강의실 입장)
**프레임 사이즈:** 1280×800 (Desktop), 768×1024 (Tablet), 375×812 (Mobile)

```
┌──────────────────────────────────────────────────────────┐
│   [전체화면]                                  [사운드]    │
│                                                          │
│         ┌─────────────────────────────────┐              │
│         │  TYPE DEFENDER                   │   ← 칠판     │
│         │  (Black Han Sans, 84px)          │     (대형)  │
│         │                                  │              │
│         │  Defend your grade with keys.    │              │
│         └─────────────────────────────────┘              │
│                                                          │
│        HIGH SCORE: 12,450  ·  TODAY: 8,200 (Daily)        │
│                                                          │
│        ┌── 모드 선택 ──┐                                 │
│        [CLASSIC][TIME ATTACK][ZEN][DAILY]               │
│                                                          │
│        ┌── 강의 (단어 DB) ──┐                            │
│        [ALL][JS][TS][PY][JAVA][C++][GO][RS][C][SW][KT][KR]│
│                                                          │
│        ┌── 난이도 ──┐                                    │
│        [EASY][NORMAL][HARD]                              │
│                                                          │
│        ▼ Custom Words (펼치기)                           │
│                                                          │
│        ┌─────────────────────┐                          │
│        │   GAME START         │   ← Primary CTA          │
│        └─────────────────────┘                          │
│        or press ENTER                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**E 컨셉 변경점:**
- 배경 = 강의실 벽 + 마룻바닥 (벽 60% / 바닥 40%)
- 타이틀이 칠판 안에 분필 글씨로
- "강의" = 언어 선택. 라벨을 한글로
- 캐릭터: 책상 1개에 플레이어("YOU") 앉아 있음, 칠판 앞 교수님 + "오늘은 무슨 강의를 들을까요?" 말풍선

### 4.2 Tutorial (오리엔테이션 — 첫 실행 시)

**구성:** 5단계 슬라이드 (1단계당 한 번에 한 가지만 가르침).
1. **칠판을 보세요** — 교수님이 단어를 적습니다 (애니메이션)
2. **떨어지는 글자를 키보드로 받아적으세요** — 한 단어 시연
3. **노트가 비면 안 돼요** — HP 게이지 설명
4. **연속으로 받아적으면 콤보!** — 콤보 시연
5. **준비됐나요?** — `[받아적을게요]` (시작) / `[다음에...]` (취소)

**A11y:** 각 슬라이드는 ESC로 닫기 가능, 다음/이전은 Enter / Backspace로도 조작.

### 4.3 Play (강의 진행 중)

```
┌───────────────────────────────────────────────────────────┐
│ [교수님:칠판보는중] [점수:2,450] [학점:A-]                  │
│                                  [콤보:x14] [WPM:76] [04:23]│
│                                                           │
│ HP ████████░░░░ 65%                                       │
│ ┌─────────────────────────────────────────────────────┐  │
│ │            ┌───────────────────────────┐             │  │
│ │            │ > 12주차: 해시맵           │  ← 칠판     │  │
│ │            │ - 충돌 해결                │             │  │
│ │            │   - Chaining               │             │  │
│ │            │   - Open Addressing        │             │  │
│ │            │ - 시간복잡도: O(1)         │             │  │
│ │            └───────────────────────────┘             │  │
│ │  👨‍🏫 (교수)                                          │  │
│ │     "빨리 받아적으세요!"                              │  │
│ │                                                       │  │
│ │   break       class                                   │  │
│ │      HashMap         Stream                           │  │
│ │   ArrayList     Override                              │  │
│ │       synchronized  ← BOSS (빨강)                     │  │
│ │                                                       │  │
│ │ ─────────────────────────────────── ← base line       │  │
│ │ 🪑(NPC) 🪑(NPC) 🪑(YOU) 🪑(NPC) 🪑(NPC)             │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ✏️  Hash█                                             │ │
│ │   JavaScript · LV.5 · MISSED: 3                       │ │
│ └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**핵심 인터랙션 명세 (Definition of Done)**
- 키 입력 → 화면 반영 < 16ms
- 단어 매칭 시 0.4s 분필 가루 파티클 (8개)
- 보스 단어 등장 시 화면 흔들림 0.2s + 종소리
- ESC 누르면 0.2s 안에 일시정지 오버레이 등장
- 모든 텍스트 폰트 size는 token 사용

### 4.4 Pause (일시정지)
- 배경: 화면 위에 sepia(0.6) + blur(4px)
- 중앙 종이 카드: "PAUSED" + "ESC로 재개" + `[메뉴로 나가기]`

### 4.5 Game Over (성적표)

```
┌───────────────────────────────────────┐
│         ┌────────────────┐            │
│         │   성적표       │             │
│         │  ─────────     │             │
│         │   학점: A-      │   ← 큰 학점  │
│         │  ★ 새 기록!     │             │
│         │                │             │
│         │  점수    12,450 │             │
│         │  최대콤보 x47   │             │
│         │  레벨    9      │             │
│         │  ─────         │             │
│         │  WPM     76     │             │
│         │  정확도  94%    │             │
│         │  단어수  124    │             │
│         └────────────────┘            │
│                                       │
│   [다시 수강] [순위표] [도전과제] [공유] │
└───────────────────────────────────────┘
```

**E 컨셉 변경점**
- "Game Over" → "성적표" (Report Card) 메타포
- 학점 자동 계산: 점수·정확도 기준 A+ ~ F
- 종이 위에 도장처럼 학점 빨간색
- "Restart" → "다시 수강", "Leaderboard" → "순위표"

### 4.6 Settings (설정 — 신규 화면 권장)

기존엔 시작화면에 다 노출되어 있음. 주제별 정리 시 입문자가 압도되지 않음.

탭 3개:
- **강의** — 언어, 난이도, Custom Words
- **외관** — 테마(E·Neon·Retro·Cyber·Minimal), 폰트 크기, 모션 줄이기
- **사운드** — 마스터 볼륨, 효과음, BGM, 분필 소리 on/off

---

## 5. 인터랙션 패턴

### 5.1 정타 (글자 일치)
1. `keydown` 이벤트 발생
2. 활성 단어 중 첫 글자 매칭 검사
3. 매칭 → 해당 단어의 `matched` 인덱스 +1
4. 노트 영역에 글자 추가 + 0.08s 펄스
5. 분필 소리 (`tk`, 무작위 pitch ±5%)

### 5.2 단어 완성
1. 마지막 글자 매칭 시
2. 단어 객체에서 `destroy()` 호출
3. 0.4s 파티클 애니메이션 (분필 가루)
4. 점수 += `10 + combo * 2`, combo += 1
5. 노트 영역 비우기
6. 콤보 표시 갱신, 콤보 ≥ 10이면 노트 종이 글로우

### 5.3 오타
1. 활성 단어 중 첫 글자가 일치하지 않음
2. 노트 좌우 6px shake (0.2s)
3. `--color-error` 플래시
4. 콤보 리셋
5. 오타 사운드 (낮은 톤 `tt`)

### 5.4 단어 미스 (바닥 도달)
1. Word.update에서 y > playArea height 검사
2. HP -1, combo = 0, MISSED 카운트 +1
3. 빨간 X 마크 0.3s 후 destroy
4. 교수님 → angry 상태 0.5s
5. HP 0이면 game over

### 5.5 레벨 업 (30초마다)
1. 칠판 상단에서 하단으로 흰 분필가루 윙 (`linear-gradient` translate)
2. 칠판 텍스트가 다음 단원으로 교체
3. 토스트: "다음 진도! Lv.6"
4. 0.6s 동안 진행

### 5.6 키보드 단축키 (전역)
| 키 | 동작 |
|---|---|
| `Enter` | 시작 화면에서 게임 시작, 게임오버에서 재시작 |
| `ESC` | Play → Pause, Pause → Resume |
| `Tab` (Pause 중) | 메뉴로 나가기 포커스 |
| `F` | 전체화면 토글 |
| `M` | 사운드 토글 |

---

## 6. 일러스트 스타일 가이드

### 6.1 원칙
- **Geometry First** — 사각형, 원, 둥근 사각형의 조합으로만 구성. Path 곡선은 최소.
- **2색 ~ 3색 한정** — 단일 캐릭터에 3색 이상 쓰지 않음.
- **No outline (or 2px solid)** — 외곽선은 없거나, 있다면 모두 동일 두께.
- **No gradient** — 평면 컬러. 단, 벽/바닥/칠판은 단일 그라디언트 OK.

### 6.2 캐릭터 비율 (단순 SD)
- 머리:몸:다리 = 1.0 : 1.2 : 0.8
- 팔: 몸의 0.7배 길이
- 손: 작은 원

### 6.3 환경 일러스트
- 칠판: 직사각형 + 나무 프레임 + 분필 받침
- 책상: 사각 상판 + 다리 2개 + 의자(다리 2개 + 등받이)
- 창문: 옵션 (벽 우측 상단에 사각형 + 십자 격자 + 하늘색)
- 시계: 옵션 (벽 좌측 상단, 원 + 12·3·6·9 표시)

### 6.4 Figma 자산 정리
- 모든 일러스트는 **Component**로 만들어 재사용
- 컬러는 **Color Style**로 등록 (토큰명 그대로)
- 폰트는 **Text Style**로 등록 (`title-1`, `body`, `caption`, `chalk-md`, `mono-num` 등)

---

## 7. 접근성 (A11y)

### 7.1 필수
- **명도 대비** — 본문 4.5:1 이상, 큰 텍스트 3:1 이상 (WCAG AA)
- **포커스 인디케이터** — 모든 인터랙티브 요소 `:focus-visible` 2px outline
- **키보드 전용 조작 가능** — 모든 메뉴/모달 키보드만으로 동작
- **`prefers-reduced-motion`** — 시차/펄스/플래시 모두 비활성화
- **시맨틱 HTML** — `<main>`, `<nav>`, `<button>`, `aria-live` 적극 사용
- **스크린리더 안내** — 게임 시작 시 `aria-live="polite"`로 모드/난이도 알림

### 7.2 Type Defender 특화
- 단어가 색만으로 난이도 구분되지 않게 — 폰트 크기 + 굵기 + 위치도 단서
- HP 변화는 색 + 숫자(`%`) + 화면 흔들림(off 가능) 조합
- 콤보·레벨업은 시각 + 사운드 모두 제공 (둘 다 끌 수 있음)

---

## 8. 반응형 전략

| 브레이크포인트 | 대응 |
|---|---|
| `≥1280px` | Desktop 기준. 모든 요소 1배율 |
| `768~1279px` | 칠판/캐릭터 0.85배, 책상 4개 → 3개 |
| `<768px` | 모바일 — 책상 2개, HUD 단일 행, 입력영역 화면 폭 100% |
| `<480px` | 안내 메시지 표시: "PC 가로화면 권장" + 가능한 부분만 진행 |

> 데스크톱 우선. 모바일은 "기본 플레이 가능 + 가로 권장" 수준까지만.

---

## 9. Figma 작업 가이드 (이 문서를 Figma로 옮기는 방법)

### 9.1 페이지 구성 (권장)
```
🎨 00 — Cover                  ← 표지, 컨셉 한 줄
📐 01 — Foundations            ← 컬러/타이포/스페이싱/그림자 토큰 시각화
🧩 02 — Components             ← Button, Word, HUD, Notebook 등 컴포넌트 셋
🖼️ 03 — Illustrations          ← 교수, 학생, 책상, 칠판, 환경
📱 04 — Screens (Desktop)      ← Start, Play, Pause, GameOver, Settings, Tutorial
📱 05 — Screens (Mobile)       ← 위 화면들 모바일 버전
🔁 06 — Prototype              ← 인터랙션 연결 (Start → Play → GameOver)
📚 07 — Handoff Notes          ← 개발자가 주의해야 할 디테일
```

### 9.2 작업 순서
1. **Foundations** 먼저 — 모든 Color/Text Style을 등록
2. **Illustrations** 다음 — 교수/학생/책상 컴포넌트 만들기
3. **Components** — Button, Word, HUD를 컴포넌트화
4. **Screens** — 컴포넌트 조립으로 화면 구성
5. **Prototype** — 화면 간 연결, 인터랙션은 Smart Animate

### 9.3 Naming Convention
- 컬러 스타일: `color/wall-top`, `color/board-mid`, `color/grade-aplus`
- 텍스트 스타일: `text/title-1`, `text/body`, `text/chalk-md`
- 컴포넌트: `Button/Primary`, `Word/Easy`, `HUD/Pill`
- 프레임: `Screen/Start (Desktop)`, `Screen/Play (Mobile)`

### 9.4 핸드오프
- Dev Mode 활성화 후 토큰 자동 추출 가능
- 필요 시 `figma-tokens` 플러그인으로 JSON export → CSS 변수와 동기화

---

## 10. 변경 이력

| 일자 | 버전 | 변경 |
|---|---|---|
| 2026-05-04 | 0.1 | 시안 E 채택 후 디자인 시스템 초안 작성 |

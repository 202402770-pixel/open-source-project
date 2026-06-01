# Type Defender — 발표 자료 (W5 전재형 분량 · 박태준 대행 초안)

> 발표 시간 5분 / 슬라이드 10장 / 시연 포함.
> 박태준이 5주 진행 사실 기반으로 텍스트 컨텐츠 초안 작성. 전재형이 슬라이드 디자인 + 표지 시각 보강 + 시연 영상 합성.

---

## 슬라이드 1 — 표지

**Type Defender**
강의 필기 디펜스 게임

> 교수님이 칠판에 적는 핵심 단어를 빠르게 받아 적어 학점을 지켜내는 타이핑 디펜스 게임

오픈소스SW · 한국외대 · 2026 봄
박태준 · 전재형 · 김지우

---

## 슬라이드 2 — 컨셉 (시안 E "강의 필기")

**문제 의식**
- 흔한 타이핑 게임 = 우주선/좀비/전쟁 메타포 — 다 봤음
- **차별화** = 우리 일상의 메타포 → "강의 받아쓰기"

**시안 E "강의 필기" 메타포**
- 떨어지는 단어 → 교수님이 칠판에 적는 핵심 키워드
- HP → 학점 게이지 (DESIGN.md §3.5)
- Game Over → 성적표 (학점 도장 A+~F)
- 보스 단어 → 기말고사 핵심 키워드 (종소리 + 화면 흔들림)
- 콤보 글로우 → 노트 종이가 환하게 빛남

→ Figma 시안에서 픽셀 단위로 명세 후 코드로 옮김.

---

## 슬라이드 3 — 데모 시연 (라이브)

**Start → Play → Game Over 한 사이클**

1. 시작 화면 — 모드 4종 (CLASSIC / TIME ATTACK / ZEN / DAILY) + 난이도 3종 (EASY / NORMAL / HARD)
2. 플레이 — 단어 입력 + 콤보 + 학점 글로우 + 보스 단어 발화
3. 레벨업 — 칠판 wipe (분필가루 띠) + LV.X 토스트
4. Game Over — 성적표 + 학점 도장 + 신기록 표시

**+ 부가:** Tutorial · Pause · Settings · Ranking · Achievements · Daily 출석 도장

---

## 슬라이드 4 — 디자인 시스템

**단일 진실 원천 4개:**

1. 🎨 [Figma 디자인](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO) — 픽셀 단위 진실
2. 📐 [DESIGN.md](./DESIGN.md) — 토큰 · 인터랙션 · 접근성 명세
3. 🗓 [WORK_PLAN.md](./WORK_PLAN.md) — 5주 분배표
4. 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) — Git 컨벤션

**디자인 토큰 (`css/tokens.css`):**
- Color 37개 (벽 · 칠판 · 분필 · 학점 · 상태 · 텍스트)
- 폰트 4종 (Pretendard / Black Han Sans / Gaegu / JetBrains Mono)
- 스페이싱 · 그림자 · 라운드 — 일관된 시각

→ Figma 시안 ↔ tokens.css ↔ 운영 코드 1:1 매핑.

---

## 슬라이드 5 — 기술 스택

**Vanilla JavaScript — 의도적**

| 분야 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | 없음 | 학습 가치 + 의존성 0 |
| 빌드 | 없음 | 정적 파일 그대로 |
| 데이터 | localStorage | 서버 없음 — 오픈소스 배포 단순 |
| 사운드 | Web Audio API | mp3 + AudioContext unlock |
| PWA | manifest + Service Worker | 오프라인 + 홈 화면 설치 |
| 검증 | Lighthouse + Playwright | E2E 10건 자동화 |

**파일 구조:**
- `css/` 2 파일 (tokens + style)
- `js/` 14 파일 (config / themes / effects / game-api / wordData / achievements / grade / sound / ui / input / game / main / effects-bindings)
- `assets/sounds/` 3 mp3

→ "라이브러리 없이 어디까지 가능한가" 실험.

---

## 슬라이드 6 — 아키텍처: GameAPI publish-subscribe

**문제:** game.js (김지우) 코어에 effects 코드 (박태준)가 박히면 owner 경계 흐려짐.

**해결:** `js/game-api.js` 슬롯 패턴

```js
window.GameAPI = {
  onComboChange:   null, // game.js가 호출
  onCorrectChar:   null,
  onWrongChar:     null,
  onWordDestroyed: null, // effects-bindings.js가 등록
};
```

**publisher** (`game.js`): `if (GameAPI.onWordDestroyed) GameAPI.onWordDestroyed(x, y);`
**subscriber** (`effects-bindings.js`): `GameAPI.onWordDestroyed = (x, y) => Effects.chalkDust(x, y);`

→ 두 영역이 인터페이스로만 연결. 같은 파일 안에서 코드 충돌 없음.

---

## 슬라이드 7 — 팀 + 역할

| 이름 | 역할 | 핵심 산출물 |
|---|---|---|
| **박태준** | Tech Lead · Infrastructure | 디자인 토큰 · CONFIG · Effects 모듈 · GameAPI 슬롯 · 학점 함수 · 보스 단어 · 레벨업 트랜지션 · Daily 출석 도장 · PWA · 모바일 반응형 · 검증 자동화 |
| **전재형** | Team Lead · UI Design | UI 컴포넌트 6종 · Start/Play 화면 · Tutorial/Pause/Settings 3탭 |
| **김지우** | Components · Game Core | Notebook/HP/Toast/Grade Stamp 컴포넌트 · 도전과제 12종 · 게임 코어 · Game Over 성적표 · 순위표 · 사운드 · 4모드 |

**총 PR 55개 · 머지 commit 55개 · 5 milestone CLOSED**

---

## 슬라이드 8 — 사용된 오픈소스 (라이선스 명시)

**폰트 4종 (OFL 1.1):**
- Pretendard Variable
- Black Han Sans (Google Fonts)
- Gaegu (Google Fonts)
- JetBrains Mono (Google Fonts)

**사운드 3종 (Pixabay royalty-free):**
- `bell.mp3` · `chalk.mp3` · `levelup.mp3`

**라이브러리:** 0개 (Vanilla JavaScript)

**개발 도구 (devDependencies):**
- `lighthouse` — 성능/접근성 자동 측정
- `@playwright/test` — E2E 10건 자동화

→ `LICENSE` 파일 루트에 전부 명시.

---

## 슬라이드 9 — 회고

### ✅ 잘된 것
- **단일 진실 원천 4개** 일관 — Figma / DESIGN / WORK_PLAN / CONTRIBUTING
- **CONTRIBUTING.md 컨벤션** — GitHub Flow + Conventional Commits 한국어 + Squash Merge
- **W1에 토큰/CONFIG 미리** — W2~W5에서 매번 W1 자산 활용 (CONFIG.BOSS, CONFIG.DAILY 등)
- **W4 검증 자동화** — Lighthouse 데스크톱 성능 99 / 접근성 90, Playwright E2E 10건 통과
- **사고 회복 패턴** — main 직접 push 실수를 revert PR + 재발행 PR로 컨벤션 복구

### ⚠ 아쉬운 것
- **stale brench 반복** — 김지우 PR #31/#32/#40, 전재형 #38이 main 동기화 안 한 상태로 발행. 박태준 통합 부담 누적
- **게임 코어 prototype 단계** — 시간 기반 spawn + 낙하 로직 미완 (이슈 #50 — W5+ 결정)
- **모바일 Performance 55** — Lighthouse 모바일은 polish 사안. 발표 데모는 데스크톱 기준

### 🚀 다음에 다르게 할 것
- **PR 시작 전 `git pull --rebase origin main` 자동화** (pre-push hook 또는 CI)
- **게임 코어 spawn 시스템 초기 설계** — W1~W2 단계에서 인프라 결정
- **Figma ↔ 코드 시각 비교 자동화** — Playwright screenshot diff

---

## 슬라이드 10 — Future Work / Q&A / Thanks

**Future Work:**
- 이슈 #50 — 시간 기반 단어 spawn + 낙하 시스템 (게임 코어 본업 마감)
- 멀티 플레이어 — 같은 단어 셋으로 친구와 점수 경쟁
- 12 언어 단어 DB 확장 (현재 영문만)
- Settings의 테마 5종 실제 적용 (현재 classroom 디폴트만)

**Thanks:**
- 박태준 · 전재형 · 김지우
- 오픈소스SW 교수님 · 수강생
- Figma · Pretendard · Pixabay · Vercel · Lighthouse · Playwright

**Q&A**

데모 URL: <https://open-source-project-virid.vercel.app>
리포지토리: <https://github.com/202402770-pixel/open-source-project>

# Type Defender - 회의록

## 5주차 회의 (2026-04-07)

### 참석자
- 전재형(팀장), 박태준, 김지우

### 안건

**1. 세부 내용 개발 상황 공유**
- 박태준: 프로토타입 제작 및 Vercel 배포 완료
  - 순수 JS + HTML + CSS 기반, 핵심 게임 루프 구현
  - 4가지 모드(Classic/Time Attack/Zen/Daily), 한영 입력 지원
  - 배포 URL: https://type-defender.vercel.app
- 전재형: JavaScript 기초 문법 유튜브 강의 학습, CSS/HTML 문헌 학습
  - 인터프리터 기반 개발의 유연성 이해
  - 애니메이션 구현을 위한 스프라이트 시트 조사
- 김지우: HTML 구조/문법 유튜브 강의 학습 및 정리
  - 시맨틱 태그를 활용한 구조 설계 학습
  - CSS 학습으로 넘어갈 예정

**2. 레퍼런스 게임 분석**
- 한컴타자연습 산성비: https://acidrain.hancomtaja.com/?gamekey=acidrain
- Glyphica: https://store.steampowered.com/app/2400160/Glyphica_Typing_Survival/?l=koreana
- Type Defense: https://store.steampowered.com/app/904440/Type_Defense/?l=koreana
- Type Defense 3D: https://play.google.com/store/apps/details?id=com.slg.TypingDefense3D&hl=ko

**3. 게임 컨셉 논의**
- 대학교 테마: 교수가 단어를 내려주고, 학생이 타이핑으로 없애는 구조
- 시안 1 (시험시간 컨닝): 단어 입력 = 컨닝, 오타 = 걸리는 횟수 증가, 미입력 = 시험 문제 오답
- 시안 2 (필기 받아적기): 교수님 필기를 받아적는 컨셉, 실패 = 필기 누락
- 세부 디자인 레퍼런스는 추가 리서치 필요

**4. 디자인 방향성**
- 초기에 사이버틱한 느낌을 고려했으나, 학교 테마와 맞지 않아 재검토
- 대학생/프로그래밍 주제로 관련 레퍼런스 탐색 중
- 디자인 컨셉 확정은 다음 주로

**5. 단어 데이터(DB) 방향**
- 프로그래밍 관련 단어들을 사용할 예정
- GitHub 오픈소스 데이터셋을 찾아 프로그램에 내장하는 방식으로 구현 계획
- DB 확정은 다음 주로

**6. 시험기간 대응 및 역할 재분배**
- 시험기간으로 인해 전체 작업 시간 확보가 어려운 상황
- 효율적인 작업을 위해 역할 분리 결정:
  - 박태준: 프로젝트 컨셉 및 디자인 자료 리서치 전담
  - 전재형, 김지우: 리서치 기간 동안 웹 프론트엔드 학습에 집중

**7. 정기 회의 시간 결정**
- 매주 월요일 20:00 이후

### 결정 사항
- 게임 테마: 대학교 (시안 2개 중 다음 주 확정)
- 단어 데이터: 프로그래밍 용어 오픈소스 DB 활용 방향
- 역할 분리: 박태준 → 컨셉/디자인 리서치, 전재형·김지우 → 학습 집중 (시험기간 대응)

### 다음 주 할 일
- 박태준: 디자인 레퍼런스 리서치 + 게임 컨셉(시안) 확정 + 프로그래밍 단어 오픈소스 DB 탐색 및 확정
- 전재형: JS 기초 학습 계속, 시험 대비
- 김지우: CSS 학습 진행, 시험 대비

---

## 4주차 회의 (2026-03-31)

### 참석자
- 전재형(팀장), 박태준, 김지우

### 안건

**1. 프로젝트 방향 및 기술 스택 확정**
- 초기 Pygame 기반 개발 고려 → 순수 웹(JS/HTML/CSS) 개발로 방향 선회
- 이유: 약 2달간 웹 생태계 동작 원리를 깊이 학습하기 위함
- 백엔드 없이 클라이언트 사이드 로직에 집중하여 기술적 완성도 우선

**2. 세부 내용 개발 상황 공유**
- 박태준: 프로젝트 전반 기획 및 설계 담당
  - 게임 루프(requestAnimationFrame), 이벤트 처리, 모듈 구조 등 핵심 아키텍처 설계
  - 개발 리드 + 코드 품질 관리(QA) 예정
  - 팀원 학습 방향 안내 및 역할 분담 계획
- 전재형, 김지우: 웹 프론트엔드 공통 기초 학습
  - JavaScript 기초 문법(ES6+), HTML/CSS 구조, DOM 제어 방식
  - C/파이썬 기반 경험을 웹 환경으로 확장하는 데 집중
  - 기초 학습 완료 후 역할 분담 예정 (게임 로직 / UI·UX)

**3. 공통 진행 상황**
- VS Code 등 개발 환경 세팅 진행 중
- 순수 JavaScript 기반 웹 게임 오픈소스 프로젝트 및 튜토리얼 공동 조사
- GitHub 레포지토리는 기초 학습 완료 후 생성 예정

### 결정 사항
- 기술 스택: 순수 JavaScript(ES6+) + HTML + CSS (프레임워크 없음)
- 백엔드 없이 클라이언트 사이드에 집중

### 다음 주 할 일
- 박태준: 프로토타입 제작 및 배포
- 전재형: JS 기초 학습 계속, 스프라이트/애니메이션 조사
- 김지우: HTML/CSS 기초 학습 계속

---

<!--
## N주차 회의 (YYYY-MM-DD)

### 참석자
-

### 안건
-

### 결정 사항
-

### 다음 주 할 일
-

---
-->

## 프로젝트 회고 (W5 김지우 분량 · 박태준 대행 초안)

> WORK_PLAN.md §3 W5 DoD: "회고록이 meeting-notes.md에 첨부됨"
> 박태준이 5주 git log + PR 히스토리 기반으로 초안. 김지우/전재형이 본인 시점 추가/수정.

### 0. 개요
- 기간: 2026-05-04 ~ 2026-06-07 (5주)
- 팀: 박태준 (Tech Lead) · 전재형 (Team Lead) · 김지우 (Game Core)
- 결과물: Vanilla JS 타이핑 디펜스 게임 + PWA + 검증 자동화
- PR 총 55건 · milestone 5건 모두 CLOSED · 이슈 36건 처리

### 1. 주간 진척 요약

**W1 — Foundation + 컴포넌트 라이브러리**
- 박태준: 디자인 토큰 37개 · CONFIG 11 섹션 · Effects 모듈 · 테마 · CONTRIBUTING/PR 템플릿
- 전재형: UI 컴포넌트 6종
- 김지우: 입력 컴포넌트 4종 · 도전과제 12종 정의 · 게임 코어 prototype

**W2 — 메인 화면 조립**
- 박태준: 학점 함수 · GameAPI 슬롯 · effects-bindings · 기획서 정렬 · WPM/MISS_DAMAGE 신규 기획
- 전재형: Start/Play 메인 화면 (PR #16)
- 김지우: Game Over · 통계 · 순위표

**W3 — Tutorial · Pause · Settings · 게임 액션**
- 박태준: 보스 단어 · 레벨업 트랜지션 · Daily 출석 도장
- 전재형: Tutorial/Pause/Settings 3탭 (PR #38)
- 김지우: 도전과제 트리거/UI · 사운드 · 4 모드

**W4 — Mobile + Polish + Performance**
- 박태준: 모바일 입력 · PWA 인프라 · 모바일 반응형 (전재형+김지우 대행) · 검증 자동화 (Lighthouse + Playwright)
- 이슈 #50 (단어 spawn): W5+ 결정 사안 분리

**W5 — Code Freeze · QA · Deploy**
- 박태준: TODO/FIXME cleanup (0건) · LICENSE · README · 단어 DB lint (0 이슈) · 발표 자료 · 회고 초안
- 잔여: Vercel 프로덕션 배포

### 2. 잘된 것

- **단일 진실 원천 4개 일관** — Figma · DESIGN · WORK_PLAN · CONTRIBUTING. 결정 안건 7개 중 5개를 기획서 기준으로 자체 정렬
- **W1 인프라 미리** — CONFIG.BOSS/DAILY/EFFECTS가 W2~W5에서 매번 활용
- **GameAPI publish-subscribe** — 박태준 effects와 김지우 game.js 코드 owner 경계 분리
- **W4 검증 자동화** — Lighthouse 데스크톱 Performance 99 / Accessibility 90, Playwright E2E 10건 통과
- **사고 회복 패턴** — main 직접 push 실수를 revert PR + 재발행 PR로 컨벤션 복구

### 3. 아쉬운 것

- **stale brench 반복** — 김지우 PR #31/#32/#40, 전재형 #38이 main 동기화 안 한 상태로 발행. 박태준 통합 부담 누적
- **게임 코어 prototype 단계** — 시간 기반 spawn + 낙하 로직 미완 (이슈 #50)
- **모바일 Performance 55** — Lighthouse 모바일 점수. W4 DoD는 데스크톱 기준이라 통과했지만 모바일 polish 사안
- **컨벤션 위반 사례** — 전재형 PR #18 self-merge · 박태준 main 직접 push. 둘 다 사후 복구했지만 발생 자체가 아쉬움

### 4. 다음에 다르게 할 것

| # | 액션 | 우선순위 |
|---|---|---|
| 1 | brench 시작 자동화 — `git fetch && git rebase origin/main` pre-push hook | 높음 |
| 2 | 게임 코어 spawn 시스템 W1~W2 단계 결정 | 높음 |
| 3 | 모바일 polish — 이미지 lazy load · 폰트 subset · critical CSS | 중간 |
| 4 | Figma ↔ 코드 시각 비교 자동화 (Playwright screenshot diff) | 중간 |
| 5 | branch protection — main 직접 push 금지 + PR 리뷰 요구 | 낮음 |
| 6 | CI — PR 발행 시 `npm run verify` 자동 실행 (GitHub Actions) | 낮음 |

### 5. 통계

**Git**
- commit (main fast-forward): 55+ 머지 commit
- PR: 55건 (전부 머지)
- 이슈: 36건 (대부분 closed)
- milestone: 5건 모두 CLOSED

**코드**
- HTML 3 · CSS 2 · JS 14 · MD 7 · JSON 2 · MP3 3
- JS 코드 라인 ~2,500줄 · CSS ~2,800줄
- devDependencies 2개 (lighthouse · playwright)

**측정**
- Lighthouse 데스크톱: Performance **99** / Accessibility **90** / Best Practices **96** / SEO **100**
- Lighthouse 모바일: Performance 55 / Accessibility 90 / Best Practices 96 / SEO 100
- Playwright E2E: **10건 pass**
- 단어 DB lint: 90 단어 / **0 이슈**

### 6. 팀원별 시점 (각자 추가 작성)

> 박태준 초안만 잡음. 각자 본인 시점 추가 권장.

**박태준**
- _(각자 작성)_

**전재형**
- _(각자 작성)_

**김지우**
- _(각자 작성)_

---

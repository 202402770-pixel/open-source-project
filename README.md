# Type Defender

> 교수님이 칠판에 적는 핵심 단어를 빠르게 받아 적어 학점을 지켜내는 타이핑 디펜스 게임.

한국외대 오픈소스SW 수업 팀 프로젝트. 시안 E "강의 필기" 메타포로 디자인.

## 🎮 데모

- **데모 URL**: <https://open-source-project-virid.vercel.app>
- **PWA**: 홈 화면에 추가하면 오프라인에서도 동작

## 🖼 스크린샷

| Start | Play | Game Over |
|---|---|---|
| _(W5 발표 자료 작성 시 추가)_ | | |

## 🎯 게임 방법

1. **모드 선택** — Classic / Time Attack / Zen / Daily 4가지
2. **난이도 선택** — Easy / Normal / Hard (시작 HP 7 / 5 / 3, 단어 시간 제한 12s / 8s / 5.6s)
3. **단어 받아쓰기** — 칠판에 표시되는 placeholder 단어를 정확히 입력 (Enter 제출)
4. **시간 제한** — 단어가 1.5초 시차로 spawn. 만료 임박 시 노트 빨간색 경고 (65%) → 펄스 (85%) → HP -1
5. **콤보 유지** — 10 / 20 / 30 단계별 노트 글로우 (강도 점진). 미스 시 콤보 초기화 + 화면 떨림
6. **레벨업** — 단어 모두 처치 시 다음 단원, 칠판 wipe 트랜지션
7. **보스 단어** — Lv 3+ 5% 확률 등장 (종소리 + 화면 흔들림 + +200 보너스)
8. **Game Over / Clear** — 학점 도장(A+/A/A-/B/C/F) + 통계 표시 + 재시작 (페이지 리로드 없이)

설정에서 **테마 5종** (Classroom/Neon/Retro/Cyber/Minimal), **폰트 크기 3단계**, **모션 줄이기**, **고대비**, **사운드 볼륨**, **Custom Words** (직접 입력한 단어로 플레이) 즉시 적용 가능.

## 🧱 기술 스택

- **Vanilla JavaScript** — 라이브러리 없음
- **HTML / CSS** — 디자인 토큰 기반 (`css/tokens.css` / `css/style.css`)
- **localStorage** — 점수·도전과제·설정·출석 저장
- **Web Audio API** — 사운드 효과 (분필 / 종 / 레벨업)
- **PWA** — `manifest.json` + Service Worker (오프라인 동작)

## 🏗 구조

```
type-defender/
├── index.html                 # 메인 화면 (Start/Play/Game Over) + 모달
├── components.html            # W1 컴포넌트 라이브러리 데모
├── design-system.html         # 디자인 토큰 시각화
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (cache-first)
├── LICENSE                    # MIT + 오픈소스 라이선스
├── css/
│   ├── tokens.css             # 디자인 토큰 (색·폰트·간격·shadow)
│   └── style.css              # 모든 컴포넌트 스타일
├── js/
│   ├── config.js              # 게임 설정 (모드·난이도·점수·학점 등)
│   ├── themes.js              # 테마 5종
│   ├── game-api.js            # GameAPI 슬롯 (publish-subscribe)
│   ├── effects.js             # 시각 효과 (분필 가루·펄스·shake·boardWipe)
│   ├── effects-bindings.js    # GameAPI → Effects 라우팅
│   ├── wordData.js            # 단어 데이터 (레벨별 6개 + Daily 시드)
│   ├── achievements.js        # 도전과제 12개 + 출석 체크
│   ├── grade.js               # 학점 계산 (score+accuracy+wpm)
│   ├── sound.js               # Web Audio API 사운드
│   ├── input.js               # 키 입력 + 모바일 터치 포커싱
│   ├── ui.js                  # UI 메서드 (모달·HUD·도장·튜토리얼·설정)
│   ├── game.js                # 게임 상태 (Game 클래스)
│   └── main.js                # 진입점 (DOMContentLoaded → start)
└── assets/sounds/             # bell.mp3 / chalk.mp3 / levelup.mp3
```

## 🧪 검증 자동화

Lighthouse + Playwright E2E로 성능·PWA·접근성·모바일·게임 로직을 자동 측정.

```bash
# 초기 셋업 (1회만)
npm install
npm run playwright:install   # chromium 다운로드 (~150MB)

# 전체 검증 — Lighthouse + Playwright 동시 (60건)
npm run verify
```

**현재 점수**:
- Lighthouse desktop **Performance 100** / Accessibility 90 / Best Practices 96 / SEO 100
- Lighthouse mobile **Performance 98** / Accessibility 90
- Playwright **60건 통과** (PWA / 모달 / 모바일 / 학점 / Settings / Feedback / Lifetime / Hotfix / Viewport)

결과 파일:
- `lighthouse-reports/desktop.report.html` · `mobile.report.html`
- Playwright 실패 시 `playwright-report/index.html`

## 🛠 실행 방법

```bash
git clone https://github.com/202402770-pixel/open-source-project.git
cd open-source-project

# Live Server (VS Code 확장) 또는 간단한 정적 서버
python3 -m http.server 8000
# 또는
npx serve .

# 브라우저에서 http://localhost:8000/ 열기
```

> Service Worker는 `http://` 또는 `https://` 환경에서만 등록됨 (`file://`은 미지원). 정적 서버로 실행 권장.

## 🤝 팀

| 역할 | 이름 | GitHub |
|---|---|---|
| Tech Lead · Infrastructure | 박태준 | [@puze8681](https://github.com/puze8681) |
| Team Lead · UI Design | 전재형 | [@202402770-pixel](https://github.com/202402770-pixel) |
| Components · Game Core | 김지우 | [@oyend](https://github.com/oyend) |

## 📐 단일 진실 원천 (Single Source of Truth)

1. 🎨 [Figma 디자인](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO) — 픽셀 단위 진실
2. 📐 [DESIGN.md](./DESIGN.md) — 토큰·인터랙션·접근성 명세
3. 🗓 [WORK_PLAN.md](./WORK_PLAN.md) — 5주 분배표
4. 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) — Git 컨벤션 (GitHub Flow + Conventional Commits 한국어 + Squash & Merge)

## 📝 변경 이력

[CHANGELOG.md](./CHANGELOG.md) — W1~W5 + 사용성 개선 시리즈 (PR-A~G) 정리.

## 📜 라이선스

[MIT License](./LICENSE) — 사용된 폰트·사운드·라이브러리의 개별 라이선스는 LICENSE 파일 하단 참조.

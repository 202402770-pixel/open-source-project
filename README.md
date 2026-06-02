# Type Defender

> 위에서 떨어지는 단어를 키보드로 타이핑해 라인을 방어하는 **정통 타이핑 디펜스 게임** (ZType 스타일).

한국외대 오픈소스SW 수업 팀 프로젝트.

> **메타포 변경 이력**: W1~W5는 시안 E "강의 필기" 받아쓰기 메타포로 진행. 사용성 개선 시리즈(PR-A~N)에서 박태준 dogfood로 정통 타이핑 디펜스로 본질 전환.

## 🎮 데모

- **데모 URL**: <https://open-source-project-virid.vercel.app>
- **PWA**: 홈 화면에 추가하면 오프라인에서도 동작

## 🖼 스크린샷

| Start | Play | Game Over |
|---|---|---|
| _(W5 발표 자료 작성 시 추가)_ | | |

## 🎯 게임 방법

1. **모드 선택** — Classic / Time Attack (120s) / Zen (HP 무한, 180s) / Daily (시드 단어)
2. **난이도 선택** — Easy / Normal / Hard (시작 HP 7 / 5 / 3, 낙하 속도 0.45×/0.7×/1.0×)
3. **게임 시작** → 1.5초 grace period 후 첫 단어 spawn
4. **단어 낙하** — 칠판 위쪽에서 영어 단어가 다양한 위치에서 spawn되어 천천히 아래로 떨어짐
5. **첫 글자 lock** — 떨어지는 단어 중 하나의 첫 글자를 키보드로 입력하면 그 단어가 노란 테두리로 잠김 (ZType 패턴)
6. **글자별 진행** — 잠긴 단어의 남은 글자를 차례로 입력. 노트북 panel에 "**mou**|se" 큰 글씨로 진행 표시
7. **자동 처치** — 마지막 글자 입력 시 자동 처치 + chalkDust + 점수 + 콤보 (Enter 키 불필요)
8. **바닥 도달 시** — HP -1 + 화면 떨림 + 콤보 끊김. 임박 시 칠판 빨간 경고 (70%+) → 펄스 (85%+)
9. **콤보 단계화** — 10 / 20 / 30 단계별 글로우 (강도 점진)
10. **보스 단어** — Lv 3+ 5% 확률 등장. 액센트 색 + glow-pulse + 종소리. 처치 시 +200 보너스
11. **레벨업** — 단어 풀 비고 활성 단어 없으면 다음 레벨. 칠판 wipe 트랜지션 + "레벨 업!" 토스트
12. **Game Over** — 학점 도장 (A+/A/A-/B/C/F, 학점별 box-shadow glow) + 통계 → 다시 도전 / 메뉴로

**설정** (즉시 적용): 테마 5종, 폰트 크기 3단계, 모션 줄이기, 고대비, 사운드 볼륨, **Custom Words** (직접 입력한 단어로 플레이).

**모드 시각 차이**:
| 모드 | HUD 배지 | HP | 타이머 |
|---|---|---|---|
| Classic | 갈색 | 7/5/3 | TIME 경과 |
| Time Attack | 빨강 | 7/5/3 | TIME LEFT 카운트다운 (120s) |
| Zen | 녹색 | ∞ (숨김) | ZEN 카운트다운 (180s) |
| Daily | 보라 | 7/5/3 | DAILY 경과 + 출석 모달 |

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
- Playwright **79건 통과** (PWA / 모달 / 모바일 / 학점 / Settings / Feedback / Falling / Modes / Comprehensive / Typing Status / Hotfix)

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

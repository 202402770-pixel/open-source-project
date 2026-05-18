# 기여 가이드 (Git Convention)

> 이 문서는 **팀 내부용 협업 규칙**입니다.
> 입문자도 따라할 수 있도록 단계별로 적었고, 동시에 오픈소스 표준에 어긋나지 않도록 만들었습니다.
> 잘 모르겠으면 **박태준에게 물어보세요.** 멍청한 질문은 없습니다.

---

## 0. 개발 환경 셋업 (한 번만)

### 0.1 필수 도구
- **Git** — 버전 관리 (`git --version`으로 확인. 없으면 [git-scm.com](https://git-scm.com/)에서 설치)
- **GitHub 계정** — 저장소 접근
- **VS Code** — 편집기 ([code.visualstudio.com](https://code.visualstudio.com/))
- **Chrome** 또는 Firefox — 게임 테스트용

### 0.2 권장 VS Code 확장
- **Live Server** — `index.html` 우클릭 → "Open with Live Server"로 즉시 실행
- **Prettier** — 저장 시 자동 포맷팅
- **EditorConfig for VS Code** — 들여쓰기·줄끝 통일
- **GitLens** — Git 히스토리 보기 편함

### 0.3 저장소 클론하기
```bash
git clone https://github.com/<TEAM>/type-defender.git
cd type-defender
```

### 0.4 로컬에서 실행
- VS Code에서 폴더 열고 → `index.html` 우클릭 → **Open with Live Server**
- 브라우저에서 `http://127.0.0.1:5500` 자동 열림

### 0.5 Git 사용자 정보 (한 번만)
```bash
git config --global user.name "이름"
git config --global user.email "github_email@example.com"
```

> ⚠️ `user.email`은 **GitHub에 등록된 이메일**과 동일해야 잔디(contribution graph)가 찍힙니다.

---

## 1. 브랜치 전략 — 단순 GitHub Flow

큰 회사는 복잡한 전략(Git Flow 등)을 쓰지만, 우리는 **단순할수록 좋습니다.** 다음 두 가지만 기억하세요.

```
main ─────────●─────────●─────────●───── (항상 배포 가능한 상태)
               \         \         \
                ●         ●         ●  ← feature 브랜치
               feat/X    fix/Y    design/Z
```

### 1.1 규칙
- **`main`은 신성하다.** 직접 푸시 금지. PR을 통해서만 머지.
- 작업할 때는 **항상 새 브랜치**를 만든다.
- 브랜치는 PR 머지 후 **즉시 삭제**.

### 1.2 브랜치 이름 규칙

```
<타입>/<짧은-설명>
```

| 타입 | 언제 쓰나 | 예시 |
|---|---|---|
| `feat` | 새 기능 | `feat/boss-word`, `feat/settings-screen` |
| `fix` | 버그 수정 | `fix/combo-reset-on-pause` |
| `design` | 디자인·CSS만 변경 | `design/start-screen-classroom` |
| `refactor` | 동작은 그대로, 코드만 정리 | `refactor/extract-config` |
| `docs` | 문서만 변경 | `docs/update-readme` |
| `chore` | 빌드·설정 등 | `chore/add-prettier` |

**좋은 이름**
- ✅ `feat/professor-character`
- ✅ `fix/hp-bar-overflow-on-mobile`

**나쁜 이름**
- ❌ `myFeature` (타입 없음)
- ❌ `feat/update` (뭐가 update인지 모름)
- ❌ `jaehyung-branch` (사람 이름은 의미 없음)

### 1.3 브랜치 만드는 명령어

```bash
# 1. 최신 main 가져오기
git checkout main
git pull origin main

# 2. 새 브랜치 만들고 그쪽으로 이동
git checkout -b feat/professor-character
```

---

## 2. 커밋 메시지 규칙 — Conventional Commits (한국어)

> "지난 주 commit 메시지가 'fix' 'fix2' 'fix again'이면 우리는 1주일 후 자기가 뭘 했는지 못 찾는다."

### 2.1 형식

```
<타입>(<범위>): <한 줄 요약>

<선택: 본문 — 왜 이렇게 했는지>

<선택: 푸터 — Issue 참조>
```

### 2.2 타입 (브랜치 타입과 같음)

| 타입 | 의미 |
|---|---|
| `feat` | 사용자에게 보이는 **새 기능** |
| `fix` | 버그 **수정** |
| `design` | 디자인/CSS만 변경 (동작 변화 없음) |
| `refactor` | 동작은 그대로, 코드 구조만 변경 |
| `docs` | 문서만 변경 (README, DESIGN.md 등) |
| `chore` | 빌드·도구·설정 등 (`.gitignore`, `package.json` 등) |
| `test` | 테스트 코드 추가/수정 |
| `perf` | 성능 개선 |

### 2.3 범위 (선택)
변경된 영역을 한 단어로 표시. 예: `game`, `ui`, `word`, `sound`, `theme`, `data`.

### 2.4 한 줄 요약 — **명령형 현재시제**, **마침표 없음**, **한국어 OK**

| ✅ 좋음 | ❌ 나쁨 |
|---|---|
| `feat(word): 보스 단어 등장 확률 5% 추가` | `Added boss word 5% chance.` (과거형, 마침표) |
| `fix(hp): HP 바 모바일에서 화면 넘침 수정` | `bug fixed` (뭐가?) |
| `design(start): 시작 화면을 강의실 컨셉으로 변경` | `start ui` (불충분) |

### 2.5 본문 (선택, 권장)
- 한 줄 비우고 작성
- "왜 이 변경을 했는가"를 설명. "무엇을 했는가"는 코드 보면 알 수 있음.
- 한 줄 72자 권장 (terminal에서 잘 보임)

### 2.6 예시 — 좋은 커밋

```
feat(theme): 강의실 테마 추가

시안 E 적용을 위한 첫 단계로, 색·폰트·일러스트 토큰을
새 테마 'classroom'으로 묶어 한 번에 전환할 수 있게 했다.
기존 4개 테마(neon/retro/cyber/minimal)와 호환.

Closes #12
```

```
fix(combo): 일시정지 후 재개 시 콤보가 0으로 리셋되는 버그 수정

원인: pause 진입 시 cleanup 코드에서 state.combo를 잘못 0으로
설정. resume 직전이 아니라 pause 진입 시점에서 발생.

Refs #34
```

### 2.7 짧은 커밋도 OK (변경이 작을 때)
```
docs: README에 데모 URL 추가
fix(typo): wordData.js의 'syncronized' 오타 수정
chore: .prettierrc에 printWidth 100 추가
```

---

## 3. PR (Pull Request) 만들기

### 3.1 작업 흐름

```
브랜치 생성 → 코드 작성 → 커밋 → 푸시 → PR 생성 → 리뷰 → 머지 → 브랜치 삭제
```

### 3.2 단계별 명령어

```bash
# 1. 브랜치 만들기
git checkout main
git pull origin main
git checkout -b feat/notebook-input

# 2. 코드 변경 후 상태 확인
git status
git diff

# 3. 스테이징 (변경한 파일을 커밋 대상에 추가)
git add css/style.css
git add js/game.js
# 또는 한 번에:
git add -A     # 단, .env 같은 민감 파일이 같이 들어가지 않게 git status로 먼저 확인

# 4. 커밋
git commit -m "feat(ui): 노트 입력영역 컴포넌트 추가"

# 5. 푸시 (처음엔 -u origin <브랜치이름>)
git push -u origin feat/notebook-input

# 6. 출력에 나오는 GitHub URL 클릭 → PR 만들기
```

### 3.3 PR 제목 — 커밋과 같은 규칙

```
feat(ui): 노트 입력영역 컴포넌트 추가
```

### 3.4 PR 본문 템플릿

저장소에 `.github/pull_request_template.md`로 등록해두면 자동으로 떠있음. 없다면 직접 채우기.

```markdown
## 무엇을 했나
<!-- 한 문단으로 요약 -->

## 왜 했나
<!-- 어떤 문제를 해결하나, 어떤 기능이 추가되나 -->

## 어떻게 테스트했나
- [ ] Chrome에서 시작 화면 → 게임 → 게임 오버까지 정상 동작
- [ ] 모바일 사이즈(375px)에서 깨짐 없음
- [ ] 키보드만으로 조작 가능

## 스크린샷 / 영상
<!-- before / after -->

## 관련 이슈
Closes #<번호>
```

### 3.5 PR 크기 가이드

| 변경 줄 수 | 평가 | 권장 |
|---|---|---|
| < 100줄 | 👍 좋음 | 리뷰 빠르게 끝남 |
| 100-400줄 | OK | 본문에 변경 이유를 잘 설명할 것 |
| 400-1000줄 | ⚠️ 큼 | 가능하면 쪼개기. 못 쪼개면 사전 조율 |
| > 1000줄 | 🚨 너무 큼 | 머지 거부. 반드시 쪼개기 |

> **Why:** 큰 PR은 리뷰가 부실해지고 충돌 위험이 큼. **작게 자주**가 답.

### 3.6 PR 라벨 (선택)
- `priority/high` `priority/low`
- `size/S` `size/M` `size/L`
- `area/ui` `area/game` `area/data`
- `good first issue` — 입문자가 잡기 좋은 일

---

## 4. 코드 리뷰 규칙

### 4.1 PR 제출자
- PR을 만든 직후 **자기 코드를 다시 한 번 읽기** — 이상한 거 있으면 그 자리에서 수정
- 최소 한 명(=박태준)에게 리뷰 요청
- 리뷰 코멘트에는 **24시간 안에** 답변
- 리뷰 코멘트를 반영해 추가 커밋 → 푸시 (같은 브랜치)
- 리뷰어가 "approve" 누르고, CI(있으면) 통과되면 본인이 머지

### 4.2 리뷰어
- **빠르게 첫 응답** (24시간 안). 디테일은 그 다음에.
- 톤은 항상 친절 — 글자에 표정이 없다는 걸 기억
- 좋은 점도 같이 코멘트 (`👍 이 부분 깔끔하네요`)
- 의견의 강도를 명시:
  - `nit:` — "취향 차이지만…" (반영은 자유)
  - `suggestion:` — "이렇게 하면 어때요?" (대안 제시)
  - `must:` — "이건 꼭 고쳐야 해요" (반영 필수)

### 4.3 리뷰 체크리스트
- [ ] **동작 확인** — 로컬에서 직접 돌려봤는가?
- [ ] **DESIGN.md 준수** — 새 색·폰트·간격이 토큰을 사용하나?
- [ ] **CSS 변수 사용** — 인라인 색상 하드코딩이 없나?
- [ ] **접근성** — 키보드 조작·`prefers-reduced-motion` 깨지지 않았나?
- [ ] **성능** — 게임 루프에서 불필요한 객체 생성·DOM 쿼리 없나?
- [ ] **보안** — `innerHTML`로 사용자 입력 넣는 부분 없나? (XSS)
- [ ] **테스트 흔적** — 콘솔에 `console.log` 디버깅 코드가 남아있지 않나?

---

## 5. 머지 전략 — Squash & Merge

GitHub의 PR 머지 옵션은 3가지지만 우리는 **Squash and merge**만 사용.

| 옵션 | 의미 | 우리 정책 |
|---|---|---|
| Create a merge commit | 모든 커밋 보존 + merge commit 생성 | ❌ 사용 안 함 |
| **Squash and merge** | 모든 커밋을 하나로 합쳐 main에 추가 | ✅ **기본** |
| Rebase and merge | 모든 커밋을 main 위에 그대로 얹음 | ❌ 사용 안 함 |

> **Why:** main의 히스토리가 깔끔해짐 — PR 1개 = 커밋 1개. 입문자도 `git log` 읽기 쉬움.

### 5.1 머지 후
```bash
# 로컬에서도 main 동기화
git checkout main
git pull origin main

# 작업하던 브랜치 삭제
git branch -d feat/notebook-input
```

GitHub에서 PR 머지 시 "Delete branch" 버튼 누르는 것도 잊지 말 것.

---

## 6. 충돌(Conflict) 해결

여러 명이 같은 파일 같은 줄을 수정하면 충돌이 난다. 당황 금지.

### 6.1 충돌 났을 때

```bash
# main 최신 가져오기
git checkout main
git pull origin main

# 작업 브랜치로 돌아와서 main 합치기
git checkout feat/my-branch
git merge main

# 충돌 파일이 표시됨 → 파일을 열면 다음과 같은 마커가 보임
# <<<<<<< HEAD
# 내가 쓴 코드
# =======
# 다른 사람이 쓴 코드
# >>>>>>> main
```

### 6.2 해결 방법
1. 파일을 열고 `<<<`, `===`, `>>>` 마커를 보면서 **둘 다 살릴지, 한쪽만 살릴지** 결정
2. 마커 줄을 모두 삭제하고 최종 코드만 남김
3. `git add <파일>`
4. `git commit` (메시지 자동 생성됨, 그대로 OK)
5. `git push`

### 6.3 모르겠으면
- **그 자리에서 멈추고 박태준에게 화면 공유로 도움 요청**
- 잘못 해결하고 푸시하면 다른 사람 코드를 날릴 수 있음

---

## 7. 자주 쓰는 Git 명령어 치트시트

```bash
# 상태 확인
git status                  # 현재 상태 (스테이징/미스테이징/추적안됨)
git log --oneline -10       # 최근 커밋 10개 한 줄로
git diff                    # 미스테이징 변경 보기
git diff --staged           # 스테이징된 변경 보기

# 브랜치
git branch                  # 로컬 브랜치 목록
git branch -a               # 원격 포함 모든 브랜치
git checkout main           # main으로 이동
git checkout -b feat/x      # feat/x 새로 만들고 이동
git branch -d feat/x        # 머지된 브랜치 삭제

# 작업 되돌리기 (안전)
git restore <파일>          # 미스테이징 변경 되돌리기
git restore --staged <파일> # 스테이징 취소

# ⚠️ 위험한 명령 (쓰기 전에 박태준에게 물어보기)
git reset --hard            # 모든 변경 폐기
git push --force            # 원격 히스토리 덮어쓰기 (main에는 절대 금지!)
git rebase                  # 히스토리 다시 쓰기
```

---

## 8. 자주 묻는 질문 (FAQ)

### Q1. 커밋 메시지를 잘못 적었어요. 되돌릴 수 있나요?
**A.** 아직 푸시 전이면:
```bash
git commit --amend -m "올바른 메시지"
```
이미 푸시했고 PR 리뷰 전이면, 같은 브랜치에 추가 커밋하거나 박태준에게 문의.
**머지된 후엔 손대지 않습니다.**

### Q2. 작업 중인데 다른 브랜치로 잠깐 가야 해요.
**A.** Stash 사용:
```bash
git stash             # 임시 보관
git checkout other-branch
# 일 보고...
git checkout 원래-브랜치
git stash pop         # 다시 꺼내기
```

### Q3. `.env` 파일을 실수로 커밋했어요!
**A.** **즉시 박태준에게 알리세요.** API 키 등 민감 정보면 키 자체를 폐기·재발급해야 합니다.
이미 푸시했다면 GitHub에 영구 기록되므로 그냥 삭제 커밋만으로는 부족합니다.

### Q4. PR이 너무 커져서 어떻게 쪼개야 할지 모르겠어요.
**A.** 박태준에게 화면 공유 요청. 일반적으론:
- **CSS 변경 / JS 변경**을 분리
- **여러 화면 변경**이면 화면별로 분리
- **리팩터링 / 새 기능**을 분리

### Q5. `main`에 직접 커밋했어요.
**A.** 푸시 전이면:
```bash
git checkout -b feat/recovery
git checkout main
git reset --hard origin/main   # ⚠️ origin/main까지 main을 되돌림
```
푸시했다면 박태준에게 즉시 연락.

### Q6. 다른 사람이 내 브랜치를 수정해도 되나요?
**A.** 원칙적으로 **NO**. 같이 작업해야 한다면 PR을 일찍 열고 코멘트로 협의.

---

## 9. 이슈(Issue) 사용 규칙

### 9.1 언제 이슈를 만드나
- 버그를 발견했을 때 (즉시 고치지 않을 거라면)
- 새 기능 아이디어가 생겼을 때
- 토론이 필요한 결정사항이 있을 때

### 9.2 이슈 템플릿

**버그 리포트**
```markdown
## 무엇이 잘못됐나
<!-- 한 줄 요약 -->

## 재현 방법
1. ...
2. ...
3. 이때 X가 발생함

## 기대한 동작
<!-- 어떻게 동작해야 했나 -->

## 환경
- OS:
- 브라우저:
- 화면 크기:
```

**기능 제안**
```markdown
## 무엇
<!-- 무슨 기능인가 -->

## 왜
<!-- 왜 필요한가, 어떤 문제를 해결하나 -->

## 어떻게 (선택)
<!-- 구현 아이디어가 있다면 -->
```

### 9.3 이슈 ↔ PR 연결
PR 본문에 `Closes #12`라고 적으면 PR 머지 시 #12 이슈가 자동으로 닫힘.
완전히 닫는 게 아니라 참조만 하려면 `Refs #12`.

---

## 10. 보안·민감 정보

- **`.env`, API 키, 비밀번호** — 절대 커밋 금지
- **저작권 자료** — 무료 라이선스 확인된 음원·이미지만 사용
- 외부 라이브러리를 새로 추가하려면 **PR 본문에 라이선스 명시** (MIT, Apache-2.0, GPL 등)

---

## 11. 변경 이력

| 일자 | 변경 |
|---|---|
| 2026-05-04 | 초안 — 5주 프로젝트용 컨벤션 |

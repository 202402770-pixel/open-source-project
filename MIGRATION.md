# Migration Plan — W1 종료 후 새 Org로 이전

> **목적:** W1 작업이 모두 끝난 시점에 레포를 새 GitHub Organization으로 **Transfer**해서, 박태준이 인프라(Branch protection · GitHub Actions 등) 권한을 갖게 한다.
>
> **전제:** 두 팀원(전재형 · 김지우)이 Git에 익숙하지 않으므로, **모든 로컬이 안정된 상태** → 마이그레이션 → URL 갱신 한 줄, 이렇게 안전한 순서로 진행한다.

---

## 📅 타이밍

**D-Day:** W1 모든 PR이 머지된 직후, 정기 회의 시점 (예: `5/10 일요일 21시`)

W1 종료 기준 — [이슈 #14 트래커](https://github.com/202402770-pixel/open-source-project/issues/14)의 모든 체크박스가 ✓ 상태일 때.

## 🎯 마이그레이션 대상

| 항목 | 변경 |
|---|---|
| 현재 owner | `202402770-pixel` (전재형 개인 계정) |
| 새 owner | `hufs-oss-2026` (조직, 박태준이 Owner role) |
| 레포 이름 | `open-source-project` (변경 없음) |
| 새 URL | `https://github.com/hufs-oss-2026/open-source-project` |
| 옛 URL | 자동 영구 redirect (북마크·외부 링크 모두 작동) |

## 🧰 따라가는 것 / 안 따라가는 것

| 항목 | Transfer 후 |
|---|---|
| 모든 commit·branch·tag | ✅ 그대로 |
| Issues #3~#14 (closed 포함) | ✅ 그대로 (이슈 번호 유지) |
| PR #1·#2 머지 기록 | ✅ 그대로 |
| 라벨 (`W1`, `blocked`, `priority/high`) | ✅ 그대로 |
| 협력자 · 초대 | ⚠️ Org 멤버로 통합됨 |
| Branch protection | ❌ 비어 있음 (Transfer 후 박태준이 켤 것) |
| GitHub Pages · Actions secrets | ❌ 비어 있음 (필요 시 재설정) |

---

## 📋 D-1 (전날 밤) — 각자 로컬 정리

각 팀원이 **자기 노트북에서** 다음 3줄을 실행하고 결과를 박태준에게 보고:

```bash
# 1) 작업 디렉토리 상태 확인
git status
#   ↳ "nothing to commit, working tree clean" 이어야 OK
#   ↳ 변경사항 있으면: commit + push 또는 git stash 로 정리

# 2) 로컬 main 최신화
git checkout main
git pull origin main
#   ↳ "Already up to date" 이어야 OK

# 3) 작업 브랜치 정리 (선택)
git branch -a
#   ↳ 미푸시 로컬 브랜치가 있으면 push 또는 삭제
#   ↳ 머지된 옛 브랜치는 git branch -d <이름> 으로 삭제
```

> 🆘 안 되면 박태준 카톡 — 절대 혼자 끙끙 ❌

### 박태준의 추가 준비

```bash
# 안전 백업 1부 (1분, 50MB 정도)
mkdir -p ~/backups
cd ~/backups
git clone --mirror https://github.com/202402770-pixel/open-source-project.git \
  open-source-project-pre-migration.git
```

99% 안 쓸 보험이지만, 마이그레이션이 망쳤을 때 모든 commit·branch·tag를 복구할 수 있는 유일한 안전망.

---

## 🚀 D-Day (회의 시간, 30~60분) — 다같이 모여서

> 💡 Zoom·디스코드·면대면 등 **실시간 통화** 권장. Git 에러 나면 박태준이 즉시 도와줘야 함.

### Phase 1 — Transfer (5분, 전재형 주도)

전재형이 본인 브라우저에서:

1. https://github.com/202402770-pixel/open-source-project/settings 접속
2. 페이지 맨 아래 **"Danger Zone"** 까지 스크롤
3. **"Transfer ownership"** 버튼 클릭
4. 팝업에 입력:
   - **New owner:** `hufs-oss-2026`
   - **Repository name to confirm:** `open-source-project`
5. **"I understand, transfer this repository"** 클릭
6. GitHub이 자동으로 박태준에게 transfer 알림 → 박태준 수락

### Phase 2 — Branch protection 활성화 (5분, 박태준 주도)

박태준이 본인 터미널에서:

```bash
gh api -X PUT repos/hufs-oss-2026/open-source-project/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

성공하면 [이슈 #12](https://github.com/202402770-pixel/open-source-project/issues/12) 닫기.

### Phase 3 — 각자 로컬 URL 갱신 (5분, 다같이)

세 명이 동시에 자기 노트북에서 **딱 한 줄:**

```bash
git remote set-url origin https://github.com/hufs-oss-2026/open-source-project.git
```

확인:

```bash
git remote -v
#   ↳ "origin  https://github.com/hufs-oss-2026/open-source-project.git" 이어야

git pull
#   ↳ "Already up to date" 또는 정상 동작 확인
```

### Phase 4 — Org 초대 수락 (각자, 5분)

전재형·김지우는 GitHub 알림 또는 이메일에서 `hufs-oss-2026` org 초대를 수락. 메일 안 보이면:

- https://github.com/orgs/hufs-oss-2026/invitation 접속

수락 후 본인이 org 멤버가 됐는지 확인:

- https://github.com/hufs-oss-2026/people

### Phase 5 — 검증 (5분, 박태준)

박태준이 마지막으로 점검:

```bash
# 1) 새 URL로 레포 접근
open https://github.com/hufs-oss-2026/open-source-project

# 2) 옛 URL이 자동 redirect 되는지
open https://github.com/202402770-pixel/open-source-project
#   ↳ 새 위치로 자동 redirect 되어야

# 3) 이슈 11개 + #14 트래커 그대로 있는지
gh issue list --repo hufs-oss-2026/open-source-project

# 4) PR #2 머지 기록 그대로인지
gh pr view 2 --repo hufs-oss-2026/open-source-project

# 5) Branch protection 켜졌는지
gh api repos/hufs-oss-2026/open-source-project/branches/main/protection \
  --jq '.required_pull_request_reviews.required_approving_review_count'
#   ↳ "1" 출력
```

---

## 🚦 D+1 (다음 날) — W2 시작

- 박태준이 트래커 이슈 #14의 마지막 메모 갱신: "마이그레이션 완료, W2 시작"
- W2 작업 분배 메시지 팀에 전송 ([WORK_PLAN.md §3 W2](WORK_PLAN.md) 기반)

---

## 🔧 트러블슈팅 FAQ

### Q1. "git status에 변경사항이 있는데 뭔지 모르겠어요" (김지우 / 전재형)
A. 박태준에게 화면 공유로 보여주기. 보통 두 가지 경우:
- 작업 중이던 변경 → commit + push 또는 `git stash`
- 자동 생성 파일 (.DS_Store, .vscode 등) → .gitignore에 추가하고 커밋

### Q2. "git pull 했더니 충돌이 났어요"
A. 절대 임의로 해결 ❌. 박태준 호출.
원인은 보통 "로컬에서 main에 직접 커밋했는데 그 사이 원격에 다른 머지가 있음".
해결: `git stash` → `git pull` → `git stash pop` → 충돌 수동 해결.

### Q3. "Transfer 후 옛 URL로 push 하면 어떻게 되나요?"
A. **GitHub이 자동 redirect** 하므로 새 위치에 push 됩니다. 안전.
하지만 헷갈리니 가능하면 새 URL로 갱신 권장.

### Q4. "옛 fork·clone이 있는데 어떻게 하나요?"
A. 그냥 다 갱신:
```bash
git remote set-url origin https://github.com/hufs-oss-2026/open-source-project.git
```

### Q5. "Transfer가 실패했어요"
A. 가장 흔한 원인:
- 박태준이 org 초대를 안 받음 → org 페이지 확인
- 박태준이 org owner가 아님 → owner 권한 확인
- 박태준 계정이 `hufs-oss-2026`에 멤버로 없음 → 본인이 owner이므로 자동 OK

박태준 카톡.

### Q6. "Branch protection이 적용 안 되는 것 같아요"
A. 박태준이 `gh api ... PUT` 명령 다시 실행. 401/403이면 token scope에 `repo` 권한 있는지 확인:
```bash
gh auth status
```

---

## 🛡️ 비상시 롤백 (만일을 위해)

마이그레이션 후 심각한 문제 발견 시 → **즉시 박태준에게 보고** + 백업으로부터 복구 가능:

```bash
# 박태준 노트북에서 (응급)
cd ~/backups/open-source-project-pre-migration.git
# 이 디렉토리가 마이그레이션 직전 상태의 완전 미러 백업
# 필요시 새 레포로 push 해서 복구 가능
```

99% 안 쓸 절차. 마음의 안정 용도.

---

## ✅ 마이그레이션 완료 기준 (Definition of Done)

다음 모두 ✓ 되면 마이그레이션 종료, W2 진입:

- [ ] `hufs-oss-2026/open-source-project` URL이 동작
- [ ] 옛 URL이 자동 redirect 됨
- [ ] Issues #3~#14가 새 위치에도 있음
- [ ] PR #2 머지 기록 살아있음
- [ ] Branch protection 활성화 (PR review 1+ 필수)
- [ ] 박태준 · 전재형 · 김지우 모두 org 멤버
- [ ] 세 명 모두 로컬 `git remote -v` 가 새 URL
- [ ] 세 명 모두 `git pull` 정상 동작

위 8개 ✓ → 🎉 마이그레이션 완료.

---

## 📚 참고

- 🎨 [Figma](https://www.figma.com/design/mlNd2rpBgOyIeZJwHDKRYO)
- 📋 [WORK_PLAN.md](WORK_PLAN.md) §3 W1
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md)
- 📍 [Issue #12](https://github.com/202402770-pixel/open-source-project/issues/12) Branch protection
- 📍 [Issue #14](https://github.com/202402770-pixel/open-source-project/issues/14) W1 트래커

#!/usr/bin/env bash
# scripts/verify.sh
# W4 박태준 검증 일괄 — Lighthouse + Playwright E2E
#
# 사전 셋업 (1회):
#   npm install
#   npm run playwright:install
#
# 실행:
#   ./scripts/verify.sh        또는
#   npm run verify

set -e
cd "$(dirname "$0")/.."

echo "════════════════════════════════════════════"
echo "  W4 박태준 검증 일괄"
echo "════════════════════════════════════════════"

echo ""
echo "[1/2] Lighthouse 측정"
bash scripts/verify-lighthouse.sh

echo ""
echo "[2/2] Playwright E2E (전체 검증 15 스펙, 직렬)"
npx playwright test scripts/verify-e2e.spec.js scripts/verify-mobile.spec.js scripts/verify-rotate.spec.js scripts/verify-settings.spec.js scripts/verify-feedback.spec.js scripts/verify-hotfix.spec.js scripts/verify-full-viewport.spec.js scripts/verify-polish.spec.js scripts/verify-word-field.spec.js scripts/verify-modes.spec.js scripts/verify-comprehensive.spec.js scripts/verify-falling.spec.js scripts/verify-typing-status.spec.js scripts/verify-meta.spec.js scripts/verify-a11y.spec.js --workers=1 --reporter=list

echo ""
echo "════════════════════════════════════════════"
echo "  검증 완료"
echo "════════════════════════════════════════════"
echo "  Lighthouse HTML: lighthouse-reports/*.html"
echo "  Playwright HTML: playwright-report/index.html (실패 시)"

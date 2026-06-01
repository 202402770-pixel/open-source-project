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
echo "[2/2] Playwright E2E (PWA / 모바일 / 320px / 모달 / 학점)"
npx playwright test scripts/verify-e2e.spec.js scripts/verify-mobile.spec.js scripts/verify-rotate.spec.js --reporter=list

echo ""
echo "════════════════════════════════════════════"
echo "  검증 완료"
echo "════════════════════════════════════════════"
echo "  Lighthouse HTML: lighthouse-reports/*.html"
echo "  Playwright HTML: playwright-report/index.html (실패 시)"

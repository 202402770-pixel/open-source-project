#!/usr/bin/env bash
# scripts/verify-lighthouse.sh
# Lighthouse 자동 측정 — 데스크톱 + 모바일 동시
# 박태준 W4 검증 (W4-2 성능 / W4-3 PWA / 김지우 Lighthouse 1차)

set -e

PORT=${PORT:-8000}
URL="http://localhost:${PORT}"
OUT_DIR="lighthouse-reports"

mkdir -p "${OUT_DIR}"

# 정적 서버 띄움 (백그라운드)
echo "▶ 정적 서버 띄움 (포트 ${PORT})..."
python3 -m http.server "${PORT}" >/dev/null 2>&1 &
SERVER_PID=$!
trap "kill ${SERVER_PID} 2>/dev/null || true" EXIT
sleep 2

# 데스크톱 측정
echo "▶ Lighthouse 데스크톱 측정 중..."
npx --yes lighthouse "${URL}" \
  --preset=desktop \
  --output=json --output=html \
  --output-path="${OUT_DIR}/desktop" \
  --chrome-flags="--headless --no-sandbox" \
  --quiet \
  --only-categories=performance,accessibility,best-practices,seo,pwa

# 모바일 측정 (기본)
echo "▶ Lighthouse 모바일 측정 중..."
npx --yes lighthouse "${URL}" \
  --output=json --output=html \
  --output-path="${OUT_DIR}/mobile" \
  --chrome-flags="--headless --no-sandbox" \
  --quiet \
  --only-categories=performance,accessibility,best-practices,seo,pwa

# 결과 출력
echo ""
echo "════════════════════════════════════════════"
echo "  Lighthouse 점수 (0–100)"
echo "════════════════════════════════════════════"
for env in desktop mobile; do
  echo ""
  echo "── ${env} ──"
  jq -r '.categories
    | to_entries
    | .[]
    | "  \(.key): \(if .value.score == null then "n/a" else (.value.score * 100 | floor | tostring) end)"' \
    "${OUT_DIR}/${env}.report.json" 2>/dev/null \
    || echo "  (report 파일 누락)"
done

echo ""
echo "════════════════════════════════════════════"
echo "  W4 DoD 체크"
echo "════════════════════════════════════════════"
DESKTOP_PERF=$(jq -r '.categories.performance.score * 100 | floor' "${OUT_DIR}/desktop.report.json" 2>/dev/null || echo "?")
DESKTOP_A11Y=$(jq -r '.categories.accessibility.score * 100 | floor' "${OUT_DIR}/desktop.report.json" 2>/dev/null || echo "?")
echo "  데스크톱 Performance ≥ 85 : ${DESKTOP_PERF}"
echo "  데스크톱 Accessibility ≥ 90 : ${DESKTOP_A11Y}"

echo ""
echo "▶ HTML 리포트:"
echo "  ${OUT_DIR}/desktop.report.html"
echo "  ${OUT_DIR}/mobile.report.html"

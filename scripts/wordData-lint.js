// scripts/wordData-lint.js
// 단어 DB 오타·중복·길이·문자셋 자동 검수 (W5 김지우 — 박태준 대행)
//
// 실행:
//   node scripts/wordData-lint.js
//
// 검사 항목:
//   1. 빈 문자열 / 공백 포함
//   2. 영문 소문자가 아닌 문자 (대문자/숫자/한글/특수문자)
//   3. 너무 짧음 (< 3자) / 너무 김 (> 20자)
//   4. 전 레벨에서 중복 단어
//   5. 같은 레벨 내 중복

import { readFile } from 'node:fs/promises';

const filePath = new URL('../js/wordData.js', import.meta.url);
const src = await readFile(filePath, 'utf8');

// data 객체만 추출 — 단순 정규표현식 (data: { ... }, async loadWords ... 직전까지)
const dataMatch = src.match(/data:\s*\{([\s\S]*?)\},\s*\n\s*async\s+loadWords/);
if (!dataMatch) {
  console.error('[lint] data 객체 추출 실패 — wordData.js 구조 변경됐는지 확인');
  process.exit(1);
}

// data 안의 "level": [...] 추출
const data = {};
const levelRe = /"(\d+)":\s*\[(.*?)\]/g;
let m;
while ((m = levelRe.exec(dataMatch[1])) !== null) {
  const level = m[1];
  const words = m[2]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter((s) => s.length > 0);
  data[level] = words;
}

const issues = [];
const seen = new Map(); // word → first level seen

for (const [level, words] of Object.entries(data)) {
  const localSeen = new Set();
  for (const word of words) {
    // 1. 빈 문자열 / 공백
    if (word === '' || /\s/.test(word)) {
      issues.push(`Lv ${level} "${word}" — 빈 문자열 또는 공백 포함`);
      continue;
    }
    // 2. 영문 소문자 아닌 문자
    if (!/^[a-z]+$/.test(word)) {
      issues.push(`Lv ${level} "${word}" — 영문 소문자 외 문자 포함`);
    }
    // 3. 길이
    if (word.length < 3) {
      issues.push(`Lv ${level} "${word}" — 너무 짧음 (< 3자)`);
    }
    if (word.length > 20) {
      issues.push(`Lv ${level} "${word}" — 너무 김 (> 20자)`);
    }
    // 4. 전체 중복
    if (seen.has(word)) {
      issues.push(`Lv ${level} "${word}" — Lv ${seen.get(word)}와 중복`);
    } else {
      seen.set(word, level);
    }
    // 5. 같은 레벨 내 중복
    if (localSeen.has(word)) {
      issues.push(`Lv ${level} "${word}" — 같은 레벨 내 중복`);
    } else {
      localSeen.add(word);
    }
  }
}

console.log('════════════════════════════════════════════');
console.log('  WordData Lint');
console.log('════════════════════════════════════════════');
console.log(`  총 레벨: ${Object.keys(data).length}`);
console.log(`  총 단어: ${seen.size} (중복 제외)`);
console.log(`  레벨당 평균: ${(Object.values(data).reduce((a, b) => a + b.length, 0) / Object.keys(data).length).toFixed(1)}`);
console.log('');

if (issues.length === 0) {
  console.log('✅ 이슈 없음 — 단어 DB 검수 통과');
  process.exit(0);
}

console.log(`❌ ${issues.length}건 이슈 발견:`);
for (const issue of issues) {
  console.log(`  - ${issue}`);
}
process.exit(1);

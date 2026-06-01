/**
 * Type Defender — Service Worker
 * --------------------------------------------------------------------------
 * 오프라인 동작을 위한 단순 cache-first 전략.
 * - install: 핵심 리소스를 캐시에 미리 채움
 * - activate: 옛 버전 캐시 제거
 * - fetch: 캐시 히트면 캐시, 미스면 네트워크 (요청 성공 시 캐시에 추가)
 *
 * 캐시 버전 갱신 시 CACHE_VERSION 만 올리면 활성화 단계에서 옛 캐시 자동 삭제.
 *
 * W4 박태준 — PWA 인프라
 */

const CACHE_VERSION = 'td-v5'; // PR-G: word placeholder + achievement 토스트 강화
const CACHE_NAME = `type-defender-${CACHE_VERSION}`;

// install 시점에 캐시할 핵심 리소스 — 오프라인 첫 실행을 위한 최소 셋
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/style.css',
  './js/config.js',
  './js/sound.js',
  './js/themes.js',
  './js/game-api.js',
  './js/effects.js',
  './js/wordData.js',
  './js/achievements.js',
  './js/grade.js',
  './js/ui.js',
  './js/input.js',
  './js/game.js',
  './js/effects-bindings.js',
  './js/main.js',
  './assets/sounds/bell.mp3',
  './assets/sounds/chalk.mp3',
  './assets/sounds/levelup.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('type-defender-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 외부 도메인(CDN 폰트 등)은 네트워크 우선, 캐시는 fallback
  const isCrossOrigin = new URL(event.request.url).origin !== self.location.origin;
  if (isCrossOrigin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 동일 도메인 — cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

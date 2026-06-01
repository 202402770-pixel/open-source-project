// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  testMatch: '**/*.spec.js',
  timeout: 30_000,
  use: {
    baseURL: process.env.URL || 'http://localhost:8000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  // 정적 서버를 testHarness에서 자동 띄움 (npm run serve 별도 실행 안 해도 됨)
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});

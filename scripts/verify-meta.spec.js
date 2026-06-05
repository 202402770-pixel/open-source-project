// scripts/verify-meta.spec.js
// PR-R OG / Twitter / favicon 메타 검증

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.URL || 'http://localhost:8000';

test.describe('Meta Tags — PR-R', () => {
  test('Open Graph 필수 메타 — title/description/image/url/type', async ({ page }) => {
    await page.goto(BASE_URL);
    const meta = await page.evaluate(() => {
      const get = (prop) => document.querySelector(`meta[property="${prop}"]`)?.content;
      return {
        title: get('og:title'),
        description: get('og:description'),
        image: get('og:image'),
        url: get('og:url'),
        type: get('og:type'),
        width: get('og:image:width'),
        height: get('og:image:height'),
      };
    });
    expect(meta.title).toContain('Type Defender');
    expect(meta.description).toBeTruthy();
    expect(meta.image).toContain('og-image.png');
    expect(meta.url).toMatch(/^https?:\/\//);
    expect(meta.type).toBe('website');
    expect(meta.width).toBe('1200');
    expect(meta.height).toBe('630');
  });

  test('Twitter Card — summary_large_image', async ({ page }) => {
    await page.goto(BASE_URL);
    const meta = await page.evaluate(() => {
      const get = (name) => document.querySelector(`meta[name="${name}"]`)?.content;
      return {
        card: get('twitter:card'),
        title: get('twitter:title'),
        description: get('twitter:description'),
        image: get('twitter:image'),
      };
    });
    expect(meta.card).toBe('summary_large_image');
    expect(meta.title).toContain('Type Defender');
    expect(meta.description).toBeTruthy();
    expect(meta.image).toContain('og-image.png');
  });

  test('Favicon link — ico + 16/32/180', async ({ page }) => {
    await page.goto(BASE_URL);
    const links = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('link[rel*="icon"]'));
      return all.map(l => ({ rel: l.getAttribute('rel'), href: l.getAttribute('href'), sizes: l.getAttribute('sizes') }));
    });
    const hasIco = links.some(l => l.href?.includes('favicon.ico'));
    const has32 = links.some(l => l.href?.includes('favicon-32') || l.sizes?.includes('32'));
    const has180Apple = links.some(l => l.rel?.includes('apple-touch') && l.sizes?.includes('180'));
    expect(hasIco).toBe(true);
    expect(has32).toBe(true);
    expect(has180Apple).toBe(true);
  });

  test('이미지 자원 실제 존재 — og-image / favicon / icon-192 / icon-512', async ({ page }) => {
    await page.goto(BASE_URL);
    const results = await page.evaluate(async () => {
      const paths = [
        '/assets/icons/og-image.png',
        '/assets/favicon.ico',
        '/assets/icons/icon-192.png',
        '/assets/icons/icon-512.png',
        '/assets/icons/apple-touch-icon.png',
      ];
      const checks = await Promise.all(paths.map(async (p) => {
        const r = await fetch(p, { method: 'HEAD' });
        return { path: p, ok: r.ok, status: r.status };
      }));
      return checks;
    });
    for (const c of results) {
      expect(c.ok, `${c.path} should return 200 (got ${c.status})`).toBe(true);
    }
  });

  test('manifest.json description — 정통 타이핑 디펜스로 갱신', async ({ page }) => {
    await page.goto(BASE_URL);
    const text = await page.evaluate(() => fetch('/manifest.json?_=' + Date.now(), { cache: 'no-store' }).then(r => r.text()));
    const data = JSON.parse(text);
    expect(data.description).toContain('타이핑');
    expect(data.description).not.toContain('교수님');
    expect(data.description).not.toContain('받아');
  });
});

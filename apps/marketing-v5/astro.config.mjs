import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

// v5 stack: Astro 4.x static, vanilla CSS (no Tailwind, no Sass), no UI framework.
// Sitemap pinned to 3.2.1 — v3 hit a `reduce of undefined` crash on 3.7.x.
// `@pricing` Vite alias resolves to the repo-root pricing.json so the JSON import
// path is stable across `apps/marketing-v5/...` depths.

export default defineConfig({
  site: 'https://inletmove.ca',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // Emit `<lastmod>` per URL on every build so search engines can
      // prioritize recrawl after content updates. Each build stamps every
      // URL with the same UTC timestamp; per-URL git-mtime accuracy is
      // unnecessary for a 22-URL site that ships as a single deploy.
      lastmod: new Date(),
    }),
  ],
  build: {
    // 'always' — inlines every stylesheet into the document head as a
    // <style> block, eliminating the render-blocking external CSS link.
    // Per Step D remediation: trades ~20 KB extra HTML per page for one
    // less round-trip on first paint. Step C's measured render-block was
    // 1,180 ms; eliminating recovers most of that on slow 4G.
    inlineStylesheets: 'always',
    assets: '_assets',
  },
  compressHTML: true,
  vite: {
    resolve: {
      alias: {
        '@pricing': fileURLToPath(new URL('../../pricing.json', import.meta.url)),
      },
    },
    build: {
      cssCodeSplit: true,
    },
  },
});

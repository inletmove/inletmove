import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// @astrojs/sitemap 3.7.x has a `reduce of undefined` bug at build:done.
// Re-add in Phase 6 once pinned to a known-good version. v1 hand-writes sitemap-index.xml.
//
// @astrojs/partytown removed for v1 — only valuable once gtag/Plausible analytics
// is wired in. Re-add when analytics lands.

export default defineConfig({
  site: 'https://inletmove.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  compressHTML: true,
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});

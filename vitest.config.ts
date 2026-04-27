import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Week 1 unit tests are pure-TS (zod schema, helpers). No React rendering yet,
 * so we don't pull in @vitejs/plugin-react — that avoids a Vite-vs-Vitest
 * plugin type conflict on Windows. When Week 3 adds component-level tests,
 * re-add the plugin (and pin Vite to vitest's nested version if the conflict
 * resurfaces).
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});

import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

// vitest.config.ts
export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    conditions: ['development', 'node'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: ['solid-js', '@medplum/core'],
        },
      },
    },
    server: {
      deps: {
        inline: [/@medplum\/definitions/, /@solidjs\/router/],
      },
    },
  },
});

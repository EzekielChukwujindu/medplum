import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'

// vitest.config.ts
export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    conditions: ['development', 'node'],  // Switch to 'node' over 'browser' for server-side deps
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
          include: ['solid-js', '@medplum/core'],  // Keep if these need browser optimization
        },
      },
    },
    server: {
      deps: {
        inline: [/^@medplum\/definitions/],  // Regex to inline the monorepo dep and skip faulty bundling
      },
    },
  },
});
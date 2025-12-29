import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test.setup.ts'],
    // Solid needs to be transformed by Vite, this ensures it works in Node
    server: {
      deps: {
        inline: [/solid-js/],
      },
    },
  },
});
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        '@medplum/core',
        '@medplum/fhirtypes',
        '@medplum/solid-hooks',
        '@tanstack/solid-query',
        '@kobalte/core',
        '@ark-ui/solid',
        'lucide-solid',
      ],
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});

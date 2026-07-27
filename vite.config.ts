import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  plugins: [
    svelte(),
    dts({ include: ['src/lib'], insertTypesEntry: true, compilerOptions: { rootDir: 'src/lib' } }),
  ],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'sniic',
      fileName: 'sniic',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['svelte', /^svelte\//, 'd3', /^d3-/],
      output: {
        globals: { svelte: 'svelte', 'svelte/internal/client': '$', d3: 'd3' },
      },
    },
  },
});

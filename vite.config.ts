import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'sniic',
      fileName: 'sniic',
    },
    rollupOptions: {
      external: ['svelte', 'd3', /^d3-/],
      output: {
        globals: { svelte: 'svelte' },
      },
    },
  },
});

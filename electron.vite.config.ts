import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

// electron-vite defaults its output to out/, which the CLI already uses for
// race.ini and launch-uri.txt. Everything built goes to dist/ instead.
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      // package.json says type: module, so the emitted index.js is already ESM.
      lib: {
        entry: resolve(import.meta.dirname, 'src/main/main.ts'),
        formats: ['es'],
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      // A sandboxed preload cannot be an ES module, and package.json says
      // type: module, so the output has to be an explicitly .cjs file.
      lib: {
        entry: resolve(import.meta.dirname, 'src/preload/preload.ts'),
        formats: ['cjs'],
      },
    },
  },

  renderer: {
    root: resolve(import.meta.dirname, 'src/renderer'),
    // Must match the paths entry in src/renderer/tsconfig.json; the shadcn CLI
    // writes its imports as @/components/ui/... and both sides have to agree.
    resolve: {
      alias: { '@': resolve(import.meta.dirname, 'src/renderer/src') },
    },
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: resolve(import.meta.dirname, 'src/renderer/index.html'),
      },
    },
  },
});

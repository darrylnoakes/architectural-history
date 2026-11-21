import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      },
    },
  },
  // NO_HMR=1 serves the gallery for screenshots: files are still read fresh on every load, but a save
  // elsewhere in the repo no longer reloads a page that is in the middle of being photographed
  server: { port: 5173, strictPort: true, hmr: process.env.NO_HMR ? false : undefined },
});

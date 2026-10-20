import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Le frontend appelle /api/* ; en développement, Vite relaie vers le backend Python (port 8000).
export default defineConfig({
  // GitHub Pages sert le projet sous /Verqia_ProtoType_V1/, contrairement au serveur local.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/Verqia_ProtoType_V1/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
});

/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Em dev, /api é proxied para o Railway: o navegador enxerga same-origin e
  // o CORS não bloqueia. Em produção o site chama a API direto (exige o CORS
  // configurado no back).
  server: {
    proxy: {
      '/api': {
        target: 'https://helptap-backend-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});

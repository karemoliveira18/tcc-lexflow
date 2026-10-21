import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build') {
    let api;
    try { api = new URL(env.VITE_API_URL); } catch {
      throw new Error('Preencha VITE_API_URL em .env.production com a URL real do Render seguida de /api.');
    }
    if (api.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname) || api.username || api.password || api.search || api.hash || api.pathname.replace(/\/+$/, '') !== '/api') {
      throw new Error('VITE_API_URL da build deve ser uma URL HTTPS publica com o prefixo /api, sem credenciais.');
    }
  }
  return {
    base: '/tecti/2026/gpec02/',
    plugins: [react()],
    server: { port: 5173, open: true },
  };
});

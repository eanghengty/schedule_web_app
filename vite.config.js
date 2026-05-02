import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/schedule_web_app/',   // ← replace with your exact GitHub repo name
  server: {
    port: 6003,
  },
});

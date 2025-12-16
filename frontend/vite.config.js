import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const defaultApiUrl = "http://localhost:5000";
const getBackendTarget = () => {
  const envUrl = process.env.VITE_API_URL;
  if (!envUrl) return defaultApiUrl;
  try {
    const parsed = new URL(envUrl);
    parsed.pathname = parsed.pathname.replace(/\/api\/?$/, "");
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return envUrl.replace(/\/api\/?$/, "");
  }
};

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      "/api": {
        target: getBackendTarget(),
        changeOrigin: true,
      },
      "/socket.io": {
        target: getBackendTarget(),
        changeOrigin: true,
        ws: true,
      },
    },
  },
})

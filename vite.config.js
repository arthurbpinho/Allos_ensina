import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  base: '/Allos_ensina/',
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    proxy: {
      '/fish-proxy': {
        target: 'https://api.fish.audio',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fish-proxy/, ''),
      },
    },
  },
})
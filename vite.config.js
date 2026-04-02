import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Allos_ensina/',
  plugins: [react(), tailwindcss()],
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

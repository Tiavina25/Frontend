import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // Ajout de l'alias @
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://resto.infinityfreeapp.com/api',
        changeOrigin: true,
      },
    },
  },
})

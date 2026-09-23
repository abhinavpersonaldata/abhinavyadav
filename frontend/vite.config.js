import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  envDir: '..',
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.VITE_PORT || 5173),
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || `http://localhost:${process.env.PORT || process.env.API_PORT || 4000}`,
        changeOrigin: true,
      },
    },
  },
})

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
  build: {
    target: 'es2020',
    reportCompressedSize: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('react') || id.includes('react-dom')) return 'react'
            if (id.includes('tailwindcss')) return 'styles'
          }
          return undefined
        },
      },
    },
  },
})

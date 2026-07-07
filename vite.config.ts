import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts'
          if (id.includes('@zxing')) return 'vendor-barcode'
          if (id.includes('pdfjs-dist')) return 'vendor-pdf'
          if (id.includes('xlsx') || id.includes('file-saver')) return 'vendor-xlsx'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          return 'vendor'
        },
      },
    },
  },
})

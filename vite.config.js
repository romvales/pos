import { defineConfig } from 'vite'
  
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: process.env.PORT,
  },
  build: {
    outDir: './dist',
  },
  plugins: [
    react(),
  ]
})
import { defineConfig } from 'vite'
  
import react from '@vitejs/plugin-react'
import topLevelAwaitSupport from 'vite-plugin-top-level-await'

export default defineConfig({
  server: {
    port: process.env.PORT,
  },
  build: {
    outDir: './dist',
    sourcemap: true,
  },
  plugins: [
    react(),
    topLevelAwaitSupport(),
  ]
})
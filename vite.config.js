import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/S_PPT/' : '/',
  plugins: [react()],
  server: { port: 5173, host: '127.0.0.1', open: true }
})

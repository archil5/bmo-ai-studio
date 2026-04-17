import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: Replace 'bmo-ai-studio' with your EXACT GitHub repo name
  base: '/bmo-ai-studio/', 
})
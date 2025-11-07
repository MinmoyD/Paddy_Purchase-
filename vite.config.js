import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    allowedHosts: ["4e5c3e4f49ad.ngrok-free.app"],
    host: true,
    port: 5174,
  },
  plugins: [react()],
})

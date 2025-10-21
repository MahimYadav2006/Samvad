import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows access from network (0.0.0.0)
    allowedHosts: ['.ngrok-free.app'], // allow any subdomain of ngrok-free.app
    port: 5173, // optional
  },
})

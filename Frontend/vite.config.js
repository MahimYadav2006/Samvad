import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows access from network (0.0.0.0)
    allowedHosts: ['localhost', '127.0.0.1', '.ngrok-free.app'],
    port: 5173, // optional
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/components/**',
        'src/pages/**',
        'src/redux/**',
        'src/utils/**',
        'src/layout/**',
        'src/section/**',
      ],
    },
  },
})

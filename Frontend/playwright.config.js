import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(globalThis.process?.env?.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../Backend && node server.js',
      port: 8000,
      timeout: 30000,
      reuseExistingServer: !isCI,
    },
    {
      command: 'npm run dev',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: !isCI,
    },
  ],
});

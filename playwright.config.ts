import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      "BROWSER=none VITE_API_URL=http://127.0.0.1:8000/api/v1 VITE_APP_NAME='Zenith AI' VITE_DEFAULT_THEME=dark npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});

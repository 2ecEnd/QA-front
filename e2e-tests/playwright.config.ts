import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5500',   // адрес вашего фронтенда
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  /*webServer: {
    command: 'npx http-server .. -p 5500', // или способ запуска вашего фронтенда
    port: 5500,
    reuseExistingServer: !process.env.CI,
  },*/
});
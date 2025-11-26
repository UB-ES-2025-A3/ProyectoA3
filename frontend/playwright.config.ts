import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 100_000,
  use: {
    baseURL: 'http://localhost:3000', // donde corre tu frontend en dev
    headless: true,
  },
});

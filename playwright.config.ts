import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

// Tests run against the built output, not the dev server — a template's
// deliverable is dist/, so that is what must be correct.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // Escape hatch for sandboxes that ship a preinstalled Chromium whose build
    // does not match this Playwright version. CI installs its own and ignores it.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm --filter @clear-admin/html preview --port ' + PORT,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});

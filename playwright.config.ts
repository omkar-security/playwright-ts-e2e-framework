import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { STORAGE_STATE } from './src/utils/constants';

// Load environment variables from .env (falls back to defaults below)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://dummyjson.com';

/**
 * Playwright configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry flaky tests on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Limit workers on CI for stability */
  workers: process.env.CI ? 2 : undefined,
  /* Global timeout per test */
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  /* Multiple reporters: console + HTML + JUnit (for CI dashboards) */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],
  /* Shared settings for all projects */
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test', // SauceDemo uses data-test="..." attributes
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    headless: false,
  },

  projects: [
    /* ---------- 1. Authentication setup (runs first) ---------- */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* ---------- 2. Cross-browser UI tests ---------- */
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    /* ---------- 3. Mobile emulation (smoke tests only) ---------- */
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    /* ---------- 4. API tests (no browser needed) ---------- */
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },

    /* ---------- 5. Advanced browser features (network, a11y, frames, dialogs...) ---------- */
    {
      name: 'advanced',
      testDir: './tests/advanced',
      use: { ...devices['Desktop Chrome'] },
    },

    /* ---------- 6. Visual regression (run separately, baselines are OS-specific) ---------- */
    {
      name: 'visual',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});

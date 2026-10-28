import { test, expect } from '../../src/fixtures/test-fixtures';
import { LOGGED_OUT } from '../../src/utils/constants';

/**
 * Visual regression testing.
 * First run creates baseline images:  npm run test:visual:update
 * Next runs compare screenshots pixel-by-pixel against the baseline.
 * NOTE: baselines are OS/browser specific – generate them on the same OS your CI uses
 * (e.g. with the official Playwright Docker image).
 * Docs: https://playwright.dev/docs/test-snapshots
 */
test.describe('Visual regression', { tag: '@visual' }, () => {
  test.describe('logged out', () => {
    test.use({ storageState: LOGGED_OUT });

    test('TC-VIS-01: login page looks correct', async ({ loginPage, page }) => {
      await loginPage.goto();
      await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
    });
  });

  test('TC-VIS-02: inventory page looks correct', async ({ loggedInInventory, page }) => {
    await expect(page).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      mask: [loggedInInventory.footer], // mask dynamic content (e.g. year in copyright)
      animations: 'disabled',
    });
  });

  test('TC-VIS-03: single product card looks correct', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.productCard('Sauce Labs Backpack')).toHaveScreenshot('backpack-card.png');
  });
});

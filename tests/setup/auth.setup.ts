import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../../src/utils/constants';
import { LoginPage } from '../../src/pages/LoginPage';
import { USERS } from '../../src/data/users';

/**
 * Global authentication setup.
 * Logs in ONCE, saves cookies + localStorage to a file, and every UI project
 * re-uses it via `storageState` – so tests skip the login screen and run faster.
 * Docs: https://playwright.dev/docs/auth
 */
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs(USERS.standard);

  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});

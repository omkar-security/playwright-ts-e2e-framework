import { test, expect } from '../../src/fixtures/test-fixtures';
import { USERS, INVALID_LOGIN_CASES, LOGIN_ERRORS } from '../../src/data/users';
import { LOGGED_OUT } from '../../src/utils/constants';

/**
 * Login feature.
 * Concepts: overriding storageState per file, data-driven tests, tags, hooks, keyboard actions.
 */
test.use({ storageState: LOGGED_OUT }); // these tests must start logged out

test.describe('Login', { tag: '@login' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectToBeOpen();
  });

  test('TC-LOGIN-01: standard user can log in with valid credentials', { tag: ['@smoke', '@regression'] }, async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.loginAs(USERS.standard);
    await inventoryPage.expectToBeOpen();
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('TC-LOGIN-02: login page displays all required elements', { tag: '@regression' }, async ({ loginPage }) => {
    await expect(loginPage.logo).toHaveText('Swag Labs');
    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', 'Username');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password'); // input is masked
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('TC-LOGIN-03: user can log in by pressing Enter', { tag: '@regression' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.usernameInput.fill(USERS.standard.username);
    await loginPage.passwordInput.fill(USERS.standard.password);
    await page.keyboard.press('Enter');
    await inventoryPage.expectToBeOpen();
  });

  // ---------- Data-driven negative tests: one test is generated per data row ----------
  for (const scenario of INVALID_LOGIN_CASES) {
    test(`TC-LOGIN-04: shows error for ${scenario.title}`, { tag: ['@regression', '@negative'] }, async ({ loginPage, page }) => {
      await loginPage.login(scenario.username, scenario.password);
      await loginPage.expectError(scenario.error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('TC-LOGIN-05: error message can be dismissed', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError(LOGIN_ERRORS.usernameRequired);
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('TC-LOGIN-06: protected page redirects anonymous users to login', { tag: ['@smoke', '@negative'] }, async ({
    page,
    loginPage,
  }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });

  test('TC-LOGIN-07: session cookie is created after login', { tag: '@regression' }, async ({ loginPage, context }) => {
    await loginPage.loginAs(USERS.standard);
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'session-username');
    expect(sessionCookie, 'session cookie should exist').toBeDefined();
    expect(sessionCookie?.value).toBe(USERS.standard.username);
  });
});

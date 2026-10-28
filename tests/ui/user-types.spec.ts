import { test, expect } from '../../src/fixtures/test-fixtures';
import { USERS } from '../../src/data/users';
import { LOGGED_OUT } from '../../src/utils/constants';

/**
 * SauceDemo ships special users that simulate real bugs.
 * Concepts: test.fail (known bugs), test.slow, timing measurement, test.skip by browser,
 * serial mode, describe-level configuration.
 */
test.use({ storageState: LOGGED_OUT });

test.describe('Special user behaviours', { tag: '@users' }, () => {
  test('TC-USR-01: problem_user sees broken (identical) product images', { tag: '@regression' }, async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(USERS.problem);
    await inventoryPage.expectToBeOpen();

    const sources = await inventoryPage.itemImages.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
    );
    // Bug: every product shows the same image
    expect(new Set(sources).size).toBe(1);
  });

  test('TC-USR-02: [KNOWN BUG] problem_user cannot type a last name at checkout', { tag: '@regression' }, async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
  }) => {
    // test.fail() marks this as an EXPECTED failure: the test passes while the bug exists,
    // and will alert us (by failing) once the bug is fixed.
    test.fail(true, 'Known bug: last-name field is broken for problem_user');

    await loginPage.goto();
    await loginPage.loginAs(USERS.problem);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.header.openCart();
    await cartPage.checkout();

    await checkoutInfoPage.lastNameInput.fill('Doe');
    await expect(checkoutInfoPage.lastNameInput).toHaveValue('Doe', { timeout: 2_000 });
  });

  test('TC-USR-03: performance_glitch_user can still log in (slow)', { tag: '@regression' }, async ({
    loginPage,
    inventoryPage,
  }) => {
    test.slow(); // triples the timeout for this test

    await loginPage.goto();
    const start = Date.now();
    await loginPage.loginAs(USERS.performanceGlitch);
    await inventoryPage.expectToBeOpen();
    const duration = Date.now() - start;

    test.info().annotations.push({ type: 'login-duration-ms', description: String(duration) });
    expect(duration, 'login should complete within 15s').toBeLessThan(15_000);
  });

  test('TC-USR-04: locked_out_user is blocked', { tag: ['@regression', '@negative'] }, async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAs(USERS.lockedOut);
    await expect(loginPage.errorMessage).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });
});

test.describe('Sequential flow (serial mode)', { tag: '@users' }, () => {
  // In serial mode tests run in order and share a worker; if one fails, the rest are skipped.
  test.describe.configure({ mode: 'serial' });

  test('TC-USR-05: step 1 – login page is reachable', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectToBeOpen();
  });

  test('TC-USR-06: step 2 – standard user logs in', async ({ loginPage, inventoryPage, browserName }) => {
    test.skip(browserName === 'webkit' && !!process.env.SKIP_WEBKIT_SERIAL, 'Example of a conditional skip');
    await loginPage.goto();
    await loginPage.loginAs(USERS.standard);
    await inventoryPage.expectToBeOpen();
  });
});

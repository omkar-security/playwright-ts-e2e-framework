import { test, expect } from '../../src/fixtures/test-fixtures';

/**
 * Header / burger menu navigation.
 * Concepts: component objects, external link assertions, waitForURL, multi-step navigation.
 */
test.describe('Navigation menu', { tag: '@navigation' }, () => {
  test('TC-NAV-01: menu shows all options', { tag: '@regression' }, async ({ loggedInInventory }) => {
    const { header } = loggedInInventory;
    await header.openMenu();
    await expect(header.allItemsLink).toHaveText('All Items');
    await expect(header.aboutLink).toHaveText('About');
    await expect(header.logoutLink).toHaveText('Logout');
    await expect(header.resetAppLink).toHaveText('Reset App State');
  });

  test('TC-NAV-02: menu can be closed', { tag: '@regression' }, async ({ loggedInInventory }) => {
    const { header } = loggedInInventory;
    await header.openMenu();
    await header.closeMenuButton.click();
    await expect(header.logoutLink).toBeHidden();
  });

  test('TC-NAV-03: logout ends the session', { tag: '@smoke' }, async ({ loggedInInventory, loginPage, page }) => {
    await loggedInInventory.header.logout();
    await loginPage.expectToBeOpen();

    // Session is gone: protected page is no longer accessible
    await page.goto('/inventory.html');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-NAV-04: "All Items" returns to inventory from the cart', { tag: '@regression' }, async ({
    loggedInInventory,
    cartPage,
  }) => {
    await loggedInInventory.header.openCart();
    await cartPage.expectToBeOpen();
    await cartPage.header.openMenu();
    await cartPage.header.allItemsLink.click();
    await loggedInInventory.expectToBeOpen();
  });

  test('TC-NAV-05: "About" link points to saucelabs.com', { tag: '@regression' }, async ({ loggedInInventory }) => {
    await loggedInInventory.header.openMenu();
    // Assert on the href instead of navigating to a third-party site (faster, less flaky)
    await expect(loggedInInventory.header.aboutLink).toHaveAttribute('href', /saucelabs\.com/);
  });

  test('TC-NAV-06: cart icon opens the cart page', { tag: '@smoke' }, async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.header.openCart();
    await cartPage.expectToBeOpen();
  });
});

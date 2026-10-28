import { test, expect } from '../../src/fixtures/test-fixtures';
import { PRODUCTS, SORT_OPTIONS } from '../../src/data/products';
import { calculateOrderTotals } from '../../src/utils/price-utils';
import { LOGGED_OUT } from '../../src/utils/constants';
import { USERS } from '../../src/data/users';

/**
 * Full end-to-end user journeys.
 * Concepts: test.step (readable reports), attachments, test.info(), annotations.
 */
test.describe('E2E purchase journey', { tag: ['@e2e', '@smoke'] }, () => {
  test.use({ storageState: LOGGED_OUT }); // start the journey from the login screen

  test('TC-E2E-01: user logs in, buys the two cheapest products and logs out', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    customer,
  }) => {
    test.info().annotations.push({ type: 'customer', description: JSON.stringify(customer) });

    let chosen: { name: string; price: number }[] = [];

    await test.step('Login as standard user', async () => {
      await loginPage.goto();
      await loginPage.loginAs(USERS.standard);
      await inventoryPage.expectToBeOpen();
    });

    await test.step('Sort by price and add the two cheapest products', async () => {
      await inventoryPage.sortBy(SORT_OPTIONS.priceAsc);
      const names = (await inventoryPage.getProductNames()).slice(0, 2);
      const prices = (await inventoryPage.getProductPrices()).slice(0, 2);
      chosen = names.map((name, i) => ({ name, price: prices[i] }));

      await inventoryPage.addProductsToCart(names);
      await inventoryPage.header.expectCartCount(2);
    });

    await test.step('Verify cart contents', async () => {
      await inventoryPage.header.openCart();
      await cartPage.expectItems(chosen.map((p) => p.name));
    });

    await test.step('Fill in customer information', async () => {
      await cartPage.checkout();
      await checkoutInfoPage.submit(customer);
    });

    await test.step('Verify order totals', async () => {
      const summary = await checkoutOverviewPage.getSummary();
      expect(summary).toEqual(calculateOrderTotals(chosen.map((p) => p.price)));
      await test.info().attach('order-summary', {
        body: JSON.stringify({ products: chosen, ...summary }, null, 2),
        contentType: 'application/json',
      });
    });

    await test.step('Place the order', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectToBeOpen();
      await test.info().attach('order-confirmation', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });

    await test.step('Return home and log out', async () => {
      await checkoutCompletePage.backHomeButton.click();
      await inventoryPage.expectToBeOpen();
      await inventoryPage.header.logout();
      await loginPage.expectToBeOpen();
    });
  });

  test('TC-E2E-02: user buys every product in the store', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    customer,
  }) => {
    const all = Object.values(PRODUCTS);

    await test.step('Login and add everything', async () => {
      await loginPage.goto();
      await loginPage.loginAs(USERS.standard);
      await inventoryPage.addProductsToCart(all.map((p) => p.name));
      await inventoryPage.header.expectCartCount(all.length);
    });

    await test.step('Checkout and verify the grand total', async () => {
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.submit(customer);
      expect(await checkoutOverviewPage.getSummary()).toEqual(calculateOrderTotals(all.map((p) => p.price)));
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectToBeOpen();
    });
  });
});

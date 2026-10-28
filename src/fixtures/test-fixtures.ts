import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage, CheckoutOverviewPage, CheckoutCompletePage } from '../pages/CheckoutPage';
import { ApiClient } from '../api/ApiClient';
import { generateCustomer, type CustomerInfo } from '../utils/data-generator';

/**
 * Custom fixtures: every test can simply ask for the page objects it needs,
 * e.g. `test('x', async ({ inventoryPage, cartPage }) => { ... })`.
 * Playwright creates them lazily – only when a test actually uses them.
 * Docs: https://playwright.dev/docs/test-fixtures
 */
type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Fresh random customer for checkout */
  customer: CustomerInfo;
  /** Inventory page that is already opened (user is authenticated via storageState) */
  loggedInInventory: InventoryPage;
  api: ApiClient;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  customer: async ({}, use) => {
    await use(generateCustomer());
  },
  // Fixture with setup AND teardown: code after `use()` runs once the test is finished.
  loggedInInventory: async ({ page, inventoryPage }, use) => {
    await inventoryPage.goto();
    await inventoryPage.expectToBeOpen();
    await use(inventoryPage);
    // Teardown: clear cart state stored in localStorage so tests stay independent
    await page.evaluate(() => window.localStorage.clear()).catch(() => {});
  },
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect } from '../utils/custom-matchers';

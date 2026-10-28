import { test, expect } from '../../src/fixtures/test-fixtures';
import { PRODUCTS } from '../../src/data/products';
import { calculateOrderTotals } from '../../src/utils/price-utils';

/**
 * Checkout flow (information -> overview -> complete).
 * Concepts: form validation, data-driven negative tests, calculated assertions, faker test data.
 */
test.describe('Checkout', { tag: '@checkout' }, () => {
  const cartProducts = [PRODUCTS.backpack, PRODUCTS.bikeLight];

  test.beforeEach(async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addProductsToCart(cartProducts.map((p) => p.name));
    await loggedInInventory.header.openCart();
    await cartPage.checkout();
  });

  // ---------- Form validation (data-driven) ----------
  const validationCases = [
    { missing: 'first name', data: { firstName: '', lastName: 'Doe', postalCode: '12345' }, error: 'Error: First Name is required' },
    { missing: 'last name', data: { firstName: 'Jane', lastName: '', postalCode: '12345' }, error: 'Error: Last Name is required' },
    { missing: 'postal code', data: { firstName: 'Jane', lastName: 'Doe', postalCode: '' }, error: 'Error: Postal Code is required' },
  ];

  for (const { missing, data, error } of validationCases) {
    test(`TC-CHK-01: shows validation error when ${missing} is missing`, { tag: ['@regression', '@negative'] }, async ({
      checkoutInfoPage,
    }) => {
      await checkoutInfoPage.submit(data);
      await expect(checkoutInfoPage.errorMessage).toHaveText(error);
      await checkoutInfoPage.expectToBeOpen(); // still on step one
    });
  }

  test('TC-CHK-02: valid customer info leads to the overview step', { tag: '@smoke' }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    customer,
  }) => {
    await checkoutInfoPage.submit(customer);
    await checkoutOverviewPage.expectToBeOpen();
    await expect(checkoutOverviewPage.itemNames).toHaveText(cartProducts.map((p) => p.name));
  });

  test('TC-CHK-03: overview shows correct subtotal, 8% tax and total', { tag: ['@smoke', '@regression'] }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    customer,
  }) => {
    await checkoutInfoPage.submit(customer);

    const expected = calculateOrderTotals(cartProducts.map((p) => p.price));
    const actual = await checkoutOverviewPage.getSummary();

    expect(actual).toEqual(expected);
    await expect(checkoutOverviewPage.paymentInfo).toContainText('SauceCard');
    await expect(checkoutOverviewPage.shippingInfo).toContainText('Free Pony Express Delivery');
  });

  test('TC-CHK-04: cancel on information step returns to the cart', { tag: '@regression' }, async ({
    checkoutInfoPage,
    cartPage,
  }) => {
    await checkoutInfoPage.cancelButton.click();
    await cartPage.expectToBeOpen();
    await cartPage.expectItems(cartProducts.map((p) => p.name));
  });

  test('TC-CHK-05: cancel on overview step returns to inventory with cart kept', { tag: '@regression' }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    inventoryPage,
    customer,
  }) => {
    await checkoutInfoPage.submit(customer);
    await checkoutOverviewPage.cancelButton.click();
    await inventoryPage.expectToBeOpen();
    await inventoryPage.header.expectCartCount(cartProducts.length);
  });

  test('TC-CHK-06: finishing the order shows confirmation and clears the cart', { tag: '@smoke' }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    customer,
  }) => {
    await checkoutInfoPage.submit(customer);
    await checkoutOverviewPage.finish();

    await checkoutCompletePage.expectToBeOpen();
    await expect(checkoutCompletePage.completeText).toContainText('Your order has been dispatched');
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    await checkoutCompletePage.header.expectCartCount(0);
  });

  test('TC-CHK-07: special characters are accepted in customer fields', { tag: '@regression' }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await checkoutInfoPage.submit({ firstName: "Zoë-Anne", lastName: "O'Brien", postalCode: 'SW1A 1AA' });
    await checkoutOverviewPage.expectToBeOpen();
  });
});

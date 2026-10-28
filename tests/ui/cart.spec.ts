import { test, expect } from '../../src/fixtures/test-fixtures';
import { PRODUCTS } from '../../src/data/products';

/**
 * Shopping cart.
 * Concepts: beforeEach with fixtures, list assertions (toHaveText with array), state setup via UI.
 */
test.describe('Shopping cart', { tag: '@cart' }, () => {
  const selected = [PRODUCTS.backpack, PRODUCTS.boltTShirt, PRODUCTS.onesie];

  test.beforeEach(async ({ loggedInInventory }) => {
    await loggedInInventory.addProductsToCart(selected.map((p) => p.name));
    await loggedInInventory.header.openCart();
  });

  test('TC-CART-01: cart lists all added products with correct prices', { tag: '@smoke' }, async ({ cartPage }) => {
    await cartPage.expectToBeOpen();
    await cartPage.expectItems(selected.map((p) => p.name));
    expect(await cartPage.getItemPrices()).toEqual(selected.map((p) => p.price));
  });

  test('TC-CART-02: each cart item has quantity 1', { tag: '@regression' }, async ({ cartPage }) => {
    await expect(cartPage.itemQuantities).toHaveText(['1', '1', '1']);
  });

  test('TC-CART-03: removing an item updates the cart and badge', { tag: '@regression' }, async ({ cartPage }) => {
    await cartPage.removeItem(PRODUCTS.boltTShirt.name);

    await cartPage.expectItems([PRODUCTS.backpack.name, PRODUCTS.onesie.name]);
    await cartPage.header.expectCartCount(2);
  });

  test('TC-CART-04: removing all items leaves an empty cart', { tag: '@regression' }, async ({ cartPage }) => {
    for (const product of selected) {
      await cartPage.removeItem(product.name);
    }
    await expect(cartPage.cartItems).toHaveCount(0);
    await cartPage.header.expectCartCount(0);
  });

  test('TC-CART-05: "Continue Shopping" returns to inventory and keeps the cart', { tag: '@regression' }, async ({
    cartPage,
    inventoryPage,
  }) => {
    await cartPage.continueShoppingButton.click();
    await inventoryPage.expectToBeOpen();
    await inventoryPage.header.expectCartCount(selected.length);
  });

  test('TC-CART-06: "Checkout" opens the customer information step', { tag: '@smoke' }, async ({
    cartPage,
    checkoutInfoPage,
  }) => {
    await cartPage.checkout();
    await checkoutInfoPage.expectToBeOpen();
  });

  test('TC-CART-07: "Reset App State" empties the cart', { tag: '@regression' }, async ({ cartPage, page }) => {
    await cartPage.header.resetAppState();
    await cartPage.header.expectCartCount(0);
    await page.reload();
    await expect(cartPage.cartItems).toHaveCount(0);
  });
});

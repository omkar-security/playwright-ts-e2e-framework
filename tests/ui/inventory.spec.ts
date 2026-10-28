import { test, expect } from '../../src/fixtures/test-fixtures';
import { ALL_PRODUCTS, PRODUCTS, SORT_OPTIONS } from '../../src/data/products';

/**
 * Product listing (inventory) page.
 * Concepts: authenticated state, custom fixtures, custom matchers, locator filtering,
 * allTextContents, data-driven sorting, assertions on lists.
 */
test.describe('Inventory / Product listing', { tag: '@inventory' }, () => {
  test('TC-INV-01: displays all 6 products with name, description, price and image', { tag: '@smoke' }, async ({
    loggedInInventory,
  }) => {
    await expect(loggedInInventory.inventoryItems).toHaveCount(6);

    // Iterate over every product card and validate its content
    for (const card of await loggedInInventory.inventoryItems.all()) {
      await expect(card.locator('.inventory_item_name')).not.toBeEmpty();
      await expect(card.locator('.inventory_item_desc')).not.toBeEmpty();
      await expect(card.locator('.inventory_item_price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(card.locator('img')).toBeVisible();
      await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
  });

  test('TC-INV-02: product names and prices match the catalogue', { tag: '@regression' }, async ({ loggedInInventory }) => {
    for (const product of ALL_PRODUCTS) {
      expect(await loggedInInventory.getProductPrice(product.name), product.name).toBe(product.price);
    }
  });

  test('TC-INV-03: default sort order is Name (A to Z)', { tag: '@regression' }, async ({ loggedInInventory }) => {
    await expect(loggedInInventory.sortDropdown).toHaveValue(SORT_OPTIONS.nameAsc);
    expect(await loggedInInventory.getProductNames()).toBeSorted('asc');
  });

  // ---------- Data-driven sorting tests ----------
  const sortCases = [
    { option: SORT_OPTIONS.nameAsc, label: 'Name (A to Z)', by: 'name', order: 'asc' },
    { option: SORT_OPTIONS.nameDesc, label: 'Name (Z to A)', by: 'name', order: 'desc' },
    { option: SORT_OPTIONS.priceAsc, label: 'Price (low to high)', by: 'price', order: 'asc' },
    { option: SORT_OPTIONS.priceDesc, label: 'Price (high to low)', by: 'price', order: 'desc' },
  ] as const;

  for (const { option, label, by, order } of sortCases) {
    test(`TC-INV-04: sorts products by ${label}`, { tag: '@regression' }, async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy(option);
      await expect(loggedInInventory.sortDropdown).toHaveValue(option);

      const values =
        by === 'name' ? await loggedInInventory.getProductNames() : await loggedInInventory.getProductPrices();
      expect(values).toBeSorted(order);
    });
  }

  test('TC-INV-05: add to cart button toggles to Remove and updates the badge', { tag: '@smoke' }, async ({
    loggedInInventory,
  }) => {
    const card = loggedInInventory.productCard(PRODUCTS.backpack.name);

    await loggedInInventory.addToCart(PRODUCTS.backpack.name);
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    await loggedInInventory.header.expectCartCount(1);

    await loggedInInventory.removeFromCart(PRODUCTS.backpack.name);
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await loggedInInventory.header.expectCartCount(0);
  });

  test('TC-INV-06: cart badge counts every added product', { tag: '@regression' }, async ({ loggedInInventory }) => {
    let expected = 0;
    for (const product of ALL_PRODUCTS) {
      await loggedInInventory.addToCart(product.name);
      expected++;
      await loggedInInventory.header.expectCartCount(expected);
    }
  });

  test('TC-INV-07: cart state persists after page reload', { tag: '@regression' }, async ({ loggedInInventory, page }) => {
    await loggedInInventory.addProductsToCart([PRODUCTS.onesie.name, PRODUCTS.bikeLight.name]);
    await page.reload();
    await loggedInInventory.header.expectCartCount(2);

    // Cart lives in localStorage – verify it directly via page.evaluate
    const cartContents = await page.evaluate(() => window.localStorage.getItem('cart-contents'));
    expect(JSON.parse(cartContents ?? '[]')).toHaveLength(2);
  });

  test('TC-INV-08: footer shows copyright and social links', { tag: '@regression' }, async ({ loggedInInventory, page }) => {
    await expect(loggedInInventory.footer).toContainText('Sauce Labs. All Rights Reserved');
    await expect(page.locator('.social_twitter a')).toHaveAttribute('href', /twitter\.com|x\.com/);
    await expect(page.locator('.social_facebook a')).toHaveAttribute('href', /facebook\.com/);
    await expect(page.locator('.social_linkedin a')).toHaveAttribute('href', /linkedin\.com/);
  });
});

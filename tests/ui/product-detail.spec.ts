import { test, expect } from '../../src/fixtures/test-fixtures';
import { ALL_PRODUCTS, PRODUCTS } from '../../src/data/products';

/**
 * Product detail page.
 * Concepts: soft assertions, navigation (back/forward), parameterised tests, URL assertions.
 */
test.describe('Product detail', { tag: '@product' }, () => {
  for (const product of ALL_PRODUCTS) {
    test(`TC-PDP-01: details are correct for "${product.name}"`, { tag: '@regression' }, async ({
      loggedInInventory,
      productDetailPage,
    }) => {
      await loggedInInventory.openProduct(product.name);
      await productDetailPage.expectToBeOpen();

      // Soft assertions: the test continues after a failure and reports ALL mismatches at the end
      await expect.soft(productDetailPage.name).toHaveText(product.name);
      expect.soft(await productDetailPage.getPrice()).toBe(product.price);
      await expect.soft(productDetailPage.description).not.toBeEmpty();
      await expect.soft(productDetailPage.image).toBeVisible();
      await expect.soft(productDetailPage.addToCartButton).toBeVisible();
    });
  }

  test('TC-PDP-02: product can be added and removed from detail page', { tag: '@smoke' }, async ({
    loggedInInventory,
    productDetailPage,
  }) => {
    await loggedInInventory.openProduct(PRODUCTS.fleeceJacket.name);
    await productDetailPage.addToCartButton.click();
    await expect(productDetailPage.removeButton).toBeVisible();
    await productDetailPage.header.expectCartCount(1);

    await productDetailPage.removeButton.click();
    await expect(productDetailPage.addToCartButton).toBeVisible();
    await productDetailPage.header.expectCartCount(0);
  });

  test('TC-PDP-03: "Back to products" returns to the inventory', { tag: '@regression' }, async ({
    loggedInInventory,
    productDetailPage,
  }) => {
    await loggedInInventory.openProduct(PRODUCTS.backpack.name);
    await productDetailPage.backButton.click();
    await loggedInInventory.expectToBeOpen();
  });

  test('TC-PDP-04: browser back/forward navigation works', { tag: '@regression' }, async ({
    page,
    loggedInInventory,
    productDetailPage,
  }) => {
    await loggedInInventory.openProduct(PRODUCTS.bikeLight.name);
    await productDetailPage.expectToBeOpen();

    await page.goBack();
    await loggedInInventory.expectToBeOpen();

    await page.goForward();
    await expect(productDetailPage.name).toHaveText(PRODUCTS.bikeLight.name);
  });

  test('TC-PDP-05: product added on detail page is reflected on inventory', { tag: '@regression' }, async ({
    loggedInInventory,
    productDetailPage,
  }) => {
    await loggedInInventory.openProduct(PRODUCTS.onesie.name);
    await productDetailPage.addToCartButton.click();
    await productDetailPage.backButton.click();

    await expect(
      loggedInInventory.productCard(PRODUCTS.onesie.name).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();
  });
});

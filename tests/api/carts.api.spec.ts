import { test, expect } from '../../src/fixtures/test-fixtures';
import { ApiClient } from '../../src/api/ApiClient';

/**
 * Carts API.
 * Concepts: business-rule validation on API data (totals), POST with nested payloads.
 */
test.describe('Carts API', { tag: '@api' }, () => {
  test('TC-CARTAPI-01: GET /carts/{id} returns a cart with consistent totals', { tag: '@smoke' }, async ({ api }) => {
    const cart = await ApiClient.expectJson(await api.getCart(1));

    expect(cart.id).toBe(1);
    expect(cart.products.length).toBe(cart.totalProducts);

    // Business rule: totalQuantity equals the sum of all product quantities
    const qty = cart.products.reduce((sum: number, p: { quantity: number }) => sum + p.quantity, 0);
    expect(cart.totalQuantity).toBe(qty);

    // Business rule: each line total = price * quantity
    for (const line of cart.products) {
      expect(line.total).toBeCloseTo(line.price * line.quantity, 2);
    }
    expect(cart.discountedTotal).toBeLessThanOrEqual(cart.total);
  });

  test('TC-CARTAPI-02: carts can be fetched by user', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getCartsByUser(33));
    expect(Array.isArray(body.carts)).toBe(true);
    for (const cart of body.carts) {
      expect(cart.userId).toBe(33);
    }
  });

  test('TC-CARTAPI-03: a new cart can be created', { tag: '@regression' }, async ({ api }) => {
    const response = await api.addCart(1, [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ]);
    expect(response.ok()).toBeTruthy();
    const cart = await response.json();

    expect(cart.userId).toBe(1);
    expect(cart.totalProducts).toBe(2);
    expect(cart.totalQuantity).toBe(3);
  });

  test('TC-CARTAPI-04: unknown cart id returns 404', { tag: ['@regression', '@negative'] }, async ({ api }) => {
    const response = await api.getCart(999999);
    expect(response.status()).toBe(404);
  });
});

import { test, expect } from '../../src/fixtures/test-fixtures';
import { ApiClient } from '../../src/api/ApiClient';
import { generateProductPayload } from '../../src/utils/data-generator';

/**
 * Products REST API (DummyJSON).
 * Concepts: `request` fixture, CRUD, query params, status codes, JSON schema-like checks,
 * response time, expect.poll, negative API tests.
 */
test.describe('Products API', { tag: '@api' }, () => {
  test('TC-API-01: GET /products returns a paginated list', { tag: '@smoke' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getProducts());

    expect(body).toEqual(
      expect.objectContaining({
        products: expect.any(Array),
        total: expect.any(Number),
        skip: 0,
        limit: expect.any(Number),
      }),
    );
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('TC-API-02: each product matches the expected schema', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getProducts({ limit: 10 }));

    for (const product of body.products) {
      expect(product).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        category: expect.any(String),
        rating: expect.any(Number),
        stock: expect.any(Number),
        images: expect.any(Array),
      });
      expect(product.price).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
    }
  });

  test('TC-API-03: pagination with limit & skip works', { tag: '@regression' }, async ({ api }) => {
    const page1 = await ApiClient.expectJson(await api.getProducts({ limit: 5, skip: 0 }));
    const page2 = await ApiClient.expectJson(await api.getProducts({ limit: 5, skip: 5 }));

    expect(page1.products).toHaveLength(5);
    expect(page2.products).toHaveLength(5);
    expect(page2.skip).toBe(5);
    expect(page2.products[0].id).toBe(page1.products[4].id + 1);
  });

  test('TC-API-04: select returns only requested fields', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getProducts({ limit: 3, select: 'title,price' }));
    for (const product of body.products) {
      expect(Object.keys(product).sort()).toEqual(['id', 'price', 'title']);
    }
  });

  test('TC-API-05: products can be sorted by price ascending', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getProducts({ limit: 20, sortBy: 'price', order: 'asc' }));
    const prices: number[] = body.products.map((p: { price: number }) => p.price);
    expect(prices).toBeSorted('asc');
  });

  test('TC-API-06: GET /products/{id} returns a single product', { tag: '@smoke' }, async ({ api }) => {
    const product = await ApiClient.expectJson(await api.getProduct(1));
    expect(product.id).toBe(1);
    expect(product.title).toBeTruthy();
  });

  test('TC-API-07: unknown product id returns 404', { tag: ['@regression', '@negative'] }, async ({ api }) => {
    const response = await api.getProduct(999999);
    expect(response.status()).toBe(404);
    expect((await response.json()).message).toContain('not found');
  });

  test('TC-API-08: search returns only matching products', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.searchProducts('phone'));
    expect(body.products.length).toBeGreaterThan(0);
    for (const p of body.products) {
      const haystack = `${p.title} ${p.description} ${p.category} ${p.tags ?? ''}`.toLowerCase();
      expect(haystack).toContain('phone');
    }
  });

  test('TC-API-09: search with no match returns an empty list', { tag: ['@regression', '@negative'] }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.searchProducts('zzqqxx-no-such-product'));
    expect(body.products).toEqual([]);
    expect(body.total).toBe(0);
  });

  test('TC-API-10: products can be filtered by category', { tag: '@regression' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.getProductsByCategory('smartphones'));
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.products.every((p: { category: string }) => p.category === 'smartphones')).toBe(true);
  });

  test('TC-API-11: POST /products/add creates a product', { tag: '@smoke' }, async ({ api }) => {
    const payload = generateProductPayload();
    const response = await api.addProduct(payload);

    expect(response.ok()).toBeTruthy();
    expect([200, 201]).toContain(response.status());
    const created = await response.json();
    expect(created).toMatchObject(payload);
    expect(created.id).toEqual(expect.any(Number));
  });

  test('TC-API-12: PUT /products/{id} updates a product', { tag: '@regression' }, async ({ api }) => {
    const updated = await ApiClient.expectJson(await api.updateProduct(1, { title: 'Updated by Playwright' }));
    expect(updated).toMatchObject({ id: 1, title: 'Updated by Playwright' });
  });

  test('TC-API-13: PATCH /products/{id} partially updates a product', { tag: '@regression' }, async ({ api }) => {
    const updated = await ApiClient.expectJson(await api.patchProduct(2, { price: 99.99 }));
    expect(updated).toMatchObject({ id: 2, price: 99.99 });
  });

  test('TC-API-14: DELETE /products/{id} marks the product as deleted', { tag: '@regression' }, async ({ api }) => {
    const deleted = await ApiClient.expectJson(await api.deleteProduct(1));
    expect(deleted.id).toBe(1);
    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedOn).toBeTruthy();
  });

  test('TC-API-15: categories endpoint responds within 3 seconds', { tag: '@regression' }, async ({ api }) => {
    const start = Date.now();
    const categories = await ApiClient.expectJson(await api.getCategories());
    const elapsed = Date.now() - start;

    expect(categories.length).toBeGreaterThan(0);
    expect(elapsed, `response took ${elapsed}ms`).toBeLessThan(3_000);
  });

  test('TC-API-16: expect.poll retries until the condition is met', { tag: '@regression' }, async ({ api }) => {
    // expect.poll is useful for eventually-consistent APIs (e.g. waiting for a job to finish)
    await expect
      .poll(async () => (await api.getProduct(1)).status(), { intervals: [500, 1_000], timeout: 10_000 })
      .toBe(200);
  });
});

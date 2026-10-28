import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { USERS } from '../../src/data/users';

/**
 * Network interception & mocking.
 * Concepts: page.route (abort / fulfill / modify), waitForResponse, request listeners,
 * offline mode, HTTP-level assertions in UI tests.
 * Docs: https://playwright.dev/docs/network
 */
const SAUCE = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const API = process.env.API_BASE_URL ?? 'https://dummyjson.com';

test.describe('Network interception', { tag: '@network' }, () => {
  test('TC-NET-01: app still works when all images are blocked', async ({ page }) => {
    const blocked: string[] = [];
    await page.route(/\.(png|jpe?g|svg|gif|webp)(\?.*)?$/, (route) => {
      blocked.push(route.request().url());
      return route.abort();
    });

    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    await page.goto(SAUCE);
    await login.loginAs(USERS.standard);

    await expect(inventory.inventoryItems).toHaveCount(6);
    expect(blocked.length, 'some image requests should have been blocked').toBeGreaterThan(0);
  });

  test('TC-NET-02: collects all requests and checks for failed responses', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(SAUCE);
    await new LoginPage(page).loginAs(USERS.standard);
    await expect(new InventoryPage(page).inventoryItems).toHaveCount(6);

    // Only check first-party resources (third-party trackers may legitimately fail)
    const firstPartyFailures = failed.filter((f) => f.includes('saucedemo.com'));
    expect(firstPartyFailures).toEqual([]);
  });

  test('TC-NET-03: waitForResponse captures a specific API call', async ({ page }) => {
    await page.goto('about:blank');
    const responsePromise = page.waitForResponse((r) => r.url().includes('/products/1') && r.status() === 200);

    await page.goto(`${API}/products/1`);
    const response = await responsePromise;
    const json = await response.json();
    expect(json.id).toBe(1);
  });

  test('TC-NET-04: mock an API response with route.fulfill', async ({ page }) => {
    const mockProducts = {
      products: [
        { id: 1, title: 'Mocked Laptop', price: 999 },
        { id: 2, title: 'Mocked Phone', price: 499 },
      ],
      total: 2,
      skip: 0,
      limit: 2,
    };

    // Any request matching this pattern never reaches the server
    await page.route(`${API}/products*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(mockProducts),
      }),
    );

    await page.goto(SAUCE);
    // Simulate the front-end calling the API with fetch()
    const data = await page.evaluate(async (url) => (await fetch(url)).json(), `${API}/products?limit=2`);
    expect(data).toEqual(mockProducts);
  });

  test('TC-NET-05: modify a real API response (route.fetch + fulfill)', async ({ page }) => {
    await page.route(`${API}/products/1`, async (route) => {
      const response = await route.fetch(); // perform the real request
      const json = await response.json();
      json.title = 'PATCHED BY PLAYWRIGHT';
      await route.fulfill({ response, json });
    });

    await page.goto(`${API}/products/1`);
    await expect(page.locator('body')).toContainText('PATCHED BY PLAYWRIGHT');
  });

  test('TC-NET-06: simulate a server error (500)', async ({ page }) => {
    await page.route(`${API}/products/1`, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' }),
    );
    const response = await page.goto(`${API}/products/1`);
    expect(response?.status()).toBe(500);
  });

  test('TC-NET-07: offline mode is handled', async ({ page, context }) => {
    await page.goto(`${API}/products/1`);
    await context.setOffline(true);
    await expect(page.goto(`${API}/products/2`)).rejects.toThrow(/ERR_INTERNET_DISCONNECTED|offline|NS_ERROR/i);
    await context.setOffline(false);
  });
});

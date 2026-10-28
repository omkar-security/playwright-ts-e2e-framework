import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../../src/pages/LoginPage';
import { USERS } from '../../src/data/users';

/**
 * Accessibility (a11y) testing with axe-core.
 * SauceDemo is a demo app with some known a11y issues; we keep a baseline of known
 * rule violations and fail the test only when a NEW type of violation appears.
 * Docs: https://playwright.dev/docs/accessibility-testing
 */
const SAUCE = process.env.BASE_URL ?? 'https://www.saucedemo.com';

// Baseline of rule ids already known to fail on the demo site.
const KNOWN_VIOLATIONS = [
  'label',
  'region',
  'landmark-one-main',
  'page-has-heading-one',
  'select-name',
  'color-contrast',
  'image-alt',
  'button-name',
  'link-name',
  'heading-order',
  'aria-allowed-role',
];

test.describe('Accessibility', { tag: '@a11y' }, () => {
  test('TC-A11Y-01: login page has no new WCAG A/AA violations', async ({ page }, testInfo) => {
    await page.goto(SAUCE);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    await testInfo.attach('axe-results-login', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const newViolations = results.violations.filter((v) => !KNOWN_VIOLATIONS.includes(v.id));
    expect(newViolations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('TC-A11Y-02: inventory page has no new WCAG violations', async ({ page }, testInfo) => {
    await page.goto(SAUCE);
    await new LoginPage(page).loginAs(USERS.standard);
    await expect(page).toHaveURL(/inventory/);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.footer') // example: exclude a region from the scan
      .analyze();

    await testInfo.attach('axe-results-inventory', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const newViolations = results.violations.filter((v) => !KNOWN_VIOLATIONS.includes(v.id));
    expect(newViolations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('TC-A11Y-03: login form is fully keyboard operable', async ({ page }) => {
    await page.goto(SAUCE);
    const login = new LoginPage(page);

    await login.usernameInput.focus();
    await page.keyboard.type(USERS.standard.username);
    await page.keyboard.press('Tab');
    await expect(login.passwordInput).toBeFocused();
    await page.keyboard.type(USERS.standard.password);
    await page.keyboard.press('Tab');
    await expect(login.loginButton).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/inventory/);
  });

  test('TC-A11Y-04: aria snapshot of the login form structure', async ({ page }) => {
    await page.goto(SAUCE);
    // ARIA snapshot asserts the accessibility tree (roles + names), not the pixels
    await expect(page.locator('form')).toMatchAriaSnapshot(`
      - textbox "Username"
      - textbox "Password"
      - button "Login"
    `);
  });
});

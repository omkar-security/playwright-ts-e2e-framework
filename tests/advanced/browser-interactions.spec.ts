import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Browser interactions that an e-commerce site does not always have, demonstrated on
 * "The Internet" practice site (https://the-internet.herokuapp.com).
 * Concepts: dialogs (alert/confirm/prompt), iframes, file upload/download, new tabs/popups,
 * drag & drop, hover, dynamic waits, checkboxes, dropdowns, keyboard, multiple contexts.
 */
const BASE = 'https://the-internet.herokuapp.com';

test.describe('Browser interactions', { tag: '@interactions' }, () => {
  test('TC-INT-01: handle JS alert', async ({ page }) => {
    await page.goto(`${BASE}/javascript_alerts`);
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('I am a JS Alert');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Click for JS Alert' }).click();
    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
  });

  test('TC-INT-02: dismiss JS confirm', async ({ page }) => {
    await page.goto(`${BASE}/javascript_alerts`);
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
  });

  test('TC-INT-03: type into JS prompt', async ({ page }) => {
    await page.goto(`${BASE}/javascript_alerts`);
    page.once('dialog', (dialog) => dialog.accept('Playwright'));
    await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
    await expect(page.locator('#result')).toHaveText('You entered: Playwright');
  });

  test('TC-INT-04: read content inside nested iframes', async ({ page }) => {
    await page.goto(`${BASE}/nested_frames`);
    const bottom = page.frameLocator('frame[name="frame-bottom"]');
    await expect(bottom.locator('body')).toContainText('BOTTOM');

    const middle = page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-middle"]');
    await expect(middle.locator('#content')).toHaveText('MIDDLE');
  });

  test('TC-INT-05: upload a file', async ({ page }) => {
    await page.goto(`${BASE}/upload`);
    await page.locator('#file-upload').setInputFiles(path.join(__dirname, '../../test-data/upload-sample.txt'));
    await page.locator('#file-submit').click();
    await expect(page.locator('h3')).toHaveText('File Uploaded!');
    await expect(page.locator('#uploaded-files')).toHaveText('upload-sample.txt');
  });

  test('TC-INT-06: download a file', async ({ page }, testInfo) => {
    await page.goto(`${BASE}/download`);
    const firstLink = page.locator('#content a').first();

    const downloadPromise = page.waitForEvent('download');
    await firstLink.click();
    const download = await downloadPromise;

    const savePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(savePath);
    expect(fs.existsSync(savePath)).toBe(true);
  });

  test('TC-INT-07: handle a new browser tab (popup)', async ({ page, context }) => {
    await page.goto(`${BASE}/windows`);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Click Here' }).click(),
    ]);
    await newPage.waitForLoadState();
    await expect(newPage.locator('h3')).toHaveText('New Window');
    expect(context.pages()).toHaveLength(2);
    await newPage.close();
  });

  test('TC-INT-08: drag and drop', async ({ page }) => {
    await page.goto(`${BASE}/drag_and_drop`);
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await expect(page.locator('#column-a header')).toHaveText('B');
    await expect(page.locator('#column-b header')).toHaveText('A');
  });

  test('TC-INT-09: hover reveals hidden content', async ({ page }) => {
    await page.goto(`${BASE}/hovers`);
    const figure = page.locator('.figure').first();
    await expect(figure.locator('.figcaption')).toBeHidden();
    await figure.hover();
    await expect(figure.locator('.figcaption')).toBeVisible();
    await expect(figure.locator('h5')).toHaveText('name: user1');
  });

  test('TC-INT-10: auto-wait for dynamically loaded content', async ({ page }) => {
    await page.goto(`${BASE}/dynamic_loading/1`);
    await page.getByRole('button', { name: 'Start' }).click();
    // No sleeps! Web-first assertions wait automatically (here up to 10s)
    await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 10_000 });
  });

  test('TC-INT-11: checkboxes and dropdown', async ({ page }) => {
    await page.goto(`${BASE}/checkboxes`);
    const boxes = page.locator('#checkboxes input[type="checkbox"]');
    await boxes.nth(0).check();
    await boxes.nth(1).uncheck();
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).not.toBeChecked();

    await page.goto(`${BASE}/dropdown`);
    await page.locator('#dropdown').selectOption({ label: 'Option 2' });
    await expect(page.locator('#dropdown')).toHaveValue('2');
  });

  test('TC-INT-12: keyboard key presses', async ({ page }) => {
    await page.goto(`${BASE}/key_presses`);
    await page.locator('#target').press('Escape');
    await expect(page.locator('#result')).toHaveText('You entered: ESCAPE');
  });

  test('TC-INT-13: two isolated browser contexts (two users at once)', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto(`${BASE}/login`);
    await pageA.locator('#username').fill('tomsmith');
    await pageA.locator('#password').fill('SuperSecretPassword!');
    await pageA.getByRole('button', { name: /login/i }).click();
    await expect(pageA.locator('#flash')).toContainText('You logged into a secure area!');

    // Context B shares no cookies with A, so it is NOT logged in
    await pageB.goto(`${BASE}/secure`);
    await expect(pageB.locator('#flash')).toContainText('You must login to view the secure area!');

    await contextA.close();
    await contextB.close();
  });
});

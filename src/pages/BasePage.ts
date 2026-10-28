import { type Page, type Locator, expect } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

/**
 * BasePage holds behaviour shared by every page object.
 * Every page "has a" header component (composition over inheritance for UI parts).
 */
export abstract class BasePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly title: Locator;

  /** Relative path of the page, resolved against `baseURL` from the config. */
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.title = page.locator('.title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path.replace('.', '\\.')));
  }
}

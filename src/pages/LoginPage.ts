import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../data/users';

export class LoginPage extends BasePage {
  readonly path = '/';
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    // getByTestId uses the `testIdAttribute` from config -> data-test="..."
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('.error-button');
    this.logo = page.locator('.login_logo');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveTitle('Swag Labs');
  }
}

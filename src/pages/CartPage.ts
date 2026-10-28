import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePrice } from '../utils/price-utils';

export class CartPage extends BasePage {
  readonly path = '/cart.html';
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemQuantities: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemQuantities = page.locator('.cart_quantity');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  cartItem(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  async removeItem(productName: string): Promise<void> {
    await this.cartItem(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(parsePrice);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectItems(productNames: string[]): Promise<void> {
    await expect(this.cartItems).toHaveCount(productNames.length);
    await expect(this.itemNames).toHaveText(productNames);
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
  }
}

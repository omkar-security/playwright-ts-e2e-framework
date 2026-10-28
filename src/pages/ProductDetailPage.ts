import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePrice } from '../utils/price-utils';

export class ProductDetailPage extends BasePage {
  readonly path = '/inventory-item.html';
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.locator('.inventory_details_name');
    this.description = page.locator('.inventory_details_desc');
    this.price = page.locator('.inventory_details_price');
    this.image = page.locator('img.inventory_details_img');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.backButton = page.getByRole('button', { name: /back to products/i });
  }

  async gotoById(id: number): Promise<void> {
    await this.page.goto(`${this.path}?id=${id}`);
  }

  async getPrice(): Promise<number> {
    return parsePrice((await this.price.textContent()) ?? '');
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(this.name).toBeVisible();
  }
}

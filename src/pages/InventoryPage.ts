import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { SortOption } from '../data/products';
import { parsePrice } from '../utils/price-utils';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortDropdown: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortDropdown = page.locator('.product_sort_container');
    this.footer = page.locator('.footer_copy');
  }

  /** Locator chaining + filtering: find the product card that contains the given name. */
  productCard(productName: string): Locator {
    return this.inventoryItems.filter({ hasText: productName });
  }

  async addToCart(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async addProductsToCart(productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addToCart(name);
    }
  }

  async openProduct(productName: string): Promise<void> {
    await this.itemNames.filter({ hasText: productName }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map(parsePrice);
  }

  async getProductPrice(productName: string): Promise<number> {
    const text = await this.productCard(productName).locator('.inventory_item_price').textContent();
    return parsePrice(text ?? '');
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }
}

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../utils/data-generator';
import { parsePrice } from '../utils/price-utils';

/** Checkout step 1: "Your Information" */
export class CheckoutInfoPage extends BasePage {
  readonly path = '/checkout-step-one.html';
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.errorMessage = page.getByTestId('error');
  }

  async fillInformation(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async submit(info: Partial<CustomerInfo>): Promise<void> {
    await this.fillInformation(info);
    await this.continueButton.click();
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.title).toHaveText('Checkout: Your Information');
  }
}

/** Checkout step 2: "Overview" */
export class CheckoutOverviewPage extends BasePage {
  readonly path = '/checkout-step-two.html';
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async getSummary() {
    return {
      subtotal: parsePrice((await this.subtotalLabel.textContent()) ?? ''),
      tax: parsePrice((await this.taxLabel.textContent()) ?? ''),
      total: parsePrice((await this.totalLabel.textContent()) ?? ''),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.title).toHaveText('Checkout: Overview');
  }
}

/** Checkout step 3: "Complete" */
export class CheckoutCompletePage extends BasePage {
  readonly path = '/checkout-complete.html';
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly ponyExpressImage: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutQuotePage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/checkout/quote');
    await this.waitForHydration();
  }

  get addressOptions(): Locator {
    return this.getByTestId('address-option');
  }

  get paymentTermSelect(): Locator {
    return this.getByTestId('payment-term-select');
  }

  get transportSelect(): Locator {
    return this.getByTestId('transport-select');
  }

  get notesTextarea(): Locator {
    return this.getByTestId('notes-textarea');
  }

  get validateButton(): Locator {
    return this.getByTestId('validate-cart-button');
  }

  get submitButton(): Locator {
    return this.getByTestId('submit-quote-button');
  }

  get validationAlerts(): Locator {
    return this.getByTestId('validation-alerts');
  }

  get quoteSummary(): Locator {
    return this.getByTestId('quote-summary');
  }

  get emptyCartMessage(): Locator {
    return this.getByTestId('empty-cart-message');
  }

  get loadingSpinner(): Locator {
    return this.getByTestId('loading-spinner');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.validateButton).toBeVisible({ timeout: 15000 });
  }

  async expectEmptyCart(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 10000 });
  }

  async selectAddress(addressIndex: number = 0): Promise<void> {
    const options = this.addressOptions;
    await options.nth(addressIndex).click();
    await this.waitForLoad();
  }

  async selectPaymentTerm(termCode: string): Promise<void> {
    await this.paymentTermSelect.selectOption(termCode);
    await this.waitForLoad();
  }

  async selectTransport(transportCode: string): Promise<void> {
    await this.transportSelect.selectOption(transportCode);
    await this.waitForLoad();
  }

  async fillNotes(notes: string): Promise<void> {
    await this.notesTextarea.fill(notes);
  }

  async validateCart(): Promise<void> {
    await this.validateButton.click();
    await this.waitForLoad();
  }

  async submitQuote(): Promise<void> {
    await this.submitButton.click();
    await this.waitForLoad();
  }

  async expectValidationSuccess(): Promise<void> {
    await expect(this.validationAlerts).toContainText('validado', { timeout: 10000 });
    await expect(this.submitButton).toBeEnabled();
  }

  async expectValidationError(message?: string): Promise<void> {
    await expect(this.validationAlerts).toBeVisible({ timeout: 10000 });
    if (message) {
      await expect(this.validationAlerts).toContainText(message);
    }
  }

  async expectRedirectToSuccess(): Promise<void> {
    await this.page.waitForURL('**/checkout/quote/success');
    await this.waitForLoad();
  }
}
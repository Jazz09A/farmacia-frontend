import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/cart');
    await this.waitForHydration();
  }

  get cartItems(): Locator {
    return this.getByTestId('cart-item');
  }

  get emptyCartMessage(): Locator {
    return this.getByTestId('empty-cart-message');
  }

  get cartTotal(): Locator {
    return this.getByTestId('cart-total');
  }

  get checkoutButton(): Locator {
    return this.getByTestId('checkout-button');
  }

  get continueShoppingButton(): Locator {
    return this.getByTestId('continue-shopping-button');
  }

  get quantityInputs(): Locator {
    return this.getByTestId('quantity-input');
  }

  get removeButtons(): Locator {
    return this.getByTestId('remove-item-button');
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 10000 });
  }

  async expectItems(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count, { timeout: 10000 });
  }

  async updateQuantity(index: number, quantity: number): Promise<void> {
    const inputs = this.quantityInputs;
    await inputs.nth(index).fill(quantity.toString());
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  async removeItem(index: number): Promise<void> {
    const buttons = this.removeButtons;
    await buttons.nth(index).click();
    await this.waitForLoad();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.waitForLoad();
  }

  async getTotal(): Promise<string> {
    return await this.cartTotal.textContent() || '';
  }
}
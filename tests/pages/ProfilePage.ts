import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/profile');
    await this.waitForHydration();
  }

  get quotesTab(): Locator {
    return this.getByTestId('tab-quotes');
  }

  get ordersTab(): Locator {
    return this.getByTestId('tab-orders');
  }

  get invoicesTab(): Locator {
    return this.getByTestId('tab-invoices');
  }

  get addressesTab(): Locator {
    return this.getByTestId('tab-addresses');
  }

  get passwordTab(): Locator {
    return this.getByTestId('tab-password');
  }

  get quotesList(): Locator {
    return this.getByTestId('quotes-list');
  }

  get ordersList(): Locator {
    return this.getByTestId('orders-list');
  }

  get addressesList(): Locator {
    return this.getByTestId('addresses-list');
  }

  get changePasswordForm(): Locator {
    return this.getByTestId('change-password-form');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.quotesTab).toBeVisible({ timeout: 10000 });
  }

  async goToTab(tab: 'quotes' | 'orders' | 'invoices' | 'addresses' | 'password'): Promise<void> {
    const tabMap = {
      quotes: this.quotesTab,
      orders: this.ordersTab,
      invoices: this.invoicesTab,
      addresses: this.addressesTab,
      password: this.passwordTab,
    };
    await tabMap[tab].click();
    await this.waitForLoad();
  }

  async expectQuotesVisible(): Promise<void> {
    await expect(this.quotesList).toBeVisible();
  }

  async expectAddressesVisible(): Promise<void> {
    await expect(this.addressesList).toBeVisible();
  }
}
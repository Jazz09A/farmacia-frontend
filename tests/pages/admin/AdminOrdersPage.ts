import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AdminOrdersPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/admin/orders');
    await this.waitForHydration();
  }

  get ordersTable(): Locator {
    return this.getByTestId('orders-table');
  }

  get orderRows(): Locator {
    return this.getByTestId('order-row');
  }

  get statusFilter(): Locator {
    return this.getByTestId('order-status-filter');
  }

  get searchInput(): Locator {
    return this.getByTestId('admin-orders-search');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.ordersTable).toBeVisible({ timeout: 15000 });
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForLoad();
  }

  async searchOrder(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  async updateOrderStatus(index: number, newStatus: string): Promise<void> {
    const rows = this.orderRows;
    await rows.nth(index).getByTestId('order-status-select').selectOption(newStatus);
    await this.waitForLoad();
  }
}
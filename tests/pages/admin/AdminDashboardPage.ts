import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AdminDashboardPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/admin/dashboard');
    await this.waitForHydration();
  }

  get statsCards(): Locator {
    return this.getByTestId('admin-stats-card');
  }

  get recentOrders(): Locator {
    return this.getByTestId('recent-orders');
  }

  get recentQuotes(): Locator {
    return this.getByTestId('recent-quotes');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.statsCards.first()).toBeVisible({ timeout: 15000 });
  }
}
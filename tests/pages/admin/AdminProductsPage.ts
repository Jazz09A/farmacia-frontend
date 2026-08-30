import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AdminProductsPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/admin/products');
    await this.waitForHydration();
  }

  get createProductButton(): Locator {
    return this.getByTestId('create-product-button');
  }

  get productsTable(): Locator {
    return this.getByTestId('products-table');
  }

  get productRows(): Locator {
    return this.getByTestId('product-row');
  }

  get searchInput(): Locator {
    return this.getByTestId('admin-products-search');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productsTable).toBeVisible({ timeout: 15000 });
  }

  async clickCreateProduct(): Promise<void> {
    await this.createProductButton.click();
    await this.waitForLoad();
  }

  async searchProduct(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  async editProduct(index: number = 0): Promise<void> {
    const rows = this.productRows;
    await rows.nth(index).getByTestId('edit-product-button').click();
    await this.waitForLoad();
  }

  async deleteProduct(index: number = 0): Promise<void> {
    const rows = this.productRows;
    await rows.nth(index).getByTestId('delete-product-button').click();
    await this.page.getByRole('button', { name: 'Confirmar' }).click();
    await this.waitForLoad();
  }
}
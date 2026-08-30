import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/catalog');
    await this.waitForHydration();
  }

  get searchInput(): Locator {
    return this.getByTestId('catalog-search-input');
  }

  get categoryFilters(): Locator {
    return this.getByTestId('category-filters');
  }

  get priceRangeSlider(): Locator {
    return this.getByTestId('price-range-slider');
  }

  get inStockCheckbox(): Locator {
    return this.getByTestId('in-stock-filter');
  }

  get sortSelect(): Locator {
    return this.getByTestId('sort-select');
  }

  get viewModeGrid(): Locator {
    return this.getByTestId('view-mode-grid');
  }

  get viewModeList(): Locator {
    return this.getByTestId('view-mode-list');
  }

  get productGrid(): Locator {
    return this.getByTestId('product-grid');
  }

  get productCards(): Locator {
    return this.getByTestId('product-card');
  }

  get pagination(): Locator {
    return this.getByTestId('pagination');
  }

  get loadingSkeleton(): Locator {
    return this.getByTestId('product-skeleton');
  }

  get resultsCount(): Locator {
    return this.getByTestId('results-count');
  }

  get filtersToggle(): Locator {
    return this.getByTestId('filters-toggle');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  async selectCategory(category: string): Promise<void> {
    await this.page.getByRole('button', { name: category }).click();
    await this.waitForLoad();
  }

  async toggleInStock(enabled: boolean): Promise<void> {
    const checkbox = this.inStockCheckbox;
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enabled) {
      await checkbox.click();
      await this.waitForLoad();
    }
  }

  async setPriceRange(max: number): Promise<void> {
    await this.priceRangeSlider.fill(max.toString());
    await this.waitForLoad();
  }

  async setSort(sortBy: string): Promise<void> {
    await this.sortSelect.selectOption(sortBy);
    await this.waitForLoad();
  }

  async setViewMode(mode: 'grid' | 'list'): Promise<void> {
    if (mode === 'grid') {
      await this.viewModeGrid.click();
    } else {
      await this.viewModeList.click();
    }
    await this.waitForLoad();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('link', { name: pageNumber.toString() }).click();
    await this.waitForLoad();
  }

  async clickProduct(index: number = 0): Promise<void> {
    const cards = this.productCards;
    await cards.nth(index).click();
    await this.waitForLoad();
  }

  async addProductToCart(index: number = 0): Promise<void> {
    const cards = this.productCards;
    const card = cards.nth(index);
    const addButton = card.getByTestId('add-to-cart-button');
    await addButton.click();
    await this.waitForLoad();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 15000 });
    await expect(this.productGrid).toBeVisible();
  }

  async expectProductsVisible(count: number = 1): Promise<void> {
    await expect(this.productCards).toHaveCount(count, { timeout: 10000 });
  }

  async expectNoProducts(): Promise<void> {
    await expect(this.getByText('No se encontraron productos')).toBeVisible();
  }
}
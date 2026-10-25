import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  async goto(productId: string): Promise<void> {
    await super.goto(`/product/${productId}`);
    await this.waitForHydration();
  }

  get productName(): Locator {
    return this.getByTestId('product-name');
  }

  get productPrice(): Locator {
    return this.getByTestId('product-price');
  }

  get productDescription(): Locator {
    return this.getByTestId('product-description');
  }

  get productImages(): Locator {
    return this.getByTestId('product-image');
  }

  get addToCartButton(): Locator {
    return this.getByTestId('add-to-cart-button');
  }

  get quantityInput(): Locator {
    return this.getByTestId('quantity-input');
  }

  get relatedProducts(): Locator {
    return this.getByTestId('related-products');
  }

  get addToCartSuccess(): Locator {
    return this.getByTestId('add-to-cart-success');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible({ timeout: 15000 });
    await expect(this.addToCartButton).toBeVisible();
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.quantityInput.fill(quantity.toString());
    }
    await this.addToCartButton.click();
    await this.waitForLoad();
    await expect(this.addToCartSuccess).toBeVisible({ timeout: 5000 });
  }

  async expectProductDetails(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productDescription).toBeVisible();
  }
}
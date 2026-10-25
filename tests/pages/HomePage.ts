import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForHydration();
  }

  get heroSection(): Locator {
    return this.getByTestId('hero-section');
  }

  get brandsSection(): Locator {
    return this.getByTestId('brands-section');
  }

  get testimonialsSection(): Locator {
    return this.getByTestId('testimonials-section');
  }

  get blogSection(): Locator {
    return this.getByTestId('blog-section');
  }

  get contactSection(): Locator {
    return this.getByTestId('contact-section');
  }

  get cartButton(): Locator {
    return this.getByTestId('cart-button');
  }

  get userMenuButton(): Locator {
    return this.getByTestId('user-menu-button');
  }

  get catalogLink(): Locator {
    return this.getByRole('link', { name: 'CATÁLOGO' });
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
    await this.waitForLoad();
  }

  async goToCatalog(): Promise<void> {
    await this.catalogLink.click();
    await this.waitForLoad();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heroSection).toBeVisible({ timeout: 15000 });
    await expect(this.brandsSection).toBeVisible();
  }
}
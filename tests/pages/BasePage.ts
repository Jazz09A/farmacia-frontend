import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:5173';
  }

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForHydration(): Promise<void> {
    await this.page.waitForFunction(() => document.readyState === 'complete');
    await this.page.waitForTimeout(500);
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  getByRole(role: string, options?: { name?: string }): Locator {
    return this.page.getByRole(role as any, options);
  }

  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  getByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  async clickAndWait(locator: Locator, options?: { waitForUrl?: string }): Promise<void> {
    await locator.click();
    if (options?.waitForUrl) {
      await this.page.waitForURL(options.waitForUrl);
    }
    await this.waitForLoad();
  }

  async fillAndSubmit(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
    await this.waitForLoad();
  }

  async waitForToast(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
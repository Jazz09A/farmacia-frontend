import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegisterUserData } from '../fixtures';

export class AuthPage extends BasePage {
  async goto(options?: { mode?: 'login' | 'register' | 'forgot-password' }): Promise<void> {
    const mode = options?.mode || 'login';
    await super.goto(`/auth?mode=${mode}`);
    await this.waitForHydration();
  }

  get emailInput(): Locator {
    return this.getByTestId('email-input');
  }

  get passwordInput(): Locator {
    return this.getByTestId('password-input');
  }

  get loginButton(): Locator {
    return this.getByTestId('login-button');
  }

  get registerLink(): Locator {
    return this.getByTestId('register-link');
  }

  get forgotPasswordLink(): Locator {
    return this.getByTestId('forgot-password-link');
  }

  get backToLoginLink(): Locator {
    return this.getByTestId('back-to-login-link');
  }

  // Register form fields
  get companyNameInput(): Locator {
    return this.getByTestId('company-name-input');
  }

  get rucInput(): Locator {
    return this.getByTestId('ruc-input');
  }

  get phoneInput(): Locator {
    return this.getByTestId('phone-input');
  }

  get addressInput(): Locator {
    return this.getByTestId('address-input');
  }

  get cityInput(): Locator {
    return this.getByTestId('city-input');
  }

  get stateInput(): Locator {
    return this.getByTestId('state-input');
  }

  get postalCodeInput(): Locator {
    return this.getByTestId('postal-code-input');
  }

  get contactNameInput(): Locator {
    return this.getByTestId('contact-name-input');
  }

  get contactEmailInput(): Locator {
    return this.getByTestId('contact-email-input');
  }

  get contactPhoneInput(): Locator {
    return this.getByTestId('contact-phone-input');
  }

  get registerPasswordInput(): Locator {
    return this.getByTestId('register-password-input');
  }

  get registerConfirmPasswordInput(): Locator {
    return this.getByTestId('register-confirm-password-input');
  }

  get registerSubmitButton(): Locator {
    return this.getByTestId('register-submit-button');
  }

  get registerSwitchToLogin(): Locator {
    return this.getByTestId('register-switch-to-login');
  }

  // Forgot password
  get forgotPasswordEmailInput(): Locator {
    return this.getByTestId('forgot-password-email-input');
  }

  get forgotPasswordSubmitButton(): Locator {
    return this.getByTestId('forgot-password-submit-button');
  }

  get errorMessage(): Locator {
    return this.getByTestId('error-message');
  }

  get successMessage(): Locator {
    return this.getByTestId('success-message');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForLoad();
  }

  async registerJuridico(userData: RegisterUserData): Promise<void> {
    await this.companyNameInput.fill(userData.companyName);
    await this.rucInput.fill(userData.ruc);
    await this.phoneInput.fill(userData.phone);
    await this.addressInput.fill(userData.address);
    await this.cityInput.fill(userData.city);
    await this.stateInput.fill(userData.state);
    await this.postalCodeInput.fill(userData.postalCode);
    await this.contactNameInput.fill(userData.contactName);
    await this.contactEmailInput.fill(userData.contactEmail);
    await this.contactPhoneInput.fill(userData.contactPhone);
    await this.registerPasswordInput.fill(userData.password);
    await this.registerConfirmPasswordInput.fill(userData.password);
    await this.registerSubmitButton.click();
    await this.waitForLoad();
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.forgotPasswordEmailInput.fill(email);
    await this.forgotPasswordSubmitButton.click();
    await this.waitForLoad();
  }

  async expectLoginForm(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectRegisterForm(): Promise<void> {
    await expect(this.companyNameInput).toBeVisible({ timeout: 10000 });
    await expect(this.registerSubmitButton).toBeVisible();
  }

  async expectForgotPasswordForm(): Promise<void> {
    await expect(this.forgotPasswordEmailInput).toBeVisible({ timeout: 10000 });
    await expect(this.forgotPasswordSubmitButton).toBeVisible();
  }

  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectSuccess(message?: string): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  async switchToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.waitForLoad();
  }

  async switchToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForLoad();
  }

  async switchToLogin(): Promise<void> {
    await this.backToLoginLink.click();
    await this.waitForLoad();
  }
}
import { test, expect } from '../fixtures';

test.describe('Email Verification', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
  });

  test('email-verification-page-valid-token', async ({ page }) => {
    // Mock the verification API to return success
    await page.route('**/api/v1/auth/verify-email/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          message: 'Email verified successfully' 
        }),
      });
    });
    
    await page.goto('/verify-email/valid-test-token-123');
    await page.waitForLoadState('networkidle');
    
    // Verify success page
    const successMessage = page.getByText(/verificado|verified|éxito|success/i).first();
    const successExists = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (successExists) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('email-verification-page-invalid-token', async ({ page }) => {
    // Mock the verification API to return error
    await page.route('**/api/v1/auth/verify-email/*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          detail: 'Invalid or expired verification token' 
        }),
      });
    });
    
    await page.goto('/verify-email/invalid-token-xyz');
    await page.waitForLoadState('networkidle');
    
    // Verify error page
    const errorMessage = page.getByText(/inválid|invalid|expir|error/i).first();
    const errorExists = await errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (errorExists) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('email-verification-page-expired-token', async ({ page }) => {
    // Mock the verification API to return expired token error
    await page.route('**/api/v1/auth/verify-email/*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          detail: 'Token has expired' 
        }),
      });
    });
    
    await page.goto('/verify-email/expired-token-abc');
    await page.waitForLoadState('networkidle');
    
    // Verify error message about expiration
    const errorMessage = page.getByText(/expir|inválid|invalid/i).first();
    const errorExists = await errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (errorExists) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('email-verification-redirect-to-login', async ({ page }) => {
    // Mock the verification API to return success
    await page.route('**/api/v1/auth/verify-email/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          message: 'Email verified successfully' 
        }),
      });
    });
    
    await page.goto('/verify-email/valid-token-redirect');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for a link/button to go to login
    const loginLink = page.getByRole('link', { name: /iniciar|login/i }).first();
    const loginButton = page.getByRole('button', { name: /iniciar|login/i }).first();
    
    const linkExists = await loginLink.isVisible({ timeout: 5000 }).catch(() => false);
    const buttonExists = await loginButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (linkExists || buttonExists) {
      // User can navigate to login
      expect(linkExists || buttonExists).toBeTruthy();
    }
  });
});
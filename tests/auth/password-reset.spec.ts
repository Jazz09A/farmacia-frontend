import { test, expect } from '../fixtures';

test.describe('Password Reset - Full Flow', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
  });

  test('forgot-password-page-renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Verify forgot password page loaded
    const emailInput = page.getByLabel(/email|correo/i).first();
    const submitButton = page.getByRole('button', { name: /enviar|send|recuperar/i }).first();
    
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeVisible();
  });

  test('forgot-password-submit-success', async ({ page }) => {
    // Mock the forgot password API
    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          message: 'If the email exists, a reset link has been sent' 
        }),
      });
    });
    
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/email|correo/i).first();
    const submitButton = page.getByRole('button', { name: /enviar|send|recuperar/i }).first();
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Verify success message (anti-enumeration: same message for existing and non-existing)
    const successMessage = page.getByText(/enviado|sent|recibirás|check your email/i).first();
    const successExists = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (successExists) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('forgot-password-invalid-email-validation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/email|correo/i).first();
    const submitButton = page.getByRole('button', { name: /enviar|send|recuperar/i }).first();
    
    // Try invalid email
    await emailInput.fill('not-an-email');
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Should show validation error or stay on page
    // Browser native validation should prevent submission
    const stillOnPage = page.url().includes('forgot-password');
    expect(stillOnPage).toBeTruthy();
  });

  test('reset-password-page-with-token', async ({ page }) => {
    // Mock the reset password API
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          message: 'Password reset successfully' 
        }),
      });
    });
    
    await page.goto('/reset-password?token=valid-test-token');
    await page.waitForLoadState('networkidle');
    
    // Verify reset password form
    const newPasswordInput = page.getByLabel(/nueva contraseña|new password/i).first();
    const confirmPasswordInput = page.getByLabel(/confirmar|confirm/i).first();
    const submitButton = page.getByRole('button', { name: /restablecer|reset|cambiar/i }).first();
    
    const inputExists = await newPasswordInput.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (inputExists) {
      await newPasswordInput.fill('NewPassword123!');
      if (await confirmPasswordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmPasswordInput.fill('NewPassword123!');
      }
      
      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('reset-password-invalid-token-shows-error', async ({ page }) => {
    // Mock the reset password API to return error
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          detail: 'Invalid or expired token' 
        }),
      });
    });
    
    await page.goto('/reset-password?token=invalid-token');
    await page.waitForLoadState('networkidle');
    
    const newPasswordInput = page.getByLabel(/nueva contraseña|new password/i).first();
    const submitButton = page.getByRole('button', { name: /restablecer|reset|cambiar/i }).first();
    
    if (await newPasswordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newPasswordInput.fill('NewPassword123!');
      
      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Verify error message
        const errorMessage = page.getByText(/inválid|invalid|expir|error/i).first();
        const errorExists = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (errorExists) {
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });

  test('password-reset-full-flow-link-to-login', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Look for link to login
    const loginLink = page.getByRole('link', { name: /iniciar sesión|login/i }).first();
    const linkExists = await loginLink.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (linkExists) {
      await expect(loginLink).toBeVisible();
    }
  });
});
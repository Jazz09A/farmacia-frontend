import { test, expect } from '../fixtures';
import { createTestUser } from '../utils/testData';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('auth-login-success', async ({ page, authPage, loginAsUser, testUser }) => {
    // Register first (or use existing user)
    await loginAsUser(testUser.email, testUser.password);
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('user-menu-button')).toBeVisible();
  });

  test('auth-login-failure', async ({ page, authPage }) => {
    await authPage.goto();
    await authPage.expectLoginForm();
    
    await authPage.login('invalid@example.com', 'wrongpassword');
    await authPage.expectError('credenciales');
  });

  test('auth-register-juridico', async ({ page, authPage, registerUser }) => {
    const userData = createTestUser();
    await registerUser(userData);
    
    // Should redirect to verification page
    await expect(page).toHaveURL('/verify-account');
    await expect(page.getByText('Verifica tu correo')).toBeVisible();
  });

  test('auth-forgot-password', async ({ page, authPage }) => {
    await authPage.goto({ mode: 'forgot-password' });
    await authPage.expectForgotPasswordForm();
    
    await authPage.requestPasswordReset('test@example.com');
    await authPage.expectSuccess('enviado');
  });

  test('auth-email-verification', async ({ page }) => {
    // This test would need a real verification token
    // For now, we test the page loads
    await page.goto('/verify-email/invalid-token');
    await page.waitForLoadState('networkidle');
    
    // Should show error or expired message
    await expect(page.getByText(/expirado|inválido|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('auth-session-persistence', async ({ page, loginAsUser, testUser }) => {
    await loginAsUser(testUser.email, testUser.password);
    await expect(page.getByTestId('user-menu-button')).toBeVisible();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Session should persist
    await expect(page.getByTestId('user-menu-button')).toBeVisible();
  });

  test('auth-logout', async ({ page, loginAsUser, testUser, logout }) => {
    await loginAsUser(testUser.email, testUser.password);
    await expect(page.getByTestId('user-menu-button')).toBeVisible();
    
    await logout();
    
    // Should be logged out
    await expect(page.getByTestId('user-menu-button')).not.toBeVisible();
    
    // Protected routes should redirect to auth
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('auth-mode-switching', async ({ page, authPage }) => {
    await authPage.goto({ mode: 'login' });
    await authPage.expectLoginForm();
    
    await authPage.switchToRegister();
    await authPage.expectRegisterForm();
    
    await authPage.switchToForgotPassword();
    await authPage.expectForgotPasswordForm();
    
    await authPage.switchToLogin();
    await authPage.expectLoginForm();
  });
});
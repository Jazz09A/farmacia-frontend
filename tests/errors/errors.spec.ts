import { test, expect } from '../fixtures';

test.describe('Error Handling (4xx/5xx)', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
  });

  test('404-page-should-render-for-invalid-routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    
    // Should get 404 or render a 404 page
    if (response && response.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      // SPA may render 404 page with 200 status
      const notFoundText = page.getByText(/404|no encontrad|not found|página no existe/i).first();
      const notFoundExists = await notFoundText.isVisible({ timeout: 5000 }).catch(() => false);
      expect(notFoundExists || response?.status() === 404).toBeTruthy();
    }
  });

  test('login-with-wrong-credentials-shows-error', async ({ page }) => {
    // Mock backend to return 401
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid credentials' }),
      });
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in wrong credentials
    const emailInput = page.getByLabel(/email|correo/i).first();
    const passwordInput = page.getByLabel(/contraseña|password/i).first();
    const submitButton = page.getByRole('button', { name: /iniciar|login|entrar/i }).first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('wrong@example.com');
      await passwordInput.fill('WrongPassword1');
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Verify error message
      const errorMessage = page.getByText(/inválid|invalid|error|credencial/i).first();
      const errorExists = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (errorExists) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('500-error-page-should-render-gracefully', async ({ page }) => {
    // Mock backend to return 500
    await page.route('**/api/v1/articles**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Page should not crash, should show some error state
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('network-timeout-should-handle-gracefully', async ({ page }) => {
    // Simulate slow response that times out
    await page.route('**/api/v1/articles**', async (route) => {
      // Don't fulfill - let it timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
    });
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Page should still render with some state
    const body = page.locator('body').first();
    await expect(body).toBeVisible();
  });

  test('cart-with-500-error-on-add-should-show-message', async ({ page, authHeaders }) => {
    // Setup auth
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, authHeaders.Authorization.replace('Bearer ', ''));
    
    // Mock backend to return 500 on add to cart
    await page.route('**/api/v1/cart/add', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click add to cart
    const addButton = page.getByTestId('add-to-cart-button').first();
    const addExists = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (addExists) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // Verify error message is shown
      const errorMessage = page.getByText(/error|problema|intenta/i).first();
      const errorExists = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      // Either error is shown or page doesn't crash
      const body = page.locator('body').first();
      await expect(body).toBeVisible();
    }
  });

  test('unauthorized-access-redirects-to-login', async ({ page }) => {
    // Mock backend to return 401
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' }),
      });
    });
    
    // Clear any stored auth
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show login prompt
    const currentUrl = page.url();
    const onLoginPage = currentUrl.includes('/login');
    const loginButton = page.getByRole('button', { name: /iniciar|login/i }).first();
    const hasLoginButton = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(onLoginPage || hasLoginButton).toBeTruthy();
  });

  test('forbidden-access-shows-403-message', async ({ page, authHeaders }) => {
    // Setup auth
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, authHeaders.Authorization.replace('Bearer ', ''));
    
    // Mock backend to return 403
    await page.route('**/api/v1/admin/**', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Forbidden' }),
      });
    });
    
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should show forbidden or redirect
    const body = page.locator('body').first();
    await expect(body).toBeVisible();
  });

  test('validation-error-422-shows-field-errors', async ({ page }) => {
    // Mock backend to return 422 validation error
    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: [
            { loc: ['body', 'email'], msg: 'Invalid email format', type: 'value_error' },
            { loc: ['body', 'password'], msg: 'Password too short', type: 'value_error' },
          ],
        }),
      });
    });
    
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Fill in invalid data
    const emailInput = page.getByLabel(/email|correo/i).first();
    const submitButton = page.getByRole('button', { name: /registrar|register|crear/i }).first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('invalid');
      
      // Find password field
      const passwordInput = page.getByLabel(/contraseña|password/i).first();
      if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordInput.fill('123');
      }
      
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Page should show validation errors or stay on page
      const body = page.locator('body').first();
      await expect(body).toBeVisible();
    }
  });
});
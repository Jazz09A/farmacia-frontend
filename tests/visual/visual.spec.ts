import { test, expect } from '../fixtures';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
  });

  test('home-page-visual-snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('login-page-visual-snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('catalog-page-visual-snapshot', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('catalog-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('register-page-visual-snapshot', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('forgot-password-page-visual-snapshot', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('forgot-password-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('cart-page-visual-snapshot-authenticated', async ({ page, authHeaders }) => {
    // Setup auth
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, authHeaders.Authorization.replace('Bearer ', ''));
    
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('cart-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('admin-dashboard-visual-snapshot', async ({ page, loginAsAdmin, adminDashboardPage }) => {
    await loginAsAdmin();
    await adminDashboardPage.expectLoaded();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('admin-dashboard.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('blog-page-visual-snapshot', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('blog-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});
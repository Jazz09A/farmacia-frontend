import { test, expect } from '../fixtures';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('admin-login', async ({ page, authPage, loginAsAdmin, adminDashboardPage }) => {
    await loginAsAdmin();
    await adminDashboardPage.expectLoaded();
  });

  test('admin-products-crud', async ({ 
    page, 
    loginAsAdmin, 
    adminProductsPage,
    adminDashboardPage
  }) => {
    await loginAsAdmin();
    await adminDashboardPage.expectLoaded();
    
    // Navigate to products
    await adminProductsPage.goto();
    await adminProductsPage.expectLoaded();
    
    // Create product
    await adminProductsPage.clickCreateProduct();
    await page.waitForLoadState('networkidle');
    
    // Fill product form
    await page.getByTestId('product-name-input').fill('Test Product');
    await page.getByTestId('product-price-input').fill('100.00');
    await page.getByTestId('product-brand-input').fill('Test Brand');
    await page.getByTestId('product-category-select').selectOption('MEDICAMENTOS');
    
    // Upload image (using test fixture)
    // await page.getByTestId('product-image-upload').setInputFiles('tests/fixtures/images/test-product.jpg');
    
    await page.getByTestId('product-submit-button').click();
    await page.waitForLoadState('networkidle');
    
    // Verify product created
    await expect(page.getByText('Producto creado')).toBeVisible({ timeout: 10000 });
    
    // Edit product
    await adminProductsPage.editProduct(0);
    await page.getByTestId('product-name-input').fill('Test Product Updated');
    await page.getByTestId('product-submit-button').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Producto actualizado')).toBeVisible();
    
    // Delete product
    await adminProductsPage.deleteProduct(0);
    await expect(page.getByText('Producto eliminado')).toBeVisible();
  });

  test('admin-orders-management', async ({ 
    page, 
    loginAsAdmin, 
    adminOrdersPage,
    adminDashboardPage
  }) => {
    await loginAsAdmin();
    await adminDashboardPage.expectLoaded();
    
    await adminOrdersPage.goto();
    await adminOrdersPage.expectLoaded();
    
    // Filter orders
    await adminOrdersPage.filterByStatus('PENDING');
    await adminOrdersPage.expectLoaded();
    
    // Update order status
    const orderCount = await adminOrdersPage.orderRows.count();
    if (orderCount > 0) {
      await adminOrdersPage.updateOrderStatus(0, 'CONFIRMED');
      await expect(page.getByText('Estado actualizado')).toBeVisible({ timeout: 10000 });
    }
  });

  test('admin-analytics', async ({ page, loginAsAdmin, adminDashboardPage }) => {
    await loginAsAdmin();
    await adminDashboardPage.expectLoaded();
    
    // Verify stats cards are visible
    const statsCount = await adminDashboardPage.statsCards.count();
    expect(statsCount).toBeGreaterThan(0);
  });
});
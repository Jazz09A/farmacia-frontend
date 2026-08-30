import { test, expect } from '../fixtures';

test.describe('Core UI / Regression', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('home-page-loads', async ({ homePage }) => {
    await homePage.expectLoaded();
    
    // Verify all sections
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.brandsSection).toBeVisible();
    await expect(homePage.testimonialsSection).toBeVisible();
    await expect(homePage.blogSection).toBeVisible();
    await expect(homePage.contactSection).toBeVisible();
  });

  test('catalog-filters', async ({ page, catalogPage, loginAsUser, testUser }) => {
    await loginAsUser(testUser.email, testUser.password);
    await catalogPage.goto();
    await catalogPage.expectLoaded();
    
    // Test search
    await catalogPage.search('vitamina');
    await catalogPage.expectProductsVisible();
    
    // Test category filter
    await catalogPage.selectCategory('Bienestar General');
    await catalogPage.expectLoaded();
    
    // Test price range
    await catalogPage.setPriceRange(50);
    await catalogPage.expectLoaded();
    
    // Test in-stock filter
    await catalogPage.toggleInStock(true);
    await catalogPage.expectLoaded();
    
    // Test sort
    await catalogPage.setSort('price-asc');
    await catalogPage.expectLoaded();
    
    // Test view modes
    await catalogPage.setViewMode('list');
    await catalogPage.expectLoaded();
    
    await catalogPage.setViewMode('grid');
    await catalogPage.expectLoaded();
  });

  test('product-detail', async ({ page, catalogPage, productDetailPage, loginAsUser, testUser }) => {
    await loginAsUser(testUser.email, testUser.password);
    await catalogPage.goto();
    await catalogPage.expectLoaded();
    await catalogPage.expectProductsVisible(1);
    
    await catalogPage.clickProduct(0);
    await productDetailPage.expectLoaded();
    await productDetailPage.expectProductDetails();
  });

  test('cart-modal', async ({ page, catalogPage, loginAsUser, testUser }) => {
    await loginAsUser(testUser.email, testUser.password);
    await catalogPage.goto();
    await catalogPage.expectLoaded();
    await catalogPage.expectProductsVisible(1);
    
    // Add to cart
    await catalogPage.addProductToCart(0);
    
    // Open cart modal from navbar
    await page.getByTestId('cart-button').click();
    await page.waitForLoadState('networkidle');
    
    // Verify cart modal
    await expect(page.getByTestId('cart-modal')).toBeVisible();
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    
    // Update quantity
    await page.getByTestId('quantity-input').first().fill('3');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Remove item
    await page.getByTestId('remove-item-button').first().click();
    await page.waitForLoadState('networkidle');
    
    // Verify empty cart
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
    
    // Close modal
    await page.getByTestId('cart-close-button').click();
    
    // Navigate away and back - cart should persist
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('cart-button').click();
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
  });

  test('profile-tabs', async ({ page, profilePage, loginAsUser, testUser }) => {
    await loginAsUser(testUser.email, testUser.password);
    await profilePage.goto();
    await profilePage.expectLoaded();
    
    // Test each tab
    await profilePage.goToTab('quotes');
    await profilePage.expectQuotesVisible();
    
    await profilePage.goToTab('orders');
    await expect(page.getByTestId('orders-list')).toBeVisible();
    
    await profilePage.goToTab('invoices');
    await expect(page.getByTestId('invoices-list')).toBeVisible();
    
    await profilePage.goToTab('addresses');
    await profilePage.expectAddressesVisible();
    
    await profilePage.goToTab('password');
    await expect(page.getByTestId('change-password-form')).toBeVisible();
  });

  test('responsive-mobile', async ({ page, homePage, catalogPage, loginAsUser, testUser }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await homePage.goto();
    await homePage.expectLoaded();
    
    // Test mobile nav
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();
    
    // Test catalog on mobile
    await catalogPage.goto();
    await catalogPage.expectLoaded();
    
    // Filters should be collapsible
    await expect(catalogPage.filtersToggle).toBeVisible();
  });
});
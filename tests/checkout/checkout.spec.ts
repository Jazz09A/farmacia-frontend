import { test, expect } from '../fixtures';
import { createTestUser } from '../utils/testData';

test.describe('Quote Checkout Flow', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('checkout-complete-flow', async ({ 
    page, 
    homePage, 
    catalogPage, 
    productDetailPage, 
    cartPage, 
    checkoutQuotePage,
    loginAsUser,
    testUser 
  }) => {
    // Login first
    await loginAsUser(testUser.email, testUser.password);
    
    // Navigate to catalog
    await homePage.goToCatalog();
    await catalogPage.expectLoaded();
    
    // Search for a product
    await catalogPage.search('Paracetamol');
    await catalogPage.expectProductsVisible(1);
    
    // Click on first product
    await catalogPage.clickProduct(0);
    await productDetailPage.expectLoaded();
    
    // Add to cart
    await productDetailPage.addToCart(2);
    
    // Go to cart
    await page.goto('/cart');
    await cartPage.expectLoaded();
    await cartPage.expectItems(1);
    
    // Proceed to checkout
    await cartPage.proceedToCheckout();
    await checkoutQuotePage.expectLoaded();
    
    // Select address (assuming user has addresses)
    const addressCount = await checkoutQuotePage.addressOptions.count();
    if (addressCount > 0) {
      await checkoutQuotePage.selectAddress(0);
    }
    
    // Select payment term
    await checkoutQuotePage.selectPaymentTerm('CONTADO');
    
    // Select transport (if address selected)
    const transportOptions = await checkoutQuotePage.transportSelect.locator('option').count();
    if (transportOptions > 1) {
      await checkoutQuotePage.selectTransport('TRANS-001');
    }
    
    // Fill notes
    await checkoutQuotePage.fillNotes('Entregar en horario comercial');
    
    // Validate cart
    await checkoutQuotePage.validateCart();
    await checkoutQuotePage.expectValidationSuccess();
    
    // Submit quote
    await checkoutQuotePage.submitQuote();
    await checkoutQuotePage.expectRedirectToSuccess();
    
    // Verify success page
    await expect(page.getByTestId('quote-success')).toBeVisible();
  });

  test('checkout-empty-cart', async ({ page, checkoutQuotePage }) => {
    await checkoutQuotePage.goto();
    await checkoutQuotePage.expectEmptyCart();
    
    // Should show link to catalog
    await expect(page.getByRole('link', { name: 'Explorar productos' })).toBeVisible();
  });

  test('checkout-validation', async ({ 
    page, 
    checkoutQuotePage,
    loginAsUser,
    testUser 
  }) => {
    await loginAsUser(testUser.email, testUser.password);
    
    // Add a product to cart via localStorage to avoid full flow
    await page.evaluate(() => {
      localStorage.setItem('profitplus_quote_cart', JSON.stringify([{ co_art: 'TEST-001', cantidad: 1 }]));
      window.dispatchEvent(new CustomEvent('quoteCartUpdated'));
    });
    
    await checkoutQuotePage.goto();
    await checkoutQuotePage.expectLoaded();
    
    // Try to validate without address
    await checkoutQuotePage.validateCart();
    await checkoutQuotePage.expectValidationError('dirección');
    
    // Select address but not payment term
    const addressCount = await checkoutQuotePage.addressOptions.count();
    if (addressCount > 0) {
      await checkoutQuotePage.selectAddress(0);
      await checkoutQuotePage.validateCart();
      await checkoutQuotePage.expectValidationError('condición de pago');
    }
  });

  test('checkout-guest-redirect', async ({ page }) => {
    await page.goto('/checkout/quote');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe('Checkout Pagination Persistence', () => {
  test('checkout-pagination', async ({ 
    page, 
    catalogPage, 
    loginAsUser,
    testUser 
  }) => {
    await loginAsUser(testUser.email, testUser.password);
    await catalogPage.goto();
    await catalogPage.expectLoaded();
    
    // Go to page 2
    await catalogPage.goToPage(2);
    await catalogPage.expectLoaded();
    
    // Verify we're on page 2
    await expect(page).toHaveURL(/page=2/);
    
    // Add product from page 2
    await catalogPage.addProductToCart(0);
    
    // Go to checkout
    await page.goto('/checkout/quote');
    await page.waitForLoadState('networkidle');
    
    // Verify cart has the product
    await expect(page.getByTestId('quote-summary')).toBeVisible();
  });
});
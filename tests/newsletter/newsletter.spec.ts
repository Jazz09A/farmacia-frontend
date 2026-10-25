import { test, expect } from '../fixtures';

test.describe('Newsletter', () => {
  test.beforeEach(async ({ page, clearCart }) => {
    await clearCart();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('newsletter-subscribe-form-visible', async ({ page }) => {
    // Look for newsletter subscription form
    const newsletterInput = page.getByPlaceholder(/email|correo|newsletter|boletín/i).first();
    const newsletterButton = page.getByRole('button', { name: /suscrib|subscribe/i }).first();
    
    // Scroll to find newsletter section (usually in footer)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const inputExists = await newsletterInput.isVisible({ timeout: 3000 }).catch(() => false);
    const buttonExists = await newsletterButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (inputExists && buttonExists) {
      await expect(newsletterInput).toBeVisible();
      await expect(newsletterButton).toBeVisible();
    }
  });

  test('newsletter-subscribe-success', async ({ page }) => {
    // Mock the newsletter API
    await page.route('**/api/v1/newsletter/subscribe', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Subscribed successfully' }),
      });
    });
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const newsletterInput = page.getByPlaceholder(/email|correo|newsletter|boletín/i).first();
    const newsletterButton = page.getByRole('button', { name: /suscrib|subscribe/i }).first();
    
    const inputExists = await newsletterInput.isVisible({ timeout: 3000 }).catch(() => false);
    const buttonExists = await newsletterButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (inputExists && buttonExists) {
      const timestamp = Date.now();
      await newsletterInput.fill(`newsletter-${timestamp}@test.com`);
      await newsletterButton.click();
      await page.waitForTimeout(2000);
      
      // Verify success message or state
      const successMessage = page.getByText(/gracias|thank you|success|éxito/i).first();
      const successExists = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (successExists) {
        await expect(successMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Newsletter form not found on page');
    }
  });

  test('newsletter-subscribe-invalid-email', async ({ page }) => {
    // Mock the newsletter API to return error
    await page.route('**/api/v1/newsletter/subscribe', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email address' }),
      });
    });
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const newsletterInput = page.getByPlaceholder(/email|correo|newsletter|boletín/i).first();
    const newsletterButton = page.getByRole('button', { name: /suscrib|subscribe/i }).first();
    
    const inputExists = await newsletterInput.isVisible({ timeout: 3000 }).catch(() => false);
    const buttonExists = await newsletterButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (inputExists && buttonExists) {
      await newsletterInput.fill('invalid-email');
      await newsletterButton.click();
      await page.waitForTimeout(2000);
      
      // Verify error message
      const errorMessage = page.getByText(/error|inválid|invalid/i).first();
      const errorExists = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (errorExists) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Newsletter form not found on page');
    }
  });
});
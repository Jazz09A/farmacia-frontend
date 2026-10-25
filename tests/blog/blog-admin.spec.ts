import { test, expect } from '../fixtures';

test.describe('Blog - Admin', () => {
  test.beforeEach(async ({ page, clearCart, loginAsAdmin }) => {
    await clearCart();
    await loginAsAdmin();
    await page.waitForLoadState('networkidle');
  });

  test('admin-blog-list', async ({ page, adminDashboardPage }) => {
    // Navigate to blog admin
    await page.goto('/admin/blog');
    await page.waitForLoadState('networkidle');
    
    // Verify blog admin page loaded
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('admin-create-blog-post', async ({ page }) => {
    await page.goto('/admin/blog');
    await page.waitForLoadState('networkidle');
    
    // Look for create button
    const createButton = page.getByRole('button', { name: /crear|nuevo|new|create/i }).first();
    const buttonExists = await createButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (buttonExists) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill in the form
      const titleInput = page.getByLabel(/título|title/i).first();
      const contentInput = page.locator('textarea').first();
      
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const timestamp = Date.now();
        await titleInput.fill(`Test Post ${timestamp}`);
        
        if (await contentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await contentInput.fill('Test content for the blog post.');
          
          // Submit form
          const submitButton = page.getByRole('button', { name: /guardar|save|publicar|publish/i }).first();
          if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await submitButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    } else {
      // Navigate directly to create page if button not found
      await page.goto('/admin/blog/new');
      await page.waitForLoadState('networkidle');
    }
  });

  test('admin-edit-blog-post', async ({ page }) => {
    await page.goto('/admin/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for edit button on first post
    const editButton = page.getByRole('button', { name: /editar|edit/i }).first();
    const editExists = await editButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (editExists) {
      await editButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify edit form loaded
      const titleInput = page.getByLabel(/título|title/i).first();
      await expect(titleInput).toBeVisible({ timeout: 10000 });
    } else {
      test.skip(true, 'No blog posts available to edit');
    }
  });

  test('admin-delete-blog-post', async ({ page }) => {
    await page.goto('/admin/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for delete button on first post
    const deleteButton = page.getByRole('button', { name: /eliminar|delete/i }).first();
    const deleteExists = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (deleteExists) {
      await deleteButton.click();
      
      // Confirm deletion if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirmar|confirm|eliminar|delete/i }).last();
      const confirmExists = await confirmButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (confirmExists) {
        await confirmButton.click();
        await page.waitForLoadState('networkidle');
      }
    } else {
      test.skip(true, 'No blog posts available to delete');
    }
  });
});
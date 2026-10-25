import { test as base, type Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutQuotePage } from './pages/CheckoutQuotePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

type PageObjects = {
  homePage: HomePage;
  catalogPage: CatalogPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutQuotePage: CheckoutQuotePage;
  authPage: AuthPage;
  profilePage: ProfilePage;
  adminDashboardPage: AdminDashboardPage;
  adminProductsPage: AdminProductsPage;
  adminOrdersPage: AdminOrdersPage;
};

type TestFixtures = {
  // Auth helpers
  loginAsUser: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  registerUser: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  
  // Cart helpers
  clearCart: () => Promise<void>;
  addProductToCart: (productId: string, quantity?: number) => Promise<void>;
  
  // Test data
  testUser: RegisterUserData;
  adminUser: { email: string; password: string };

  // Synthetic auth header for flows that mock network routes (visual/a11y/errors)
  authHeaders: { Authorization: string };
};

interface RegisterUserData {
  email: string;
  password: string;
  companyName: string;
  ruc: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export const test = base.extend<PageObjects & TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutQuotePage: async ({ page }, use) => {
    await use(new CheckoutQuotePage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
  adminProductsPage: async ({ page }, use) => {
    await use(new AdminProductsPage(page));
  },
  adminOrdersPage: async ({ page }, use) => {
    await use(new AdminOrdersPage(page));
  },

  testUser: async ({}, use) => {
    const timestamp = Date.now();
    const userData: RegisterUserData = {
      email: `test-user-${timestamp}@example.com`,
      password: 'TestPass123!',
      companyName: `Farmacia Test ${timestamp}`,
      ruc: `J-${timestamp.toString().slice(-9)}`,
      phone: '0412-1234567',
      address: 'Av. Principal, Edificio Test',
      city: 'Caracas',
      state: 'Distrito Capital',
      postalCode: '1010',
      contactName: 'Juan Test',
      contactEmail: `contact-${timestamp}@example.com`,
      contactPhone: '0412-7654321',
    };
    await use(userData);
  },

  adminUser: async ({}, use) => {
    await use({
      email: process.env.ADMIN_EMAIL || 'admin@farmaplus.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
  },

  authHeaders: async ({}, use) => {
    // Token sintetico: suficiente para flows que mockean las APIs con page.route
    // (visual, a11y, errors). No pretende autenticar contra el backend real.
    await use({ Authorization: `Bearer e2e-synthetic-token-${Date.now()}` });
  },

  loginAsUser: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      // Try to login via API - MUST succeed, no fallback to mock
      const response = await page.request.post('/api/v1/auth/login', {
        data: { email, password },
      });
      
      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(`Login failed for ${email}: ${response.status()} - ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.token) {
        throw new Error(`Login response missing token for ${email}: ${JSON.stringify(data)}`);
      }
      
      await page.evaluate((token) => {
        localStorage.setItem('auth_token', token);
      }, data.token);
      
      if (data.user) {
        await page.evaluate((user) => {
          localStorage.setItem('user_data', JSON.stringify(user));
        }, data.user);
      }
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
  },

  loginAsAdmin: async ({ page, authPage }, use) => {
    await use(async () => {
      await authPage.goto();
      await authPage.login(
        process.env.ADMIN_EMAIL || 'admin@farmaplus.com',
        process.env.ADMIN_PASSWORD || 'admin123'
      );
      await page.waitForURL('/admin/dashboard');
      await page.waitForLoadState('networkidle');
    });
  },

  registerUser: async ({ page, authPage }, use) => {
    await use(async (userData: RegisterUserData) => {
      await authPage.goto({ mode: 'register' });
      await authPage.registerJuridico(userData);
      await page.waitForURL('/verify-account');
      await page.waitForLoadState('networkidle');
    });
  },

  logout: async ({ page }, use) => {
    await use(async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const userMenuButton = page.getByTestId('user-menu-button');
      if (await userMenuButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await userMenuButton.click();
        await page.getByTestId('logout-button').click();
        await page.waitForURL('/');
      }
      await clearCart(page);
    });
  },

  clearCart: async ({ page }, use) => {
    await use(async () => {
      await clearCart(page);
    });
  },

  addProductToCart: async ({ page }, use) => {
    await use(async (productId: string, quantity = 1) => {
      await page.goto(`/product/${productId}`);
      await page.waitForLoadState('networkidle');
      const addButton = page.getByTestId('add-to-cart-button');
      await addButton.waitFor({ state: 'visible' });
      for (let i = 0; i < quantity; i++) {
        await addButton.click();
        await page.waitForTimeout(300);
      }
    });
  },
});

async function clearCart(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.removeItem('profitplus_quote_cart');
      window.dispatchEvent(new CustomEvent('quoteCartUpdated'));
    });
  } catch {
    // Ignore if localStorage is not accessible yet
  }
}

export { expect } from '@playwright/test';
export type { RegisterUserData };
import { Page } from '@playwright/test';

export async function waitForAnimation(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const animations = document.getAnimations();
    return animations.every(animation => animation.playState === 'finished');
  }).catch(() => {
    // Ignore if getAnimations is not supported
  });
  await page.waitForTimeout(300);
}

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => document.readyState === 'complete');
  await page.waitForTimeout(500);
}

export async function clearLocalStorage(page: Page, keys?: string[]): Promise<void> {
  if (keys) {
    await page.evaluate((keys) => {
      keys.forEach(key => localStorage.removeItem(key));
    }, keys);
  } else {
    await page.evaluate(() => localStorage.clear());
  }
}

export async function setAuthToken(page: Page, token: string, userData?: any): Promise<void> {
  await page.evaluate(([token, userData]) => {
    localStorage.setItem('auth_token', token);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  }, [token, userData]);
}

export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('auth_token'));
}

export async function mockApiResponse(page: Page, url: string, response: any, status: number = 200): Promise<void> {
  await page.route(url, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

export async function generateRandomEmail(prefix: string = 'test'): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

export async function generateRandomRuc(): Promise<string> {
  const timestamp = Date.now().toString().slice(-9);
  return `J-${timestamp}`;
}

export interface TestProduct {
  id: string;
  name: string;
  price: string;
  brand: string;
  in_stock: boolean;
}

export async function createTestProduct(page: Page): Promise<TestProduct> {
  const timestamp = Date.now();
  return {
    id: `TEST-${timestamp}`,
    name: `Test Product ${timestamp}`,
    price: '100.00',
    brand: 'Test Brand',
    in_stock: true,
  };
}

export async function loginViaApi(page: Page, email: string, password: string): Promise<string | null> {
  const response = await page.request.post('/api/v1/auth/login', {
    data: { email, password },
  });
  if (response.ok()) {
    const data = await response.json();
    return data.token || null;
  }
  return null;
}

export async function registerViaApi(page: Page, userData: any): Promise<any> {
  const response = await page.request.post('/api/v1/auth/register/juridico', {
    data: userData,
  });
  if (response.ok()) {
    return await response.json();
  }
  return null;
}
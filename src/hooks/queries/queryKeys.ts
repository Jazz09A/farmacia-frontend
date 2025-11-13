import type { ProductSearchParams } from '../../services/ProductService';

export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: ProductSearchParams) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    slug: (slug: string) => [...queryKeys.products.details(), 'slug', slug] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    offers: () => [...queryKeys.products.all, 'offers'] as const,
    suggestions: (q: string) => [...queryKeys.products.all, 'suggestions', q] as const,
    recommendations: (id: string) => [...queryKeys.products.all, 'recommendations', id] as const,
  },
  exchangeRate: {
    current: ['exchangeRate', 'current'] as const,
  },
  auth: {
    user: ['auth', 'user'] as const,
    cart: ['auth', 'cart'] as const,
    cartWithDiscounts: ['auth', 'cart', 'discounts'] as const,
    quantityDiscountRoot: ['auth', 'cart', 'quantity-discount'] as const,
    quantityDiscount: (quantity: number) => ['auth', 'cart', 'quantity-discount', quantity] as const,
    orders: ['auth', 'orders'] as const,
    order: (id: string) => ['auth', 'orders', id] as const,
    addresses: ['auth', 'addresses'] as const,
  },
  admin: {
    dashboard: (timeRange: string = '7') => ['admin', 'dashboard', timeRange] as const,
    orders: (params: any) => ['admin', 'orders', params] as const,
    order: (id: string) => ['admin', 'order', id] as const,
    customers: ['admin', 'customers'] as const,
    customerStats: (userId: string) => ['admin', 'customers', userId, 'stats'] as const,
    analytics: (timeRange: string = 'month') => ['admin', 'analytics', timeRange] as const,
  },
  credit: {
    info: ['credit', 'info'] as const,
    dashboard: ['credit', 'dashboard'] as const,
    orders: (page: number, limit: number) => ['credit', 'orders', { page, limit }] as const,
    order: (id: string) => ['credit', 'orders', id] as const,
    orderPayments: (orderId: string) => ['credit', 'orders', orderId, 'payments'] as const,
    myPayments: ['credit', 'myPayments'] as const,
    pendingPayments: ['credit', 'pendingPayments'] as const,
    allPayments: (filters?: any) => ['credit', 'allPayments', filters || {}] as const,
    adminDashboard: ['credit', 'adminDashboard'] as const,
  },
  invoices: {
    summary: ['invoices', 'summary'] as const,
    list: (status?: 'pending' | 'paid' | 'all') => ['invoices', 'list', status || 'all'] as const,
    pending: ['invoices', 'pending'] as const,
    paid: ['invoices', 'paid'] as const,
    details: (invoiceNumber: string) => ['invoices', 'details', invoiceNumber] as const,
    payments: ['invoices', 'payments'] as const,
  },
  quotes: {
    list: (params: Record<string, any> = {}) => ['quotes', 'list', params] as const,
    detail: (quoteId: string) => ['quotes', 'detail', quoteId] as const,
    statuses: ['quotes', 'statuses'] as const,
  },
  flashOffers: {
    all: ['flashOffers'] as const,
    public: ['flashOffers', 'public'] as const,
    active: ['flashOffers', 'active'] as const,
    admin: (filters?: any) => ['flashOffers', 'admin', filters || {}] as const,
    detail: (id: string) => ['flashOffers', 'detail', id] as const,
  },
};

export type QueryKey = ReturnType<typeof queryKeys.products.list>;



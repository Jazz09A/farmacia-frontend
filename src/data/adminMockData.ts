// Mock data específico para el panel de administración

export interface AdminUser {
  id: string;
  user_type: 'natural' | 'juridico';
  email: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  last_login: string;
  total_orders: number;
  total_spent: number;
  // Para usuarios naturales
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  // Para usuarios jurídicos
  company_name?: string;
  rif?: string;
  company_phone?: string;
  company_address?: string;
  contact_person?: string;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    user_type: 'juridico',
    email: 'admin@farmaciasalud.com',
    status: 'active',
    created_at: '2024-01-15',
    last_login: '2024-03-10',
    total_orders: 45,
    total_spent: 125000,
    company_name: 'Farmacia Salud Total',
    rif: 'J-40123456-7',
    company_phone: '+58-212-1234567',
    company_address: 'Av. Libertador, Caracas',
    contact_person: 'María González'
  },
  {
    id: '2',
    user_type: 'natural',
    email: 'carlos.martinez@gmail.com',
    status: 'active',
    created_at: '2024-02-01',
    last_login: '2024-03-09',
    total_orders: 12,
    total_spent: 35000,
    first_name: 'Carlos',
    last_name: 'Martínez',
    phone: '+58-414-1234567',
    birth_date: '1985-08-15',
    address: 'Calle 123, Valencia'
  },
  {
    id: '3',
    user_type: 'juridico',
    email: 'info@farmavida.com',
    status: 'pending',
    created_at: '2024-03-01',
    last_login: '2024-03-08',
    total_orders: 3,
    total_spent: 15000,
    company_name: 'Farmacia Vida Nueva',
    rif: 'J-30987654-3',
    company_phone: '+58-251-9876543',
    company_address: 'Centro Comercial Plaza, Maracay',
    contact_person: 'Ana Rodríguez'
  },
  {
    id: '4',
    user_type: 'natural',
    email: 'lucia.fernandez@hotmail.com',
    status: 'inactive',
    created_at: '2023-11-20',
    last_login: '2024-01-15',
    total_orders: 8,
    total_spent: 22000,
    first_name: 'Lucía',
    last_name: 'Fernández',
    phone: '+58-426-7890123',
    birth_date: '1990-12-03',
    address: 'Urbanización El Rosal, Caracas'
  },
  {
    id: '5',
    user_type: 'juridico',
    email: 'contacto@farmaplus.com',
    status: 'active',
    created_at: '2023-08-10',
    last_login: '2024-03-11',
    total_orders: 67,
    total_spent: 189000,
    company_name: 'FarmaPlus C.A.',
    rif: 'J-12345678-9',
    company_phone: '+58-212-9876543',
    company_address: 'Centro Comercial Sambil, Caracas',
    contact_person: 'Roberto Silva'
  }
];

export interface ProductStats {
  product_id: string;
  views_last_30_days: number;
  sales_last_30_days: number;
  revenue_last_30_days: number;
  conversion_rate: number;
  avg_rating: number;
  stock_movements: number;
  last_updated: string;
}

export const mockProductStats: ProductStats[] = [
  {
    product_id: '1',
    views_last_30_days: 450,
    sales_last_30_days: 23,
    revenue_last_30_days: 34500,
    conversion_rate: 5.1,
    avg_rating: 4.5,
    stock_movements: 45,
    last_updated: '2024-03-10'
  },
  {
    product_id: '2',
    views_last_30_days: 320,
    sales_last_30_days: 18,
    revenue_last_30_days: 27000,
    conversion_rate: 5.6,
    avg_rating: 4.3,
    stock_movements: 32,
    last_updated: '2024-03-09'
  },
  {
    product_id: '3',
    views_last_30_days: 280,
    sales_last_30_days: 15,
    revenue_last_30_days: 22500,
    conversion_rate: 5.4,
    avg_rating: 4.7,
    stock_movements: 28,
    last_updated: '2024-03-08'
  }
];

export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  products_sold: number;
  page_views: number;
  unique_visitors: number;
  conversion_rate: number;
  avg_order_value: number;
  bounce_rate: number;
  avg_session_duration: number; // en segundos
}

export const mockAnalyticsData: AnalyticsData[] = [
  {
    date: '2024-01-01',
    revenue: 150000,
    orders: 245,
    customers: 89,
    products_sold: 567,
    page_views: 12450,
    unique_visitors: 3420,
    conversion_rate: 3.2,
    avg_order_value: 612,
    bounce_rate: 45.2,
    avg_session_duration: 285
  },
  {
    date: '2024-02-01',
    revenue: 180000,
    orders: 298,
    customers: 112,
    products_sold: 698,
    page_views: 15230,
    unique_visitors: 4150,
    conversion_rate: 3.8,
    avg_order_value: 604,
    bounce_rate: 42.1,
    avg_session_duration: 310
  },
  {
    date: '2024-03-01',
    revenue: 220000,
    orders: 356,
    customers: 145,
    products_sold: 823,
    page_views: 18650,
    unique_visitors: 5280,
    conversion_rate: 4.1,
    avg_order_value: 618,
    bounce_rate: 38.9,
    avg_session_duration: 342
  }
];

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales_count: number;
  revenue: number;
  growth_percentage: number;
  profit_margin: number;
}

export const mockTopProducts: TopProduct[] = [
  {
    id: '1',
    name: 'Ibuprofeno 600mg',
    category: 'Analgésicos',
    sales_count: 156,
    revenue: 23400,
    growth_percentage: 15.2,
    profit_margin: 28.5
  },
  {
    id: '2',
    name: 'Vitamina D3 5000UI',
    category: 'Vitaminas',
    sales_count: 134,
    revenue: 20100,
    growth_percentage: 8.7,
    profit_margin: 45.2
  },
  {
    id: '3',
    name: 'Omeprazol 20mg',
    category: 'Digestivos',
    sales_count: 98,
    revenue: 14700,
    growth_percentage: -2.3,
    profit_margin: 32.1
  },
  {
    id: '4',
    name: 'Acetaminofén 500mg',
    category: 'Analgésicos',
    sales_count: 87,
    revenue: 13050,
    growth_percentage: 12.1,
    profit_margin: 25.8
  },
  {
    id: '5',
    name: 'Complejo B',
    category: 'Vitaminas',
    sales_count: 76,
    revenue: 11400,
    growth_percentage: 5.4,
    profit_margin: 38.9
  }
];

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  conversion_rate: number;
  avg_session_duration: number;
  bounce_rate: number;
}

export const mockTrafficSources: TrafficSource[] = [
  {
    source: 'Búsqueda Orgánica',
    visitors: 2456,
    percentage: 42.3,
    conversion_rate: 4.2,
    avg_session_duration: 375,
    bounce_rate: 35.2
  },
  {
    source: 'Directo',
    visitors: 1789,
    percentage: 30.8,
    conversion_rate: 6.1,
    avg_session_duration: 425,
    bounce_rate: 28.7
  },
  {
    source: 'Redes Sociales',
    visitors: 892,
    percentage: 15.4,
    conversion_rate: 2.8,
    avg_session_duration: 245,
    bounce_rate: 52.3
  },
  {
    source: 'Email Marketing',
    visitors: 445,
    percentage: 7.7,
    conversion_rate: 8.9,
    avg_session_duration: 485,
    bounce_rate: 22.1
  },
  {
    source: 'Publicidad Pagada',
    visitors: 223,
    percentage: 3.8,
    conversion_rate: 5.3,
    avg_session_duration: 320,
    bounce_rate: 41.2
  }
];

export interface DashboardMetrics {
  total_revenue_today: number;
  total_orders_today: number;
  active_users_now: number;
  conversion_rate_today: number;
  avg_order_value_today: number;
  popular_categories_today: string[];
  recent_activities: {
    type: 'order' | 'registration' | 'product_view' | 'blog_post';
    description: string;
    timestamp: string;
    user_info?: string;
  }[];
}

export const mockDashboardMetrics: DashboardMetrics = {
  total_revenue_today: 18500,
  total_orders_today: 12,
  active_users_now: 47,
  conversion_rate_today: 4.8,
  avg_order_value_today: 1542,
  popular_categories_today: ['Analgésicos', 'Vitaminas', 'Digestivos'],
  recent_activities: [
    {
      type: 'order',
      description: 'Nueva orden completada',
      timestamp: '2024-03-11T14:30:00Z',
      user_info: 'Farmacia Salud Total'
    },
    {
      type: 'registration',
      description: 'Nuevo cliente registrado',
      timestamp: '2024-03-11T14:15:00Z',
      user_info: 'Pedro Ramírez'
    },
    {
      type: 'product_view',
      description: 'Producto más visto: Ibuprofeno 600mg',
      timestamp: '2024-03-11T14:00:00Z'
    },
    {
      type: 'blog_post',
      description: 'Nuevo artículo publicado',
      timestamp: '2024-03-11T13:45:00Z'
    }
  ]
}; 
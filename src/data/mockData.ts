import { Product, FlashOffer, Brand, Order, User } from '../types';

// Categorías médicas expandidas
export const medicalCategories = [
  {
    id: 'medicamentos-rx',
    name: 'Medicamentos con Receta',
    description: 'Medicamentos que requieren prescripción médica',
    icon: 'Pill',
    color: 'red',
    count: 245
  },
  {
    id: 'medicamentos-otc',
    name: 'Medicamentos Sin Receta',
    description: 'Medicamentos de venta libre',
    icon: 'Heart',
    color: 'blue',
    count: 567
  },
  {
    id: 'vitaminas-suplementos',
    name: 'Vitaminas y Suplementos',
    description: 'Complementos nutricionales y vitamínicos',
    icon: 'Sparkles',
    color: 'green',
    count: 189
  },
  {
    id: 'cuidado-personal',
    name: 'Cuidado Personal',
    description: 'Productos de higiene y cuidado',
    icon: 'Shield',
    color: 'purple',
    count: 123
  },
  {
    id: 'dermocosmetica',
    name: 'Dermocosmética',
    description: 'Productos dermatológicos y cosméticos',
    icon: 'Sparkles',
    color: 'pink',
    count: 98
  },
  {
    id: 'material-medico',
    name: 'Material Médico',
    description: 'Equipos y material sanitario',
    icon: 'Stethoscope',
    color: 'indigo',
    count: 76
  }
];

// Patologías médicas
export const medicalConditions = [
  'Diabetes',
  'Hipertensión',
  'Problemas Digestivos',
  'Dolor y Inflamación',
  'Infecciones',
  'Alergias',
  'Problemas Respiratorios',
  'Salud Mental',
  'Salud Cardiovascular',
  'Problemas Dermatológicos'
];

// Productos expandidos
export const mockProducts: Product[] = [
  // Medicamentos con Receta
  {
    id: '1',
    name: 'Metformina 850mg',
    brand: 'Merck',
    category: 'medicamentos-rx',
    subcategory: 'Antidiabéticos',
    patology: 'Diabetes',
    priceVES: 25000,
    priceREF: 0.68,
    description: 'Medicamento antidiabético para el control de la glucosa en sangre. Ayuda a controlar los niveles de azúcar en pacientes con diabetes tipo 2.',
    ingredients: ['Metformina Clorhidrato 850mg'],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    ],
    inStock: true,
    stock: 150,
    prescription: true,
    rating: 4.7,
    reviews: 89,
    isOffer: false,
    featured: true,
    dosage: '850mg',
    presentation: 'Comprimidos',
    laboratorio: 'Merck & Co.',
    registroSanitario: 'INVIMA 2023M-001234',
    contraindicaciones: 'Hipersensibilidad al principio activo, insuficiencia renal severa',
    efectosSecundarios: 'Náuseas, diarrea, dolor abdominal'
  },
  {
    id: '2',
    name: 'Atorvastatina 20mg',
    brand: 'Pfizer',
    category: 'medicamentos-rx',
    subcategory: 'Hipolipemiantes',
    patology: 'Salud Cardiovascular',
    priceVES: 35000,
    priceREF: 0.96,
    description: 'Estatina para reducir el colesterol y prevenir enfermedades cardiovasculares.',
    ingredients: ['Atorvastatina Cálcica 20mg'],
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    images: [
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
    ],
    inStock: true,
    stock: 200,
    prescription: true,
    rating: 4.5,
    reviews: 156,
    dosage: '20mg',
    presentation: 'Comprimidos recubiertos',
    laboratorio: 'Pfizer Inc.',
    registroSanitario: 'INVIMA 2023M-001235'
  },

  // Medicamentos Sin Receta (OTC)
  {
    id: '3',
    name: 'Acetaminofén 500mg',
    brand: 'Farmatodo',
    category: 'medicamentos-otc',
    subcategory: 'Analgésicos',
    patology: 'Dolor y Inflamación',
    priceVES: 15000,
    priceREF: 0.41,
    description: 'Analgésico y antipirético para el alivio del dolor leve a moderado y la reducción de la fiebre.',
    ingredients: ['Acetaminofén 500mg'],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    ],
    inStock: true,
    stock: 500,
    prescription: false,
    rating: 4.5,
    reviews: 128,
    isOffer: true,
    originalPrice: 18000,
    dosage: '500mg',
    presentation: 'Comprimidos',
    laboratorio: 'Farmatodo',
    registroSanitario: 'INVIMA 2023M-001236'
  },
  {
    id: '4',
    name: 'Ibuprofeno 400mg',
    brand: 'Bayer',
    category: 'medicamentos-otc',
    subcategory: 'Antiinflamatorios',
    patology: 'Dolor y Inflamación',
    priceVES: 22000,
    priceREF: 0.60,
    description: 'Antiinflamatorio no esteroideo para el tratamiento del dolor e inflamación.',
    ingredients: ['Ibuprofeno 400mg'],
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    images: [
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400'
    ],
    inStock: true,
    stock: 300,
    prescription: false,
    rating: 4.3,
    reviews: 67,
    dosage: '400mg',
    presentation: 'Comprimidos recubiertos',
    laboratorio: 'Bayer AG',
    registroSanitario: 'INVIMA 2023M-001237'
  },

  // Vitaminas y Suplementos
  {
    id: '5',
    name: 'Vitamina D3 1000 UI',
    brand: 'Nature Made',
    category: 'vitaminas-suplementos',
    subcategory: 'Vitaminas',
    patology: 'Deficiencias Nutricionales',
    priceVES: 45000,
    priceREF: 1.23,
    description: 'Suplemento vitamínico para fortalecer huesos y sistema inmune. Ayuda en la absorción de calcio.',
    ingredients: ['Colecalciferol (Vitamina D3) 1000 UI'],
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',
    images: [
      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400'
    ],
    inStock: true,
    stock: 150,
    prescription: false,
    rating: 4.8,
    reviews: 85,
    dosage: '1000 UI',
    presentation: 'Cápsulas blandas',
    laboratorio: 'Nature Made',
    registroSanitario: 'INVIMA 2023S-001238'
  },
  {
    id: '6',
    name: 'Complejo B Multivitamínico',
    brand: 'Centrum',
    category: 'vitaminas-suplementos',
    subcategory: 'Complejos vitamínicos',
    patology: 'Deficiencias Nutricionales',
    priceVES: 38000,
    priceREF: 1.04,
    description: 'Complejo vitamínico B para energía y metabolismo. Contiene todas las vitaminas del complejo B.',
    ingredients: ['Tiamina, Riboflavina, Niacina, B6, B12, Ácido Fólico, Biotina'],
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    images: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    ],
    inStock: false,
    stock: 0,
    prescription: false,
    rating: 4.6,
    reviews: 94,
    dosage: 'Multivitamínico',
    presentation: 'Comprimidos',
    laboratorio: 'Centrum',
    registroSanitario: 'INVIMA 2023S-001239'
  },

  // Cuidado Personal
  {
    id: '7',
    name: 'Protector Solar FPS 50+',
    brand: 'La Roche Posay',
    category: 'cuidado-personal',
    subcategory: 'Protección Solar',
    patology: 'Protección Dermatológica',
    priceVES: 95000,
    priceREF: 2.60,
    description: 'Protección solar avanzada de amplio espectro para toda la familia. Resistente al agua.',
    ingredients: ['Óxido de Zinc, Dióxido de Titanio, Octinoxato'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
    ],
    inStock: true,
    stock: 75,
    prescription: false,
    rating: 4.9,
    reviews: 156,
    isOffer: true,
    originalPrice: 110000,
    dosage: 'FPS 50+',
    presentation: 'Loción 60ml',
    laboratorio: 'La Roche Posay',
    registroSanitario: 'INVIMA 2023C-001240'
  },

  // Dermocosmética
  {
    id: '8',
    name: 'Crema Hidratante Facial',
    brand: 'Eucerin',
    category: 'dermocosmetica',
    subcategory: 'Hidratación',
    patology: 'Problemas Dermatológicos',
    priceVES: 65000,
    priceREF: 1.78,
    description: 'Crema hidratante para piel sensible con ácido hialurónico y urea.',
    ingredients: ['Ácido Hialurónico, Urea, Ceramidas'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
    ],
    inStock: true,
    stock: 120,
    prescription: false,
    rating: 4.7,
    reviews: 203,
    dosage: 'Uso tópico',
    presentation: 'Crema 50ml',
    laboratorio: 'Eucerin',
    registroSanitario: 'INVIMA 2023C-001241'
  },

  // Material Médico
  {
    id: '9',
    name: 'Tensiómetro Digital',
    brand: 'Omron',
    category: 'material-medico',
    subcategory: 'Equipos de Medición',
    patology: 'Hipertensión',
    priceVES: 250000,
    priceREF: 6.85,
    description: 'Tensiómetro digital automático para medición precisa de la presión arterial.',
    ingredients: ['Dispositivo electrónico'],
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    images: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    ],
    inStock: true,
    stock: 25,
    prescription: false,
    rating: 4.8,
    reviews: 45,
    featured: true,
    dosage: 'N/A',
    presentation: 'Equipo médico',
    laboratorio: 'Omron Healthcare',
    registroSanitario: 'INVIMA 2023E-001242'
  },

  // Más productos...
  {
    id: '10',
    name: 'Jarabe para la Tos',
    brand: 'Robitussin',
    category: 'medicamentos-otc',
    subcategory: 'Expectorantes',
    patology: 'Problemas Respiratorios',
    priceVES: 28000,
    priceREF: 0.77,
    description: 'Jarabe expectorante para el alivio de la tos con flemas y congestión bronquial.',
    ingredients: ['Guaifenesina 100mg/5ml'],
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    images: [
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400'
    ],
    inStock: true,
    stock: 80,
    prescription: false,
    rating: 4.4,
    reviews: 73,
    dosage: '5ml cada 4 horas',
    presentation: 'Jarabe 120ml',
    laboratorio: 'Robitussin',
    registroSanitario: 'INVIMA 2023M-001243'
  }
];

export const mockBrands: Brand[] = [
  { id: '1', name: 'Bayer', logo: '/logo/Logo.webp', featured: true },
  { id: '2', name: 'Pfizer', logo: '/logo/Logo.webp', featured: true },
  { id: '3', name: 'Johnson & Johnson', logo: '/logo/Logo.webp', featured: true },
  { id: '4', name: 'Novartis', logo: '/logo/Logo.webp', featured: true },
  { id: '5', name: 'GSK', logo: '/logo/Logo.webp', featured: true },
  { id: '6', name: 'Roche', logo: '/logo/Logo.webp', featured: true },
  { id: '7', name: 'Merck', logo: '/logo/Logo.webp', featured: true },
  { id: '8', name: 'La Roche Posay', logo: '/logo/Logo.webp', featured: true },
  { id: '9', name: 'Eucerin', logo: '/logo/Logo.webp', featured: true },
  { id: '10', name: 'Omron', logo: '/logo/Logo.webp', featured: true }
];

export const mockFlashOffers: FlashOffer[] = [
  {
    id: '1',
    productId: '3', // Acetaminofén
    discount: 17,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    active: true
  },
  {
    id: '2',
    productId: '7', // Protector Solar
    discount: 14,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    active: true
  }
];

// Datos para el carrito y checkout
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedPresentation?: string;
}

// Métodos de pago venezolanos
export const paymentMethods = [
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'Banesco, Mercantil, Venezuela, Provincial',
    icon: 'CreditCard',
    available: true,
    currencies: ['VES', 'REF']
  },
  {
    id: 'mobile-payment',
    name: 'Pago Móvil',
    description: 'C2P Banesco, Mercantil, Provincial',
    icon: 'Smartphone',
    available: true,
    currencies: ['VES']
  },
  {
    id: 'zelle',
    name: 'Zelle',
    description: 'Pago internacional en USD',
    icon: 'DollarSign',
    available: true,
    currencies: ['REF']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pago seguro internacional',
    icon: 'CreditCard',
    available: true,
    currencies: ['REF']
  }
];

// Zonas de envío
export const shippingZones = [
  {
    id: 'caracas',
    name: 'Caracas y Área Metropolitana',
    price: 0, // Envío gratis
    estimatedDays: '24-48 horas',
    available: true
  },
  {
    id: 'miranda',
    name: 'Estado Miranda',
    price: 15000,
    estimatedDays: '2-3 días',
    available: true
  },
  {
    id: 'vargas',
    name: 'Estado Vargas',
    price: 20000,
    estimatedDays: '2-4 días',
    available: true
  },
  {
    id: 'nacional',
    name: 'Resto del País',
    price: 35000,
    estimatedDays: '3-7 días',
    available: true
  }
];



// Reviews y testimonios
export const mockReviews = [
  {
    id: '1',
    productId: '1',
    userId: '101',
    userName: 'María González',
    rating: 5,
    comment: 'Excelente medicamento, muy efectivo para controlar la diabetes. Lo recomiendo totalmente.',
    date: new Date('2024-01-15'),
    verified: true
  },
  {
    id: '2',
    productId: '3',
    userId: '102',
    userName: 'Carlos Rodríguez',
    rating: 4,
    comment: 'Muy buen analgésico, actúa rápido. El precio es competitivo.',
    date: new Date('2024-01-10'),
    verified: true
  },
  {
    id: '3',
    productId: '7',
    userId: '103',
    userName: 'Ana Martínez',
    rating: 5,
    comment: 'El mejor protector solar que he usado. No deja residuo blanco y protege muy bien.',
    date: new Date('2024-01-08'),
    verified: true
  }
];

// Mock Orders para el CRM
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-123',
    items: [
      {
        id: '1',
        product: mockProducts[0], // Metformina
        quantity: 2,
        selectedPresentation: 'Comprimidos'
      },
      {
        id: '3', 
        product: mockProducts[2], // Acetaminofén
        quantity: 1,
        selectedPresentation: 'Comprimidos'
      }
    ],
    subtotal: 65000,
    shipping: 5000,
    taxes: 3250,
    total: 73250,
    currency: 'VES',
    status: 'pending',
    paymentMethod: 'Pago Móvil',
    shippingAddress: {
      street: 'Av. Libertador 123',
      city: 'Caracas',
      state: 'Distrito Capital',
      zipCode: '1010',
      country: 'Venezuela',
      instructions: 'Apartamento 4B'
    },
    trackingNumber: 'TRK-001-2024',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T14:20:00Z'),
    estimatedDelivery: new Date('2024-01-18T18:00:00Z')
  },
  {
    id: 'ORD-002',
    userId: 'user-456',
    items: [
      {
        id: '2',
        product: mockProducts[1], // Atorvastatina
        quantity: 1,
        selectedPresentation: 'Comprimidos recubiertos'
      }
    ],
    subtotal: 35000,
    shipping: 5000,
    taxes: 1750,
    total: 41750,
    currency: 'VES',
    status: 'processing',
    paymentMethod: 'Zelle',
    shippingAddress: {
      street: 'Calle 52 con Av. 3E',
      city: 'Maracaibo',
      state: 'Zulia',
      zipCode: '4001',
      country: 'Venezuela'
    },
    trackingNumber: 'TRK-002-2024',
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-15T09:10:00Z'),
    estimatedDelivery: new Date('2024-01-19T18:00:00Z')
  },
  {
    id: 'ORD-003',
    userId: 'user-789',
    items: [
      {
        id: '5',
        product: mockProducts[4], // Vitamina D3
        quantity: 3,
        selectedPresentation: 'Cápsulas'
      },
      {
        id: '4',
        product: mockProducts[3], // Ibuprofeno
        quantity: 2,
        selectedPresentation: 'Comprimidos recubiertos'
      }
    ],
    subtotal: 179000,
    shipping: 8000,
    taxes: 8950,
    total: 195950,
    currency: 'VES',
    status: 'shipped',
    paymentMethod: 'Transferencia Bancaria',
    shippingAddress: {
      street: 'Urbanización La Trinidad, Calle 4',
      city: 'Valencia',
      state: 'Carabobo',
      zipCode: '2001',
      country: 'Venezuela',
      instructions: 'Casa blanca con portón negro'
    },
    trackingNumber: 'TRK-003-2024',
    createdAt: new Date('2024-01-12T08:20:00Z'),
    updatedAt: new Date('2024-01-13T16:30:00Z'),
    estimatedDelivery: new Date('2024-01-16T18:00:00Z')
  },
  {
    id: 'ORD-004',
    userId: 'user-321',
    items: [
      {
        id: '1',
        product: mockProducts[0], // Metformina
        quantity: 1,
        selectedPresentation: 'Comprimidos'
      }
    ],
    subtotal: 25000,
    shipping: 5000,
    taxes: 1250,
    total: 31250,
    currency: 'VES',
    status: 'delivered',
    paymentMethod: 'Efectivo',
    shippingAddress: {
      street: 'Av. Universidad, Edificio Centro',
      city: 'Barquisimeto',
      state: 'Lara',
      zipCode: '3001',
      country: 'Venezuela',
      instructions: 'Piso 3, oficina 302'
    },
    trackingNumber: 'TRK-004-2024',
    createdAt: new Date('2024-01-10T11:15:00Z'),
    updatedAt: new Date('2024-01-12T17:45:00Z'),
    estimatedDelivery: new Date('2024-01-14T18:00:00Z')
  },
  {
    id: 'ORD-005',
    userId: 'user-654',
    items: [
      {
        id: '3',
        product: mockProducts[2], // Acetaminofén
        quantity: 4,
        selectedPresentation: 'Comprimidos'
      },
      {
        id: '4',
        product: mockProducts[3], // Ibuprofeno
        quantity: 1,
        selectedPresentation: 'Comprimidos recubiertos'
      }
    ],
    subtotal: 82000,
    shipping: 5000,
    taxes: 4100,
    total: 91100,
    currency: 'VES',
    status: 'cancelled',
    paymentMethod: 'PayPal',
    shippingAddress: {
      street: 'Sector La Candelaria, Calle 12',
      city: 'Mérida',
      state: 'Mérida',
      zipCode: '5101',
      country: 'Venezuela'
    },
    createdAt: new Date('2024-01-08T14:30:00Z'),
    updatedAt: new Date('2024-01-09T10:15:00Z')
  }
];

// Estados de pedidos para el CRM
export const orderStatuses = [
  { id: 'pending', name: 'Pendiente', color: 'yellow', description: 'Pedido recibido, pendiente de procesamiento' },
  { id: 'processing', name: 'Procesando', color: 'blue', description: 'Pedido en proceso de preparación' },
  { id: 'shipped', name: 'Enviado', color: 'purple', description: 'Pedido enviado, en tránsito' },
  { id: 'delivered', name: 'Entregado', color: 'green', description: 'Pedido entregado exitosamente' },
  { id: 'cancelled', name: 'Cancelado', color: 'red', description: 'Pedido cancelado' }
];

// Usuarios mock para el CRM
export const mockUsers: User[] = [
  {
    id: 'user-123',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    type: 'natural',
    phone: '+58 414 123 4567',
    address: {
      street: 'Av. Libertador 123',
      city: 'Caracas',
      state: 'Distrito Capital',
      zipCode: '1010',
      country: 'Venezuela'
    },
    preferences: {
      currency: 'VES',
      notifications: {
        email: true,
        sms: true,
        offers: true,
        reminders: false
      },
      medicalConditions: ['Diabetes']
    },
    createdAt: new Date('2023-08-15T10:00:00Z')
  },
  {
    id: 'user-456', 
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    type: 'juridico',
    phone: '+58 261 987 6543',
    address: {
      street: 'Calle 52 con Av. 3E',
      city: 'Maracaibo',
      state: 'Zulia',
      zipCode: '4001',
      country: 'Venezuela'
    },
    preferences: {
      currency: 'VES',
      notifications: {
        email: true,
        sms: false,
        offers: true,
        reminders: true
      },
      medicalConditions: ['Hipertensión']
    },
    createdAt: new Date('2023-10-22T14:30:00Z')
  },
  {
    id: 'user-789',
    name: 'Ana López',
    email: 'ana.lopez@gmail.com', 
    type: 'natural',
    phone: '+58 241 555 0123',
    address: {
      street: 'Urbanización La Trinidad, Calle 4',
      city: 'Valencia',
      state: 'Carabobo',
      zipCode: '2001',
      country: 'Venezuela'
    },
    preferences: {
      currency: 'VES',
      notifications: {
        email: true,
        sms: true,
        offers: false,
        reminders: true
      }
    },
    createdAt: new Date('2023-12-03T09:15:00Z')
  }
];
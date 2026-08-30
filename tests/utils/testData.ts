import { RegisterUserData } from '../fixtures';

export function createTestUser(overrides: Partial<RegisterUserData> = {}): RegisterUserData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  return {
    email: `test-${timestamp}-${random}@example.com`,
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
    ...overrides,
  };
}

export function createAdminUser() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@farmaplus.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };
}

export const testProducts = [
  { id: 'PROD-001', name: 'Paracetamol 500mg', price: '5.50', brand: 'Genfar', inStock: true },
  { id: 'PROD-002', name: 'Ibuprofeno 400mg', price: '8.75', brand: 'MK', inStock: true },
  { id: 'PROD-003', name: 'Amoxicilina 500mg', price: '15.00', brand: 'Bago', inStock: false },
  { id: 'PROD-004', name: 'Vitamina C 1000mg', price: '12.50', brand: 'Redoxon', inStock: true },
  { id: 'PROD-005', name: 'Omeprazol 20mg', price: '22.00', brand: 'AstraZeneca', inStock: true },
];

export const testAddresses = [
  {
    id: 'ADDR-001',
    label: 'Farmacia Principal',
    recipientName: 'Juan Pérez',
    street: 'Av. Principal 123',
    city: 'Caracas',
    state: 'Distrito Capital',
    postalCode: '1010',
    phone: '0412-1234567',
  },
  {
    id: 'ADDR-002',
    label: 'Sucursal Centro',
    recipientName: 'María González',
    street: 'Calle 5, Edificio Centro',
    city: 'Caracas',
    state: 'Distrito Capital',
    postalCode: '1011',
    phone: '0414-7654321',
  },
];

export const paymentTerms = [
  { code: 'CONTADO', label: 'Contado' },
  { code: 'CREDITO_30', label: 'Crédito 30 días' },
  { code: 'CREDITO_60', label: 'Crédito 60 días' },
  { code: 'CREDITO_90', label: 'Crédito 90 días' },
];

export const transportOptions = [
  { code: 'TRANS-001', label: 'Transporte Terrestre Estándar' },
  { code: 'TRANS-002', label: 'Transporte Aéreo Express' },
  { code: 'TRANS-003', label: 'Retiro en Sucursal' },
];
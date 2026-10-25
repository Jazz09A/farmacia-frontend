import { PaymentMethod } from '../types';

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pago-movil',
    name: 'Pago Móvil',
    description: 'pago en Bs. ',
    icon: '',
    available: true,
    currencies: ['VES'],
    data: 'Cédula: 1234567890\nTeléfono: 04123456789\nBanco: Banco de Venezuela',
  },
  {
    id: 'zelle',
    name: 'Zelle',
    description: 'Datos para pago en USD.',
    icon: '',
    available: true,
    currencies: ['USD'],
    data: 'Correo: zelle@zelle.com',
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    description: 'Paga al recibir tu pedido.',
    icon: '',
    available: true,
    currencies: ['VES', 'USD'],
  },
];

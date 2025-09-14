# Sistema de Crédito - Frontend

Este directorio contiene todos los componentes, hooks, servicios y utilidades relacionados con el sistema de crédito de la aplicación farmacéutica.

## 📁 Estructura del Directorio

```
src/components/Credit/
├── __tests__/                 # Tests unitarios
│   ├── CreditInfoCard.test.tsx
│   └── PaymentForm.test.tsx
├── CreditInfoCard.tsx         # Tarjeta de información de crédito
├── CreditOrderForm.tsx        # Formulario para crear órdenes con crédito
├── PaymentForm.tsx            # Formulario para realizar pagos parciales
├── PaymentHistory.tsx         # Historial de pagos de una orden
├── CreditDashboard.tsx        # Dashboard principal de crédito
├── AdminPaymentApproval.tsx   # Aprobación de pagos (Admin)
├── AdminCreditDashboard.tsx   # Dashboard de administración
├── CreditAssignmentModal.tsx  # Modal para asignar crédito (Admin)
├── index.ts                   # Exportaciones
└── README.md                  # Este archivo
```

## 🚀 Componentes Principales

### Para Usuarios

#### CreditInfoCard
Muestra la información actual del crédito del usuario:
- Crédito disponible
- Límite de crédito
- Estado del crédito
- Porcentaje de uso

```tsx
<CreditInfoCard 
  onRefresh={() => console.log('Refreshing...')}
  showDetails={true}
  className="custom-class"
/>
```

#### CreditOrderForm
Formulario para crear órdenes utilizando crédito:
- Selección de dirección de envío
- Configuración de días de pago
- Notas adicionales
- Validación de crédito disponible

```tsx
<CreditOrderForm
  cartItems={cartItems}
  cartTotal={500}
  onOrderCreated={(result) => console.log(result)}
  onCancel={() => setShowForm(false)}
/>
```

#### PaymentForm
Formulario para realizar pagos parciales:
- Monto del pago
- Referencia del pago
- Subida de captura
- Validación de montos

```tsx
<PaymentForm
  orderId="order_123"
  orderTotal={500}
  creditRemaining={300}
  onPaymentCreated={(payment) => console.log(payment)}
  onCancel={() => setShowForm(false)}
/>
```

#### PaymentHistory
Muestra el historial de pagos de una orden específica:
- Lista de pagos realizados
- Estados de aprobación
- Fechas y montos
- Capturas de pago

```tsx
<PaymentHistory orderId="order_123" />
```

#### CreditDashboard
Dashboard completo del sistema de crédito:
- Resumen de crédito
- Estadísticas de órdenes
- Estado de pagos
- Información general

```tsx
<CreditDashboard />
```

### Para Administradores

#### AdminPaymentApproval
Interfaz para aprobar/rechazar pagos:
- Lista de pagos pendientes
- Visualización de capturas
- Acciones de aprobación
- Notas del administrador

```tsx
<AdminPaymentApproval />
```

#### AdminCreditDashboard
Dashboard de administración:
- Estadísticas generales
- Pagos pendientes
- Órdenes afectadas
- Acciones rápidas

```tsx
<AdminCreditDashboard />
```

#### CreditAssignmentModal
Modal para asignar crédito a usuarios:
- Selección de usuario
- Monto a asignar
- Validaciones
- Confirmación

```tsx
<CreditAssignmentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  userId="user_123"
  userName="Farmacia ABC"
/>
```

## 🔧 Hooks Personalizados

### useCreditOrder
Maneja la creación de órdenes con crédito:
```tsx
const {
  createOrder,
  validateOrderData,
  clearValidationErrors,
  getFieldError,
  loading,
  error,
  validationErrors
} = useCreditOrder();
```

### usePayment
Maneja operaciones de pago:
```tsx
const {
  createPayment,
  uploadCaptureFile,
  getPayments,
  validatePaymentData,
  formatAmount,
  getMaxAmount,
  loading,
  error
} = usePayment();
```

### useCreditValidation
Validaciones del sistema de crédito:
```tsx
const {
  validateCreditAvailability,
  canMakePurchase,
  getCreditUsagePercentage,
  getCreditStatusInfo,
  canCreateCreditOrder
} = useCreditValidation();
```

### useAdminCredit
Operaciones de administración:
```tsx
const {
  getPendingPayments,
  approvePayment,
  rejectPayment,
  assignCredit,
  getAdminDashboard,
  loading,
  error
} = useAdminCredit();
```

## 🌐 Servicios

### CreditService
Servicio principal para comunicación con la API:
```tsx
// Obtener información de crédito
const creditInfo = await CreditService.getCreditInfo();

// Crear orden con crédito
const order = await CreditService.createCreditOrder(orderData);

// Crear pago
const payment = await CreditService.createPayment(paymentData);

// Validar disponibilidad
const isAvailable = await CreditService.validateCreditAvailability(amount);
```

## 📊 Contexto

### CreditContext
Contexto global para el estado del sistema de crédito:
```tsx
const {
  creditInfo,
  dashboardData,
  payments,
  loading,
  error,
  refreshCreditInfo,
  refreshDashboard,
  createCreditOrder,
  createPayment,
  getOrderPayments
} = useCredit();
```

## 🎨 Estilos

Los estilos están definidos en `src/styles/credit.css` e incluyen:
- Diseño responsivo
- Modo oscuro
- Animaciones suaves
- Estados de carga y error
- Componentes consistentes

## 🧪 Testing

Los tests están ubicados en `__tests__/` y cubren:
- Renderizado de componentes
- Interacciones del usuario
- Validaciones
- Estados de error
- Integración con hooks

Para ejecutar los tests:
```bash
npm test src/components/Credit
```

## 🔗 Integración

### Con Checkout
El sistema se integra automáticamente con el checkout existente:
- Opción de pago con crédito
- Validación de disponibilidad
- Formulario modal
- Confirmación de orden

### Con Carrito
- Validación de crédito en tiempo real
- Cálculo de totales
- Verificación de límites

### Con Administración
- Dashboard de administración
- Aprobación de pagos
- Asignación de crédito
- Reportes y estadísticas

## 📱 Responsive Design

Todos los componentes son completamente responsivos:
- Mobile-first approach
- Breakpoints optimizados
- Touch-friendly interfaces
- Adaptación automática

## ♿ Accesibilidad

- Navegación por teclado
- Screen readers
- Contraste adecuado
- Labels descriptivos
- Estados de error claros

## 🚀 Uso Rápido

1. **Importar el contexto** en tu aplicación:
```tsx
import { CreditProvider } from './contexts/CreditContext';

function App() {
  return (
    <CreditProvider>
      {/* Tu aplicación */}
    </CreditProvider>
  );
}
```

2. **Usar componentes** donde necesites:
```tsx
import { CreditInfoCard, CreditDashboard } from './components/Credit';

function MyPage() {
  return (
    <div>
      <CreditInfoCard />
      <CreditDashboard />
    </div>
  );
}
```

3. **Usar hooks** para lógica personalizada:
```tsx
import { useCredit, useCreditValidation } from './hooks';

function MyComponent() {
  const { creditInfo } = useCredit();
  const { canMakePurchase } = useCreditValidation();
  
  // Tu lógica aquí
}
```

## 🔧 Configuración

### Variables de Entorno
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Configuración de Crédito
```tsx
import { CREDIT_CONFIG } from './config/creditConfig';

// Personalizar configuración
CREDIT_CONFIG.VALIDATION_RULES.MIN_PAYMENT_AMOUNT = 0.01;
```

## 📈 Optimizaciones

- Lazy loading de componentes
- Memoización de cálculos
- Debounce en validaciones
- Cache de datos
- Optimización de re-renders

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de autenticación**: Verificar que el token esté presente
2. **Crédito insuficiente**: Validar disponibilidad antes de crear orden
3. **Archivo no sube**: Verificar tamaño y tipo de archivo
4. **Estado no actualiza**: Verificar que el contexto esté configurado

### Logs de Debug
```tsx
// Habilitar logs en desarrollo
localStorage.setItem('debug', 'credit:*');
```

## 📚 Documentación Adicional

- [API Documentation](./API.md)
- [Component Props](./PROPS.md)
- [Styling Guide](./STYLING.md)
- [Testing Guide](./TESTING.md)


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Receipt, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Info,
  CreditCard,
  Hash,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useCredit } from '../../contexts/CreditContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import ImageUploader from '../common/ImageUploader';
import { paymentMethods } from '../../config/paymentMethods';
import { getPaymentMethodCurrency, formatVES, formatUSD } from '../../utils/currencyUtils';

interface EnhancedPaymentFormProps {
  orderId: string;
  orderTotal: number; // Total en VES
  orderTotalRef?: number; // Total en USD/REF
  creditRemaining: number | string; // Deuda pendiente en USD/REF (puede venir como string del backend)
  orderNumber: string;
  exchangeRate: number;
  onPaymentCreated: () => void;
  onCancel?: () => void;
}

interface PaymentFormData {
  amount: number;
  paymentReference: string;
  paymentCaptureUrl: string;
  paymentMethod: string;
  notes: string;
  bankName?: string;
}

interface ValidationErrors {
  amount?: string;
  paymentReference?: string;
  paymentCaptureUrl?: string;
  bankName?: string;
}

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  active: boolean;
}

const availablePaymentMethods = paymentMethods.filter(
  method => method.id !== 'credito' && method.id !== 'efectivo'
);


export const EnhancedPaymentForm: React.FC<EnhancedPaymentFormProps> = ({
  orderId,
  orderTotal,
  orderTotalRef,
  creditRemaining,
  orderNumber,
  exchangeRate,
  onPaymentCreated,
  onCancel
}) => {
  const { createPayment } = useCredit();
  const { currency, formatPrice } = useGlobalCurrency();
  
  // Calcular la deuda pendiente del pedido
  const pendingDebt = useMemo(() => {
    // La deuda pendiente es la diferencia entre el total de la orden y lo que ya se ha pagado
    // creditRemaining representa lo que queda por pagar de esta orden específica
    const debt = typeof creditRemaining === 'string' 
      ? parseFloat(creditRemaining) 
      : creditRemaining || 0;
    return isNaN(debt) ? 0 : debt;
  }, [creditRemaining]);

  // Obtener el total de la orden en la moneda correcta según el contexto
  const orderTotalInCurrentCurrency = useMemo(() => {
    // Mostrar los valores como vienen del API sin conversión innecesaria
    const totalNum = typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal;
    const totalRefNum = typeof orderTotalRef === 'string' ? parseFloat(orderTotalRef) : orderTotalRef;
    switch (currency) {
      case 'VES':
        return totalNum;
      case 'USD':
        return typeof totalRefNum === 'number' && !isNaN(totalRefNum) ? totalRefNum : totalNum;
      default:
        return totalNum;
    }
  }, [orderTotal, orderTotalRef, currency]);

  // Obtener la deuda pendiente en la moneda correcta según el contexto
  const creditRemainingInCurrentCurrency = useMemo(() => {
    // Convertir creditRemaining a número si viene como string (API devuelve string)
    const creditRemainingNum = typeof creditRemaining === 'string'
      ? parseFloat(creditRemaining)
      : (typeof creditRemaining === 'number' ? creditRemaining : 0);

    const rate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate as unknown as string) : exchangeRate;

    switch (currency) {
      case 'VES':
        return creditRemainingNum * (Number.isFinite(rate) ? rate : 1);
      case 'USD':
        return creditRemainingNum;
      default:
        return creditRemainingNum;
    }
  }, [creditRemaining, currency, orderId, orderNumber, exchangeRate]);

  const [formData, setFormData] = useState<PaymentFormData>(() => ({
    amount: pendingDebt,
    paymentReference: '',
    paymentCaptureUrl: '',
    paymentMethod: availablePaymentMethods[0]?.id || 'pago-movil',
    notes: '',
    bankName: ''
  }));

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pasos del formulario
  const steps: PaymentStep[] = useMemo(() => [
    {
      id: 1,
      title: 'Detalles del Pago',
      description: 'Ingresa el monto y referencia',
      icon: DollarSign,
      completed: false,
      active: currentStep === 1
    },
    {
      id: 2,
      title: 'Comprobante',
      description: 'Sube la imagen del comprobante',
      icon: Receipt,
      completed: false,
      active: currentStep === 2
    },
    {
      id: 3,
      title: 'Confirmación',
      description: 'Revisa y envía el pago',
      icon: CheckCircle,
      completed: false,
      active: currentStep === 3
    }
  ], [currentStep]);

  // Obtener la moneda del método de pago seleccionado
  const paymentCurrency = useMemo(() => {
    return getPaymentMethodCurrency(formData.paymentMethod);
  }, [formData.paymentMethod]);

  // Helpers en USD (backend entrega credit_remaining en USD/REF y total_ref en USD)
  const pendingDebtUsd = useMemo(() => {
    const cr = typeof creditRemaining === 'string' ? parseFloat(creditRemaining) : Number(creditRemaining || 0);
    return Number.isFinite(cr) ? cr : 0;
  }, [creditRemaining]);

  const orderTotalUsd = useMemo(() => {
    const totalRefNum = typeof orderTotalRef === 'string' ? parseFloat(orderTotalRef) : (orderTotalRef ?? NaN);
    const totalVesNum = typeof orderTotal === 'string' ? parseFloat(orderTotal) : Number(orderTotal || 0);
    const rate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate as unknown as string) : exchangeRate;
    if (Number.isFinite(totalRefNum)) return totalRefNum as number;
    // Fallback: calcular USD desde VES si falta total_ref
    return Number.isFinite(totalVesNum) && Number.isFinite(rate) && rate > 0 ? totalVesNum / (rate as number) : 0;
  }, [orderTotalRef, orderTotal, exchangeRate]);

  // Mostrar equivalente en VES para métodos en moneda nacional
  const vesEquivalent = useMemo(() => {
    const rate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate as unknown as string) : exchangeRate;
    return (Number(formData.amount) || 0) * (Number.isFinite(rate) ? (rate as number) : 1);
  }, [formData.amount, exchangeRate]);

  // Sincronizar el monto mostrado con el método de pago seleccionado
  // REMOVER: ya no sincronizamos el valor con la moneda del método de pago; el input siempre es USD
  // useEffect(() => { setFormData(prev => ({ ...prev, amount: pendingDebtInPaymentCurrency })); }, [...])

  // Validación en tiempo real
  const validateField = useCallback((field: keyof PaymentFormData, value: any): string | undefined => {
    switch (field) {
      case 'amount':
        if (!value || value <= 0 || isNaN(value)) {
          return 'El monto debe ser mayor a 0';
        }
        
        // Validar contra límites en USD, porque el input es USD
        const valueUsd = Number(value);
        if (!valueUsd || valueUsd <= 0 || isNaN(valueUsd)) {
          return 'El monto debe ser mayor a 0';
        }

        if (valueUsd > pendingDebtUsd) {
          return `El monto no puede exceder la deuda pendiente (${formatUSD(pendingDebtUsd)})`;
        }

        if (valueUsd > orderTotalUsd) {
          return `El monto no puede exceder el total de la orden (${formatUSD(orderTotalUsd)})`;
        }
        return undefined;
      
      case 'paymentReference': {
        const ref = (value || '').toString().trim();
        if (!ref) {
          return 'La referencia es obligatoria';
        }
        // Requiere al menos 8 dígitos (últimos 8 o más)
        const digitsCount = ref.replace(/\D/g, '').length;
        if (digitsCount < 8) {
          return 'Incluye al menos los últimos 8 dígitos de la referencia';
        }
        if (ref.length > 80) {
          return 'La referencia no puede exceder 80 caracteres';
        }
        return undefined;
      }

      case 'bankName': {
        const bank = (value || '').toString().trim();
        if (!bank) {
          return 'El banco es obligatorio';
        }
        if (bank.length < 3) {
          return 'El nombre del banco debe tener al menos 3 caracteres';
        }
        if (bank.length > 60) {
          return 'El nombre del banco no puede exceder 60 caracteres';
        }
        return undefined;
      }
      
      case 'paymentCaptureUrl':
        if (!value || value.trim() === '') {
          return 'Debes subir un comprobante de pago';
        }
        return undefined;
      
      default:
        return undefined;
    }
  }, [pendingDebtUsd, orderTotalUsd, formatUSD]);

  // Validar formulario completo
  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (['amount', 'paymentReference', 'paymentCaptureUrl'].includes(key)) {
        const field = key as keyof PaymentFormData;
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field as keyof ValidationErrors] = error;
        }
      }
    });

    return errors;
  }, [formData, validateField]);

  // Actualizar validación cuando cambian los datos
  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
  }, [validateForm]);

  // Manejar cambio en los campos
  const handleFieldChange = useCallback((field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError(null);
  }, []);

  // Manejar cambio específico para el campo de monto
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Si el campo está vacío, establecer en la deuda pendiente
    if (value === '' || value === null || value === undefined) {
      handleFieldChange('amount', pendingDebt);
      return;
    }
    
    // Convertir a número, si es NaN usar la deuda pendiente
    const numericValue = parseFloat(value);
    const finalValue = isNaN(numericValue) ? pendingDebt : numericValue;
    
    // Asegurar que el valor no sea NaN
    const safeValue = isNaN(finalValue) ? pendingDebt : finalValue;
    handleFieldChange('amount', safeValue);
  }, [handleFieldChange, pendingDebt]);

  // Manejar focus en el campo de monto (permitir edición libre)
  const handleAmountFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // No limpiar el campo, permitir que el usuario edite el valor actual
    e.target.select(); // Seleccionar todo el texto para facilitar la edición
  }, []);

  // Manejar blur en el campo de monto (restaurar deuda pendiente si está vacío)
  const handleAmountBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '' || e.target.value === null) {
      handleFieldChange('amount', pendingDebt);
    }
  }, [handleFieldChange, pendingDebt]);

  // Manejar subida de imagen
  const handleImageUploaded = useCallback((imageUrl: string) => {
    handleFieldChange('paymentCaptureUrl', imageUrl);
  }, [handleFieldChange]);

  // Manejar error de imagen
  const handleImageError = useCallback((error: string) => {
    setValidationErrors(prev => ({ ...prev, paymentCaptureUrl: error }));
  }, []);

  // Verificar si el paso actual es válido
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !validateField('amount', formData.amount);
      case 2:
        return !validateField('paymentCaptureUrl', formData.paymentCaptureUrl)
          && !validateField('paymentReference', formData.paymentReference)
          && !validateField('bankName', formData.bankName);
      case 3:
        return Object.keys(validateForm()).length === 0;
      default:
        return false;
    }
  }, [formData, validateField, validateForm]);

  // Navegar entre pasos
  const goToStep = useCallback((step: number) => {
    if (step < currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    }
  }, [currentStep, isStepValid]);

  const nextStep = useCallback(() => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, isStepValid]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Enviar pago
  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createPayment({
        order_id: orderId,
        amount: (paymentCurrency === 'VES'
          ? (Number(formData.amount) * (typeof exchangeRate === 'string' ? parseFloat(exchangeRate as unknown as string) : exchangeRate || 1))
          : Number(formData.amount)
        ).toString(),
        payment_currency: paymentCurrency, // Renombrado según guía
        payment_method: formData.paymentMethod, // Enviar el método de pago seleccionado
        payment_reference: `${(formData.bankName || '').trim()} ${formData.paymentReference}`.trim(),
        payment_capture_url: formData.paymentCaptureUrl
      }, new File([], '')); // El archivo ya se subió a Cloudinary

      setShowSuccess(true);
      setTimeout(() => {
        onPaymentCreated();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, orderId, createPayment, onPaymentCreated, validateForm, paymentCurrency, exchangeRate]);

  // Formatear moneda usando el contexto global
  const formatCurrency = (amount: number) => formatPrice(amount, currency);

  // Función para obtener el total de la orden en la moneda del contexto global
  const getOrderTotalInCurrentCurrency = () => {
    return orderTotalInCurrentCurrency;
  };

  // Renderizar indicador de pasos
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <motion.div
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300 ${
              step.active
                ? 'bg-blue-500 border-blue-500 text-white'
                : step.completed || currentStep > step.id
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
            onClick={() => goToStep(step.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step.completed || currentStep > step.id ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <step.icon className="w-6 h-6" />
            )}
          </motion.div>
          
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
              currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Renderizar paso 1: Detalles del pago
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Información de la orden */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Información de la Orden
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Número de Orden:</span>
            <span className="font-medium text-gray-800">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total de la Orden:</span>
            <span className="font-bold text-gray-800">{formatCurrency(getOrderTotalInCurrentCurrency())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deuda Pendiente:</span>
            <span className="font-bold text-red-600">{formatCurrency(creditRemainingInCurrentCurrency)}</span>
          </div>
        </div>
        
        {/* Información adicional sobre pagos */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Información:</strong> Estás pagando la deuda pendiente de esta orden. 
            Puedes pagar el monto completo o realizar un pago parcial.
          </p>
        </div>
      </div>

      {/* Monto a pagar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto a Pagar *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={formData.amount}
            onChange={handleAmountChange}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            max={Math.min(pendingDebt || 0, getOrderTotalInCurrentCurrency())}
            min={0.01}
            step={0.01}
            className={`w-full pl-10 pr-14 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={formatUSD(pendingDebtUsd)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">USD</span>
          </div>
        </div>
        {validationErrors.amount && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.amount}
          </p>
        )}
        {/* Equivalente de moneda para ayudar al usuario */}
        {paymentCurrency === 'VES' && (
          <p className="mt-2 text-xs text-gray-500">
            Pagas en VES: {formatVES(vesEquivalent)} (tasa {typeof exchangeRate === 'string' ? exchangeRate : exchangeRate.toString()} VES/USD)
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => handleFieldChange('amount', pendingDebt)}
            className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
          >
            Deuda Completa
          </button>
          <button
            type="button"
            onClick={() => handleFieldChange('amount', pendingDebt / 2)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            50% de la Deuda
          </button>
          <button
            type="button"
            onClick={() => handleFieldChange('amount', pendingDebt / 4)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            25% de la Deuda
          </button>
        </div>
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availablePaymentMethods.map(method => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar datos del método de pago seleccionado */}
      <AnimatePresence>
        {formData.paymentMethod && availablePaymentMethods.find(p => p.id === formData.paymentMethod)?.data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-6 p-4 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 rounded-xl border border-medical-primary/20">
              <h3 className="text-lg font-semibold mb-3 text-medical-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Datos para el pago
              </h3>
              <div className="bg-white/80 p-3 rounded-lg">
                <p className="text-sm font-mono text-gray-700 whitespace-pre-line">
                  {availablePaymentMethods.find(p => p.id === formData.paymentMethod)?.data}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Renderizar paso 2: Comprobante
  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Sube tu Comprobante de Pago
        </h3>
        <p className="text-gray-600">
          Sube una imagen clara del comprobante para verificar tu pago
        </p>
      </div>

      <ImageUploader
        onImageUploaded={handleImageUploaded}
        onError={handleImageError}
        currentImageUrl={formData.paymentCaptureUrl}
      />

      {validationErrors.paymentCaptureUrl && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationErrors.paymentCaptureUrl}</p>
        </div>
      )}

      {/* Referencia del pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referencia del Pago *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={formData.paymentReference}
            onChange={(e) => handleFieldChange('paymentReference', e.target.value)}
            maxLength={80}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.paymentReference ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Ej: 12345678"
          />
        </div>
        {validationErrors.paymentReference && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.paymentReference}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">Incluye los últimos 8 dígitos (o más) de la referencia.</p>
      </div>

      {/* Banco emisor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banco Emisor *
        </label>
        <input
          type="text"
          value={formData.bankName || ''}
          onChange={(e) => handleFieldChange('bankName', e.target.value)}
          maxLength={60}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            validationErrors.bankName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Ej: Banco Provincial"
        />
        {validationErrors.bankName && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.bankName}
          </p>
        )}
      </div>

      {/* Notas adicionales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Adicionales (Opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={3}
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Información adicional sobre el pago..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.notes.length}/200 caracteres
        </p>
      </div>
    </motion.div>
  );

  // Renderizar paso 3: Confirmación
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Confirma tu Pago
        </h3>
        <p className="text-gray-600">
          Revisa los detalles antes de enviar
        </p>
      </div>

      {/* Resumen del pago */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Resumen del Pago</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Orden:</span>
            <span className="font-medium">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total de la Orden:</span>
            <span className="font-medium text-gray-800">{formatCurrency(getOrderTotalInCurrentCurrency())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monto a Pagar:</span>
            <span className="font-bold text-green-600">{formatCurrency(formData.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Referencia:</span>
            <span className="font-mono text-sm">{formData.paymentReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Método:</span>
            <span className="capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Comprobante preview */}
      {formData.paymentCaptureUrl && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Comprobante</h4>
          <img
            src={formData.paymentCaptureUrl}
            alt="Comprobante de pago"
            className="w-full max-w-md mx-auto h-64 object-cover rounded-lg border border-gray-300"
          />
        </div>
      )}

      {/* Error de envío */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error al procesar el pago</p>
            <p className="text-sm text-red-700 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      {/* Información importante */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Información Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tu pago será revisado por nuestro equipo</li>
              <li>Recibirás una notificación una vez aprobado</li>
              <li>El proceso puede tomar de 1 a 24 horas</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Mostrar pantalla de éxito
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Enviado!</h2>
        <p className="text-gray-600 mb-6">
          Tu pago ha sido registrado exitosamente y está siendo procesado
        </p>
        <div className="flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Indicador de pasos */}
      {renderStepIndicator()}

      {/* Contenido del paso actual */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </AnimatePresence>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Anterior
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(3)}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Pago
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentForm;
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

interface EnhancedPaymentFormProps {
  orderId: string;
  orderTotal: number; // Total en VES
  orderTotalRef?: number; // Total en USD/REF
  creditRemaining: number; // Deuda pendiente en USD/REF
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
}

interface ValidationErrors {
  amount?: string;
  paymentReference?: string;
  paymentCaptureUrl?: string;
}

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  active: boolean;
}

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
    const debt = creditRemaining || 0;
    return isNaN(debt) ? 0 : debt;
  }, [creditRemaining]);

  const [formData, setFormData] = useState<PaymentFormData>(() => ({
    amount: pendingDebt,
    paymentReference: '',
    paymentCaptureUrl: '',
    paymentMethod: 'transfer',
    notes: ''
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

  // Validación en tiempo real
  const validateField = useCallback((field: keyof PaymentFormData, value: any): string | undefined => {
    switch (field) {
      case 'amount':
        if (!value || value <= 0 || isNaN(value)) {
          return 'El monto debe ser mayor a 0';
        }
        if (value > pendingDebt) {
          return `El monto no puede exceder la deuda pendiente (${formatCurrency(pendingDebt)})`;
        }
        if (value > getOrderTotalInCurrentCurrency()) {
          return `El monto no puede exceder el total de la orden (${formatCurrency(getOrderTotalInCurrentCurrency())})`;
        }
        return undefined;
      
      case 'paymentReference':
        if (!value || value.trim().length < 3) {
          return 'La referencia debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 50) {
          return 'La referencia no puede exceder 50 caracteres';
        }
        return undefined;
      
      case 'paymentCaptureUrl':
        if (!value || value.trim() === '') {
          return 'Debes subir un comprobante de pago';
        }
        return undefined;
      
      default:
        return undefined;
    }
  }, [pendingDebt, orderTotal]);

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
        return !validateField('amount', formData.amount) && 
               !validateField('paymentReference', formData.paymentReference);
      case 2:
        return !validateField('paymentCaptureUrl', formData.paymentCaptureUrl);
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
        amount: formData.amount,
        payment_reference: formData.paymentReference,
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
  }, [formData, orderId, createPayment, onPaymentCreated, validateForm]);

  // Formatear moneda usando el contexto global
  const formatCurrency = (amount: number) => formatPrice(amount, currency);

  // Función para obtener el total de la orden en la moneda actual
  const getOrderTotalInCurrentCurrency = () => {
    switch (currency) {
      case 'VES':
        return orderTotal || 0;
      case 'USD':
      case 'REF':
        if (orderTotalRef !== undefined && orderTotalRef !== null) {
          return orderTotalRef;
        }
        const convertedTotal = (orderTotal || 0) / (exchangeRate || 1);
        return isNaN(convertedTotal) ? 0 : convertedTotal;
      default:
        return orderTotal || 0;
    }
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
            <span className="font-bold text-red-600">{formatCurrency(pendingDebt)}</span>
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
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={formatCurrency(pendingDebt)}
          />
        </div>
        {validationErrors.amount && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.amount}
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
            maxLength={50}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.paymentReference ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Ej: REF123456789, Transferencia-001"
          />
        </div>
        {validationErrors.paymentReference && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.paymentReference}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ingresa el número de referencia de tu transferencia o pago
        </p>
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
          <option value="transfer">Transferencia Bancaria</option>
          <option value="mobile_payment">Pago Móvil</option>
          <option value="zelle">Zelle</option>
          <option value="paypal">PayPal</option>
          <option value="other">Otro</option>
        </select>
      </div>
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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Paperclip, Send, ArrowRightLeft } from 'lucide-react';
import { useCredit } from '../../contexts/CreditContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Currency, PaymentFormData } from '../../types/credit';
import { formatVES, formatUSD, convertVesToUsd, convertUsdToVes, getPaymentMethodCurrency } from '../../utils/currencyUtils';
import { validatePaymentForm, normalizeFormData, getFieldError, validatePaymentAmount } from '../../utils/creditValidation';
import { paymentMethods } from '../../config/paymentMethods';

interface PaymentFormProps {
  orderId: string;
  orderTotal: number; // total en VES
  orderTotalRef?: number; // total_ref en USD
  creditRemaining: number | string; // credit_remaining en USD (puede venir como string del backend)
  exchangeRate?: string;
  onPaymentCreated: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ 
  orderId, 
  orderTotal, 
  orderTotalRef,
  creditRemaining, 
  exchangeRate = '1.0',
  onPaymentCreated 
}) => {
  // La deuda pendiente es lo que queda por pagar de esta orden
  const pendingDebt = creditRemaining;
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: creditRemaining.toString(),
    currency: 'VES',
    payment_method: 'pago-movil',
    payment_reference: '',
    payment_capture_url: ''
  });
  const [paymentCapture, setPaymentCapture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { createPayment } = useCredit();
  const { currency, formatPrice } = useGlobalCurrency();

  // Formatear moneda usando el contexto global
  const formatCurrency = (amount: number) => formatPrice(amount, currency);

  // Obtener el total de la orden en la moneda correcta según el contexto
  const orderTotalInCurrentCurrency = useMemo(() => {
    // Mostrar los valores como vienen del API sin conversión
    switch (currency) {
      case 'VES':
        return orderTotal;
      case 'USD':
        return orderTotalRef || orderTotal;
      default:
        return orderTotal;
    }
  }, [orderTotal, orderTotalRef, currency]);

  // Obtener la deuda pendiente en la moneda correcta según el contexto
  const creditRemainingInCurrentCurrency = useMemo(() => {
    // Convertir creditRemaining a número si viene como string
    const creditRemainingNum = typeof creditRemaining === 'string' 
      ? parseFloat(creditRemaining) 
      : creditRemaining;
    
    // Mostrar los valores como vienen del API sin conversión
    return creditRemainingNum;
  }, [creditRemaining, currency]);

  // Calcular conversión de moneda
  const getConvertedAmount = (amount: string, fromCurrency: Currency, toCurrency: Currency): string => {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'VES' && toCurrency === 'USD') {
      return convertVesToUsd(amount, exchangeRate);
    }
    
    if (fromCurrency === 'USD' && toCurrency === 'VES') {
      return convertUsdToVes(amount, exchangeRate);
    }
    
    return amount;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentCapture(e.target.files[0]);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Si cambia la moneda, convertir el monto
      if (field === 'currency') {
        const convertedAmount = getConvertedAmount(prev.amount, prev.currency as Currency, value as Currency);
        updated.amount = convertedAmount;
      }
      
      return updated;
    });
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange('amount', value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    handleInputChange('currency', newCurrency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalizar datos del formulario
    const normalizedData = normalizeFormData(formData);
    
    // Validar formulario
    const validation = validatePaymentForm(normalizedData);
    
    if (!validation.isValid) {
      const errorMap: { [key: string]: string } = {};
      validation.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    // Validar monto contra deuda pendiente usando la moneda correcta
    const paymentCurrency = getPaymentMethodCurrency(formData.payment_method || 'pago-movil');
    const pendingDebtInPaymentCurrency = creditRemaining;
    
    const paymentValidation = validatePaymentAmount(
      formData.amount,
      pendingDebtInPaymentCurrency.toString(),
      formData.payment_method || 'pago-movil',
      paymentCurrency
    );
    
    if (!paymentValidation.isValid) {
      const errorMap: { [key: string]: string } = {};
      paymentValidation.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Determinar la moneda correcta según el método de pago
      const paymentCurrency = getPaymentMethodCurrency(formData.payment_method || 'pago-movil');
      
      await createPayment({
        order_id: orderId,
        amount: normalizedData.amount,
        payment_currency: paymentCurrency, // Renombrado según guía
        payment_method: formData.payment_method, // Enviar el método de pago seleccionado
        payment_reference: normalizedData.payment_reference,
        payment_capture_url: normalizedData.payment_capture_url
      }, paymentCapture);
      onPaymentCreated();
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Ocurrió un error al crear el pago'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-4 rounded-lg text-center"
        >
          {errors.general}
        </motion.div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total de la Orden:</span>
          <span className="font-bold text-gray-800">{formatCurrency(orderTotalInCurrentCurrency)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Deuda Pendiente:</span>
          <span className="font-bold text-red-600">{formatCurrency(creditRemainingInCurrentCurrency)}</span>
        </div>
        {exchangeRate && exchangeRate !== '1.0' && (
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>Tasa de cambio:</span>
            <span>{exchangeRate} VES/USD</span>
          </div>
        )}
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
          <p className="text-xs text-amber-800">
            💡 Estás pagando la deuda pendiente de esta orden
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              step="0.01"
              min="0"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
          <select
            id="currency"
            value={formData.currency}
            onChange={handleCurrencyChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.currency ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="VES">VES (Bolívares)</option>
            <option value="USD">USD (Dólares)</option>
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
          )}
        </div>

        <div>
          <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
          <select
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => handleInputChange('payment_method', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.payment_method ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {paymentMethods.filter(method => method.id !== 'credito' && method.id !== 'efectivo').map(method => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
          )}
        </div>
      </div>

      {/* Mostrar conversión de moneda */}
      {formData.amount && formData.currency && (
        <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Equivalente en:</span>
              <div className="flex items-center gap-2">
                {formData.currency === 'VES' ? (
                  <>
                    <span className="font-medium">{formatUSD(convertVesToUsd(formData.amount, exchangeRate))}</span>
                    <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">USD</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{formatVES(convertUsdToVes(formData.amount, exchangeRate))}</span>
                    <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">VES</span>
                  </>
                )}
              </div>
            </div>
        </div>
      )}

      <div>
        <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 mb-2">Referencia del Pago</label>
        <input
          type="text"
          id="paymentReference"
          value={formData.payment_reference}
          onChange={(e) => handleInputChange('payment_reference', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            errors.payment_reference ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ej: Transferencia-001234"
          required
        />
        {errors.payment_reference && (
          <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de Pago</label>
        
        {/* Campo de URL opcional */}
        <div className="mb-4">
          <label htmlFor="paymentCaptureUrl" className="block text-sm text-gray-600 mb-1">
            URL del comprobante (opcional)
          </label>
          <input
            type="url"
            id="paymentCaptureUrl"
            value={formData.payment_capture_url}
            onChange={(e) => handleInputChange('payment_capture_url', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              errors.payment_capture_url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://ejemplo.com/comprobante.jpg"
          />
          {errors.payment_capture_url && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_capture_url}</p>
          )}
        </div>

        {/* Subida de archivo */}
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Sube un archivo</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
              <p className="pl-1">o arrástralo aquí</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF hasta 10MB</p>
            {paymentCapture && <p className="text-sm text-green-600">Archivo seleccionado: {paymentCapture.name}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
          Enviar Pago
        </motion.button>
      </div>
    </form>
  );
};
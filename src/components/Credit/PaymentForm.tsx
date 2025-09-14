import React, { useState, useRef } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { PaymentFormData } from '../../types/credit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PaymentFormProps {
  orderId: string;
  orderTotal: number;
  creditRemaining: number;
  onPaymentCreated: (payment: any) => void;
  onCancel: () => void;
  className?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  orderTotal,
  creditRemaining,
  onPaymentCreated,
  onCancel,
  className = ''
}) => {
  const { 
    createPayment, 
    uploadCaptureFile, 
    loading, 
    error, 
    getFieldError, 
    clearValidationErrors,
    formatAmount,
    getMaxAmount,
    uploadingFile
  } = usePayment();

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    payment_reference: '',
    payment_capture_url: ''
  });

  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxAmount = getMaxAmount(creditRemaining);

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (getFieldError(field)) {
      clearValidationErrors();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadCaptureFile(file);
      setFormData(prev => ({ ...prev, payment_capture_url: url }));
      setCaptureFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      // El error se maneja en el hook
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const paymentData = {
        order_id: orderId,
        ...formData
      };

      const payment = await createPayment(paymentData, creditRemaining);
      onPaymentCreated(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, payment_capture_url: '' }));
    setCaptureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`payment-form bg-white rounded-lg p-6 shadow-lg ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          💳 Realizar Pago Parcial
        </h3>
        <p className="text-gray-600">
          Complete los datos para registrar su pago parcial
        </p>
      </div>

      {/* Información de la orden */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">Información de la Orden</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total de la Orden:</span>
            <span className="font-semibold">{formatAmount(orderTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Saldo Pendiente:</span>
            <span className="font-semibold text-lg text-blue-600">{formatAmount(creditRemaining)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monto a pagar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Pagar *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              min="0.01"
              max={maxAmount}
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('amount') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
          </div>
          {getFieldError('amount') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('amount')}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Máximo: {formatAmount(maxAmount)}
          </p>
        </div>

        {/* Referencia del pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia del Pago *
          </label>
          <input
            type="text"
            value={formData.payment_reference}
            onChange={(e) => handleInputChange('payment_reference', e.target.value)}
            placeholder="Ej: REF123456789, Transferencia 001, etc."
            maxLength={50}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('payment_reference') ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {getFieldError('payment_reference') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('payment_reference')}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Número de referencia o comprobante de su pago
          </p>
        </div>

        {/* Captura del pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Captura del Pago
          </label>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {uploadingFile && (
              <div className="flex items-center gap-2 text-blue-600">
                <LoadingSpinner size="sm" />
                <span>Subiendo archivo...</span>
              </div>
            )}

            {formData.payment_capture_url && (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span className="text-green-700 text-sm">
                      Archivo subido: {captureFile?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                
                <img
                  src={formData.payment_capture_url}
                  alt="Captura del pago"
                  className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
          {getFieldError('payment_capture_url') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('payment_capture_url')}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Suba una captura de pantalla o foto del comprobante de pago (recomendado)
          </p>
        </div>

        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.amount || !formData.payment_reference}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Enviando Pago...
              </>
            ) : (
              <>
                📤 Enviar Pago
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


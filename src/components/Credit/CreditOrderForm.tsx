import React, { useState, useEffect } from 'react';
import { useCreditOrder } from '../../hooks/useCreditOrder';
import { useCreditValidation } from '../../hooks/useCreditValidation';
import { CreditOrderData } from '../../types/credit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CreditOrderFormProps {
  cartItems: any[];
  cartTotal: number;
  selectedShippingAddress?: {
    id: string;
    name: string;
    address: string;
  };
  onOrderCreated: (result: any) => void;
  onCancel: () => void;
  className?: string;
}

export const CreditOrderForm: React.FC<CreditOrderFormProps> = ({
  cartItems,
  cartTotal,
  selectedShippingAddress,
  onOrderCreated,
  onCancel,
  className = ''
}) => {
  const { createOrder, loading, error, getFieldError, clearValidationErrors } = useCreditOrder();
  const { canCreateCreditOrder } = useCreditValidation();
  
  const [formData, setFormData] = useState<CreditOrderData>({
    shipping_address_id: selectedShippingAddress?.id || '',
    payment_due_days: 30,
    customer_notes: ''
  });

  // Verificar si se puede crear la orden
  const orderValidation = canCreateCreditOrder(cartTotal);

  // Inicializar con la dirección seleccionada
  useEffect(() => {
    if (selectedShippingAddress?.id) {
      setFormData(prev => ({
        ...prev,
        shipping_address_id: selectedShippingAddress.id
      }));
    }
  }, [selectedShippingAddress?.id]);

  const handleInputChange = (field: keyof CreditOrderData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (getFieldError(field)) {
      clearValidationErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderValidation.canCreate) {
      return;
    }

    try {
      const result = await createOrder(formData);
      onOrderCreated(result);
    } catch (error) {
      console.error('Error creating credit order:', error);
    }
  };

  // Validar que se haya proporcionado la dirección de envío
  if (!selectedShippingAddress) {
    return (
      <div className={`credit-order-form ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Dirección de envío requerida
          </h3>
          <p className="text-gray-600 mb-4">
            No se ha seleccionado una dirección de envío. Por favor, regresa al paso anterior y selecciona una dirección.
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Volver al Paso Anterior
          </button>
        </div>
      </div>
    );
  }

  if (!orderValidation.canCreate) {
    return (
      <div className={`credit-order-form ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No se puede crear la orden
          </h3>
          <p className="text-gray-600 mb-4">{orderValidation.reason}</p>
          
          {orderValidation.suggestions && orderValidation.suggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Sugerencias:</h4>
              <ul className="text-left text-yellow-700 space-y-1">
                {orderValidation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`credit-order-form ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          💳 Crear Orden con Crédito
        </h3>
        <p className="text-gray-600">
          Complete los datos para crear su orden utilizando su línea de crédito
        </p>
      </div>

      {/* Resumen de la orden */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">Resumen de la Orden</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Productos en el carrito:</span>
            <span className="font-semibold">{cartItems.length} items</span>
          </div>
          <div className="flex justify-between">
            <span>Total de la orden:</span>
            <span className="font-semibold text-lg">${Number(cartTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dirección de envío seleccionada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección de Envío
          </label>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">📍</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {selectedShippingAddress.name}
                </h4>
                <p className="text-gray-600 mt-1">
                  {selectedShippingAddress.address}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Seleccionada
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Esta es la dirección que seleccionaste en el paso anterior
          </p>
        </div>

        {/* Días para pagar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días para Pagar *
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={formData.payment_due_days}
            onChange={(e) => handleInputChange('payment_due_days', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('payment_due_days') ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {getFieldError('payment_due_days') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('payment_due_days')}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Tiempo que tiene para realizar el pago de la orden
          </p>
        </div>

        {/* Notas del cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            value={formData.customer_notes}
            onChange={(e) => handleInputChange('customer_notes', e.target.value)}
            placeholder="Agregue cualquier información adicional para su orden..."
            rows={3}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('customer_notes') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('customer_notes') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('customer_notes')}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {(formData.customer_notes || '').length}/500 caracteres
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
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creando Orden...
              </>
            ) : (
              <>
                ✅ Crear Orden con Crédito
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


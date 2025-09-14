import React, { useState } from 'react';
import { useAdminCredit } from '../../hooks/useAdminCredit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CreditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  className?: string;
}

export const CreditAssignmentModal: React.FC<CreditAssignmentModalProps> = ({
  isOpen,
  onClose,
  userId = '',
  userName = '',
  className = ''
}) => {
  const {
    assignCredit,
    loading,
    error,
    clearError,
    validateCreditAssignment,
    formatAmount
  } = useAdminCredit();

  const [formData, setFormData] = useState({
    userId: userId,
    amount: 0
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, userId }));
      clearError();
      setValidationErrors({});
    }
  }, [isOpen, userId, clearError]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos
    const validation = validateCreditAssignment(formData.userId, formData.amount);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      await assignCredit(formData.userId, formData.amount);
      onClose();
      setFormData({ userId: '', amount: 0 });
      setValidationErrors({});
    } catch (error) {
      console.error('Error assigning credit:', error);
    }
  };

  const handleClose = () => {
    setFormData({ userId: '', amount: 0 });
    setValidationErrors({});
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            💳 Asignar Crédito
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {userName && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Usuario:</strong> {userName}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID del usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Usuario *
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              placeholder="Ingrese el ID del usuario"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.userId && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.userId}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Asignar *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="1"
                max="100000"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {validationErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Rango: $1.00 - $100,000.00
            </p>
          </div>

          {/* Error general */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.userId || !formData.amount}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Asignando...
                </>
              ) : (
                <>
                  💳 Asignar Crédito
                </>
              )}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">ℹ️ Información</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• El crédito se asignará inmediatamente al usuario</li>
            <li>• El usuario podrá usar el crédito para realizar compras</li>
            <li>• Se enviará una notificación al usuario</li>
            <li>• Esta acción se registrará en el historial</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


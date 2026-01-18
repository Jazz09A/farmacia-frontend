import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  X, 
  CheckCircle, 
  AlertCircle,
  Shield
} from 'lucide-react';
import { useAdminCredit } from '../../hooks/useAdminCredit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SimpleCreditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  className?: string;
}

export const SimpleCreditAssignmentModal: React.FC<SimpleCreditAssignmentModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
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
    amount: 0,
    notes: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ amount: 0, notes: '' });
      setValidationErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

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
    const validation = validateCreditAssignment(clientId, formData.amount);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      await assignCredit(clientId, formData.amount);
      onClose();
      setFormData({ amount: 0, notes: '' });
      setValidationErrors({});
    } catch (error) {
      console.error('Error assigning credit:', error);
    }
  };

  const handleClose = () => {
    setFormData({ amount: 0, notes: '' });
    setValidationErrors({});
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Asignar Crédito
            </h3>
            <p className="text-gray-600 mt-1">
              Asignar crédito a: <strong>{clientName}</strong>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {clientName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cliente seleccionado
                  </p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Asignar *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Agrega una nota sobre esta asignación de crédito..."
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.amount}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Asignar Crédito
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• El crédito se asignará inmediatamente al cliente</li>
                <li>• Se enviará una notificación al cliente</li>
                <li>• Esta acción quedará registrada en el historial</li>
                <li>• El cliente podrá usar el crédito para compras</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

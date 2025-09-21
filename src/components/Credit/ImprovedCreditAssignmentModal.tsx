import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  User, 
  Building, 
  Mail, 
  Phone, 
  DollarSign, 
  X, 
  CheckCircle, 
  AlertCircle,
  Search,
  Calendar,
  Shield
} from 'lucide-react';
import { Client } from '../../types/credit';
import { useAdminCredit } from '../../hooks/useAdminCredit';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ClientSearchModal } from './ClientSearchModal';

interface ImprovedCreditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ImprovedCreditAssignmentModal: React.FC<ImprovedCreditAssignmentModalProps> = ({
  isOpen,
  onClose,
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

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    notes: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'select' | 'assign'>('select');

  useEffect(() => {
    if (isOpen) {
      setSelectedClient(null);
      setFormData({ amount: 0, notes: '' });
      setValidationErrors({});
      setStep('select');
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

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowClientSearch(false);
    setStep('assign');
  };

  const handleBackToSelection = () => {
    setSelectedClient(null);
    setStep('select');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      setValidationErrors({ client: 'Debe seleccionar un cliente' });
      return;
    }

    // Validar datos
    const validation = validateCreditAssignment(selectedClient.id, formData.amount);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      await assignCredit(selectedClient.id, formData.amount);
      onClose();
      setSelectedClient(null);
      setFormData({ amount: 0, notes: '' });
      setValidationErrors({});
      setStep('select');
    } catch (error) {
      console.error('Error assigning credit:', error);
    }
  };

  const handleClose = () => {
    setSelectedClient(null);
    setFormData({ amount: 0, notes: '' });
    setValidationErrors({});
    setStep('select');
    clearError();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCreditStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCreditStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'suspended': return 'Suspendido';
      case 'inactive': return 'Inactivo';
      default: return 'Sin crédito';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Asignar Crédito
              </h3>
              <p className="text-gray-600 mt-1">
                {step === 'select' ? 'Selecciona un cliente para asignar crédito' : 'Confirma los detalles de la asignación'}
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
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === 'select' ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6"
                >
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Buscar Cliente
                    </h4>
                    <p className="text-gray-600 mb-8">
                      Busca y selecciona el cliente al que deseas asignar crédito
                    </p>
                    <button
                      onClick={() => setShowClientSearch(true)}
                      className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <Search className="w-5 h-5" />
                      Buscar Cliente
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="assign"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* Client Info */}
                  {selectedClient && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {selectedClient.company_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedClient.user_type === 'juridico' ? 'Empresa' : 'Persona Natural'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleBackToSelection}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Cambiar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{selectedClient.email}</span>
                        </div>
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.rif && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>{selectedClient.rif}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Miembro desde {formatDate(selectedClient.created_at)}</span>
                        </div>
                      </div>

                      {selectedClient.credit_info && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Estado de Crédito:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditStatusColor(selectedClient.credit_info.credit_status)}`}>
                              {getCreditStatusText(selectedClient.credit_info.credit_status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Disponible:</span>
                              <span className="font-medium ml-1">${selectedClient.credit_info.available_credit.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Límite:</span>
                              <span className="font-medium ml-1">${selectedClient.credit_info.credit_limit.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignment Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                        onClick={handleBackToSelection}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        disabled={loading}
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !selectedClient || !formData.amount}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• El crédito se asignará inmediatamente al cliente seleccionado</li>
                  <li>• Se enviará una notificación al cliente sobre la asignación</li>
                  <li>• Esta acción quedará registrada en el historial de administración</li>
                  <li>• El cliente podrá usar el crédito para realizar compras</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Client Search Modal */}
      <ClientSearchModal
        isOpen={showClientSearch}
        onClose={() => setShowClientSearch(false)}
        onSelectClient={handleClientSelect}
      />
    </>
  );
};

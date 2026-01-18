import React, { useState, useEffect } from 'react';
import { useAdminCredit } from '../../hooks/useAdminCredit';
import { Payment } from '../../types/credit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AdminPaymentApprovalProps {
  className?: string;
}

export const AdminPaymentApproval: React.FC<AdminPaymentApprovalProps> = ({
  className = ''
}) => {
  const {
    pendingPayments,
    loading,
    error,
    getPendingPayments,
    approvePayment,
    rejectPayment,
    getPaymentDetails,
    formatAmount
  } = useAdminCredit();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    getPendingPayments();
  }, [getPendingPayments]);

  const handleApprove = async (payment: Payment) => {
    try {
      await approvePayment(payment.id, 'Pago verificado correctamente');
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) return;

    try {
      await rejectPayment(selectedPayment.id, rejectReason);
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && pendingPayments.length === 0) {
    return (
      <div className={`admin-payment-approval ${className}`}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando pagos pendientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`admin-payment-approval ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar pagos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={getPendingPayments}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-payment-approval space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            👑 Aprobación de Pagos
          </h2>
          <p className="text-gray-600 mt-1">
            Revisar y aprobar pagos pendientes de los usuarios
          </p>
        </div>
        <button
          onClick={getPendingPayments}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : '🔄'}
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {pendingPayments.length}
          </div>
          <div className="text-gray-600">Pagos Pendientes</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatAmount(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
          </div>
          <div className="text-gray-600">Monto Total Pendiente</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {new Set(pendingPayments.map(p => p.order_id)).size}
          </div>
          <div className="text-gray-600">Órdenes Afectadas</div>
        </div>
      </div>

      {/* Lista de pagos pendientes */}
      {pendingPayments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ¡Excelente trabajo!
          </h3>
          <p className="text-gray-600">
            No hay pagos pendientes de aprobación en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Pago #{payment.id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">
                      Orden: {payment.order_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatAmount(payment.amount)}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">
                    Pendiente de Aprobación
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Referencia:</span>
                  <span className="font-mono">{payment.payment_reference}</span>
                </div>
              </div>

              {/* Captura del pago */}
              {payment.payment_capture_url && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">📷 Captura del Pago:</h4>
                  <img
                    src={payment.payment_capture_url}
                    alt="Captura del pago"
                    className="max-w-md max-h-64 rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(payment.payment_capture_url, '_blank')}
                  />
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleApprove(payment)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : '✅'}
                  Aprobar Pago
                </button>
                <button
                  onClick={() => {
                    setSelectedPayment(payment);
                    setShowRejectModal(true);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  ❌ Rechazar Pago
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Rechazar Pago #{selectedPayment.id.slice(-8)}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Rechazo *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique por qué se rechaza este pago..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPayment(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Rechazar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


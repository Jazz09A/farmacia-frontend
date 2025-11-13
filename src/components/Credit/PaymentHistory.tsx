import React, { useEffect } from 'react';
import { useOrderPaymentsQuery } from '../../hooks/queries/useCreditQueries';
import { PAYMENT_STATUS } from '../../config/creditConfig';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PaymentHistoryProps {
  orderId: string;
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  orderId,
  className = ''
}) => {
  const { data: payments = [], isLoading: loading, error } = useOrderPaymentsQuery(orderId, !!orderId);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING:
        return {
          icon: '⏳',
          color: 'orange',
          text: 'Pendiente de Aprobación',
          description: 'El pago está siendo revisado por el administrador'
        };
      case PAYMENT_STATUS.APPROVED:
        return {
          icon: '✅',
          color: 'green',
          text: 'Aprobado',
          description: 'El pago ha sido aprobado y aplicado a la orden'
        };
      case PAYMENT_STATUS.REJECTED:
        return {
          icon: '❌',
          color: 'red',
          text: 'Rechazado',
          description: 'El pago fue rechazado. Revisa las notas del administrador'
        };
      default:
        return {
          icon: '❓',
          color: 'gray',
          text: 'Desconocido',
          description: 'Estado de pago desconocido'
        };
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (loading) {
    return (
      <div className={`payment-history ${className}`}>
        <div className="flex items-center justify-center p-6">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600">Cargando historial de pagos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`payment-history ${className}`}>
        <div className="text-center p-6">
          <div className="text-red-500 text-2xl mb-2">❌</div>
          <p className="text-gray-600 mb-4">Error al cargar el historial de pagos</p>
          <p className="text-sm text-gray-500">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-history ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📋 Historial de Pagos
        </h3>
        <p className="text-gray-600 text-sm">
          Registro de todos los pagos realizados para esta orden
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📄</div>
          <p className="text-gray-600">No hay pagos registrados para esta orden</p>
          <p className="text-gray-500 text-sm mt-1">
            Los pagos aparecerán aquí una vez que sean enviados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            
            return (
              <div
                key={payment.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      statusInfo.color === 'green' ? 'bg-green-100 text-green-600' :
                      statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      statusInfo.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {statusInfo.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Pago #{payment.id.slice(-8)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatAmount(payment.amount)}
                    </div>
                    <div className={`text-sm font-medium ${
                      statusInfo.color === 'green' ? 'text-green-600' :
                      statusInfo.color === 'orange' ? 'text-orange-600' :
                      statusInfo.color === 'red' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {statusInfo.text}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Referencia:</span>
                    <span className="font-mono">{payment.payment_reference}</span>
                  </div>

                  {payment.approved_at && (
                    <div className="flex justify-between">
                      <span className="font-medium">Aprobado:</span>
                      <span>{formatDate(payment.approved_at)}</span>
                    </div>
                  )}

                  {payment.admin_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-700 mb-1">Notas del Administrador:</div>
                      <p className="text-gray-600">{payment.admin_notes}</p>
                    </div>
                  )}

                  {payment.payment_capture_url && (
                    <div className="mt-3">
                      <div className="font-medium text-gray-700 mb-2">Captura del Pago:</div>
                      <img
                        src={payment.payment_capture_url}
                        alt="Captura del pago"
                        className="max-w-xs max-h-32 rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(payment.payment_capture_url, '_blank')}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen de pagos */}
      {payments.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Resumen de Pagos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {payments.length}
              </div>
              <div className="text-gray-600">Total Pagos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(payments.reduce((sum, p) => p.status === PAYMENT_STATUS.APPROVED ? sum + p.amount : sum, 0))}
              </div>
              <div className="text-gray-600">Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length}
              </div>
              <div className="text-gray-600">Pendientes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


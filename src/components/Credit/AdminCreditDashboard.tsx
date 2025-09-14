import React, { useEffect } from 'react';
import { useAdminCredit } from '../../hooks/useAdminCredit';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AdminCreditDashboardProps {
  className?: string;
}

export const AdminCreditDashboard: React.FC<AdminCreditDashboardProps> = ({
  className = ''
}) => {
  const {
    adminDashboard,
    loading,
    error,
    getAdminDashboard,
    getPaymentStats,
    formatAmount
  } = useAdminCredit();

  useEffect(() => {
    getAdminDashboard();
  }, [getAdminDashboard]);

  const stats = getPaymentStats();

  if (loading && !adminDashboard) {
    return (
      <div className={`admin-credit-dashboard ${className}`}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando dashboard de administrador...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`admin-credit-dashboard ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={getAdminDashboard}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!adminDashboard) {
    return (
      <div className={`admin-credit-dashboard ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-credit-dashboard space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            👑 Dashboard de Administración
          </h2>
          <p className="text-gray-600 mt-1">
            Resumen general del sistema de créditos
          </p>
        </div>
        <button
          onClick={getAdminDashboard}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : '🔄'}
          Actualizar
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingCount}
              </div>
              <div className="text-gray-600">Pagos Pendientes</div>
            </div>
            <div className="text-4xl text-orange-400">⏳</div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Esperando revisión
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {stats.approvedToday}
              </div>
              <div className="text-gray-600">Aprobados Hoy</div>
            </div>
            <div className="text-4xl text-green-400">✅</div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Procesados exitosamente
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {formatAmount(stats.totalPendingAmount)}
              </div>
              <div className="text-gray-600">Monto Pendiente</div>
            </div>
            <div className="text-4xl text-blue-400">💰</div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            En proceso de revisión
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.ordersWithPending}
              </div>
              <div className="text-gray-600">Órdenes Afectadas</div>
            </div>
            <div className="text-4xl text-purple-400">📦</div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Con pagos pendientes
          </div>
        </div>
      </div>

      {/* Resumen de actividad */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          📈 Resumen de Actividad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Pagos Pendientes</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">Cantidad</span>
                <span className="font-bold text-orange-600">{stats.pendingCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">Monto Total</span>
                <span className="font-bold text-orange-600">{formatAmount(stats.totalPendingAmount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Actividad de Hoy</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Pagos Aprobados</span>
                <span className="font-bold text-green-600">{stats.approvedToday}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Órdenes Afectadas</span>
                <span className="font-bold text-blue-600">{stats.ordersWithPending}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⚡ Acciones Rápidas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin/payments'}
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">⏳</div>
            <div className="font-semibold text-gray-800">Revisar Pagos</div>
            <div className="text-sm text-gray-600">
              {stats.pendingCount} pagos pendientes
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/credit-assignment'}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="font-semibold text-gray-800">Asignar Crédito</div>
            <div className="text-sm text-gray-600">
              Gestionar líneas de crédito
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/reports'}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-800">Ver Reportes</div>
            <div className="text-sm text-gray-600">
              Análisis y estadísticas
            </div>
          </button>
        </div>
      </div>

      {/* Alertas y notificaciones */}
      {stats.pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl">⚠️</span>
            <div>
              <div className="font-semibold text-orange-800">
                Atención Requerida
              </div>
              <div className="text-orange-700 text-sm">
                Tienes {stats.pendingCount} pagos pendientes de revisión. 
                <button
                  onClick={() => window.location.href = '/admin/payments'}
                  className="ml-1 underline hover:no-underline"
                >
                  Revisar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


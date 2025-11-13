import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAllPaymentsQuery, useApprovePaymentMutation } from '../../hooks/queries/useCreditQueries';
import { Payment } from '../../types/credit';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageLayout } from '../../components/Layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  dateRange: 'all' | 'today' | 'week' | 'month';
  amountRange: 'all' | 'low' | 'medium' | 'high';
  searchTerm: string;
}

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (paymentId: string, notes: string) => Promise<void>;
  onReject: (paymentId: string, reason: string) => Promise<void>;
  loading: boolean;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  loading
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && payment) {
      setAdminNotes('');
      setRejectReason('');
      setShowRejectForm(false);
    }
  }, [isOpen, payment]);

  const handleApprove = async () => {
    if (!payment) return;
    setIsProcessing(true);
    try {
      await onApprove(payment.id, adminNotes);
      onClose();
    } catch (error) {
      console.error('Error approving payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payment || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(payment.id, rejectReason);
      onClose();
    } catch (error) {
      console.error('Error rejecting payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !payment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Pendiente' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Aprobado' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Rechazado' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Desconocido' };
    }
  };

  const statusInfo = getStatusInfo(payment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Pago #{payment.id.slice(-8)}
              </h2>
              <p className="text-gray-600">
                {formatDate(payment.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Información del Pago
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Monto:</span>
                  <span className="text-xl font-bold text-gray-800">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Referencia:</span>
                  <span className="font-mono text-gray-800">{payment.payment_reference}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Orden ID:</span>
                  <span className="font-mono text-gray-800">{payment.order_id}</span>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Administrador
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agregar notas sobre este pago..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Capture */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Captura del Pago
              </h3>
              
              {payment.payment_capture_url ? (
                <div className="space-y-3">
                  <img
                    src={payment.payment_capture_url}
                    alt="Captura del pago"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(payment.payment_capture_url, '_blank')}
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Haz clic en la imagen para verla en tamaño completo
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay captura disponible</p>
                  </div>
                </div>
              )}

              {/* Previous Admin Notes */}
              {payment.admin_notes && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Notas Anteriores:</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{payment.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {payment.status === 'pending' && (
              <>
                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing || loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                  Aprobar
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Reject Form */}
        <AnimatePresence>
          {showRejectForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-red-50"
            >
              <div className="p-6">
                <h4 className="font-medium text-gray-800 mb-3">Motivo del Rechazo</h4>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique por qué se rechaza este pago..."
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? <LoadingSpinner size="sm" /> : <XCircle className="w-4 h-4" />}
                    Confirmar Rechazo
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const AdminPaymentsPage: React.FC = () => {
  const formatAmount = (n: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(n);
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    dateRange: 'all',
    amountRange: 'all',
    searchTerm: ''
  });
  const { data, isLoading: loading, status } = useAllPaymentsQuery(filters);
  const approvePaymentMutation = useApprovePaymentMutation();

  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // React Query: el refetch se dispara por el cambio de filtros (parte de la queryKey)

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Los filtros ahora se manejan en el backend (React Query)
  const filteredPayments = data?.payments || [];

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.size === filteredPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredPayments.map(p => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayments.size === 0) return;
    
    setIsProcessing(true);
    try {
      const promises = Array.from(selectedPayments).map(paymentId =>
        approvePaymentMutation.mutateAsync({ paymentId, approvalData: { approved: true, notes: 'Aprobación masiva' } })
      );
      await Promise.all(promises);
      setSelectedPayments(new Set());
    } catch (error) {
      console.error('Error in bulk approval:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleApprove = async (paymentId: string, notes: string) => {
    await approvePaymentMutation.mutateAsync({ paymentId, approvalData: { approved: true, notes } });
  };

  const handleReject = async (paymentId: string, reason: string) => {
    await approvePaymentMutation.mutateAsync({ paymentId, approvalData: { approved: false, reason } });
  };

  const handleExportPayments = () => {
    const csvContent = [
      ['ID', 'Orden ID', 'Monto', 'Referencia', 'Estado', 'Fecha Creación', 'Fecha Aprobación', 'Notas Admin'],
      ...filteredPayments.map(payment => [
        payment.id,
        payment.order_id,
        payment.amount.toString(),
        payment.payment_reference,
        payment.status,
        new Date(payment.created_at).toLocaleString('es-ES'),
        payment.approved_at ? new Date(payment.approved_at).toLocaleString('es-ES') : '',
        payment.admin_notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Pendiente' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Aprobado' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Rechazado' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Desconocido' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: filteredPayments.length,
    pending: filteredPayments.filter(p => p.status === 'pending').length,
    approved: filteredPayments.filter(p => p.status === 'approved').length,
    rejected: filteredPayments.filter(p => p.status === 'rejected').length,
    totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading && filteredPayments.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Cargando pagos...</span>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  💳 Gestión de Pagos
                </h1>
                <p className="text-gray-600 mt-2">
                  Administra y aprueba pagos de los usuarios
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportPayments}
                  disabled={filteredPayments.length === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setFilters({ ...filters })}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmount)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="approved">Aprobados</option>
                      <option value="rejected">Rechazados</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Fecha
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas las fechas</option>
                      <option value="today">Hoy</option>
                      <option value="week">Esta semana</option>
                      <option value="month">Este mes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Monto
                    </label>
                    <select
                      value={filters.amountRange}
                      onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los montos</option>
                      <option value="low">Bajo ($0 - $99)</option>
                      <option value="medium">Medio ($100 - $999)</option>
                      <option value="high">Alto ($1000+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        placeholder="ID, referencia, orden..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions */}
          {selectedPayments.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-blue-800 font-medium">
                    {selectedPayments.size} pagos seleccionados
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkApprove}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                    Aprobar Seleccionados
                  </button>
                  <button
                    onClick={() => setSelectedPayments(new Set())}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lista de Pagos ({filteredPayments.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {selectedPayments.size === filteredPayments.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Seleccionar Todo
                  </button>
                </div>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No hay pagos que coincidan
                </h3>
                <p className="text-gray-600">
                  {filters.searchTerm || filters.status !== 'all' || filters.dateRange !== 'all' || filters.amountRange !== 'all'
                    ? 'Intenta ajustar los filtros para ver más resultados.'
                    : 'No hay pagos registrados en el sistema.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedPayments.size === filteredPayments.length && filteredPayments.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => {
                      const statusInfo = getStatusInfo(payment.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedPayments.has(payment.id)}
                              onChange={() => handleSelectPayment(payment.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statusInfo.bg}`}>
                                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  #{payment.id.slice(-8)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Orden: {payment.order_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatAmount(payment.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              {payment.payment_reference}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(payment)}
                              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={isProcessing}
        />
      </div>
    </PageLayout>
  );
};

export default AdminPaymentsPage;

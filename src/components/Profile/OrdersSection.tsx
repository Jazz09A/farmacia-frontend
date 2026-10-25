import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useInvoicesQuery, useInvoiceDetailsQuery } from '../../hooks/queries/useInvoiceQueries';
import type { Currency } from '../../types';

const OrdersSection: React.FC = () => {
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { currency, formatPrice, convertPrice } = useGlobalCurrency();

  // Solo facturas DEMOA (API montada). Pedidos legacy no tienen endpoint.
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoicesQuery('all');
  const { data: selectedInvoice } = useInvoiceDetailsQuery(
    selectedInvoiceNumber || '',
    !!selectedInvoiceNumber && isInvoiceModalOpen
  );

  const handleViewInvoiceDetails = (invoiceNumber: string) => {
    setSelectedInvoiceNumber(invoiceNumber);
    setIsInvoiceModalOpen(true);
  };

  const formatInvoicePrice = (amount: string, invoiceCurrency: string) => {
    const numAmount = parseFloat(amount);
    const originalCurrency: Currency = invoiceCurrency.toLowerCase().includes('dolar') ? 'USD' : 'VES';
    const convertedAmount = convertPrice(numAmount, originalCurrency, currency);
    return formatPrice(convertedAmount, currency);
  };

  const getInvoiceStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      default:
        return status;
    }
  };

  const getInvoiceOrderStatusText = (orderStatus: string) => {
    switch (orderStatus) {
      case 'active':
        return 'Activa';
      case 'processing':
        return 'En Proceso';
      case 'requires_attention':
        return 'Requiere Atención';
      default:
        return orderStatus;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'paid':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getInvoiceOrderStatusBadge = (orderStatus: string) => {
    const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5';
    switch (orderStatus) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'requires_attention':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loadingInvoices && !invoices.length) {
    return <LoadingSpinner variant="inline" message="Cargando facturas..." />;
  }

  const hasInvoices = invoices.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-medical-gray-800">Mis Pedidos y Facturas</h2>
      </div>

      {/* Pedidos legacy no disponibles — flujo = cotizaciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-medical-gray-700 mb-2">
          Los pedidos se gestionan vía cotizaciones.
        </p>
        <Link
          to="/profile"
          state={{ defaultTab: 'cotizaciones' }}
          className="text-medical-blue-600 font-medium hover:underline"
        >
          Ver mis cotizaciones →
        </Link>
      </div>

      {hasInvoices ? (
        <div>
          <h3 className="text-lg font-semibold text-medical-gray-700 mb-3">Facturas DEMOA</h3>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <motion.div
                key={invoice.invoice_number}
                className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-blue-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-500">
                      Emitida: {new Date(invoice.emission_date).toLocaleDateString()}
                    </p>
                    {invoice.due_date && (
                      <p className={`text-xs ${invoice.status === 'pending' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Vence: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={getInvoiceStatusBadge(invoice.status)}>
                      {invoice.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {getInvoiceStatusText(invoice.status)}
                    </span>
                    <span className={getInvoiceOrderStatusBadge(invoice.order_status)}>
                      {getInvoiceOrderStatusText(invoice.order_status)}
                    </span>
                  </div>
                  <p className="font-semibold mt-1">
                    {formatInvoicePrice(invoice.total_amount, invoice.currency)}
                  </p>
                  {invoice.status === 'pending' && parseFloat(invoice.balance) > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      Saldo pendiente: {formatInvoicePrice(invoice.balance, invoice.currency)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewInvoiceDetails(invoice.invoice_number)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Ver Detalles"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No tienes facturas DEMOA aún.</p>
        </div>
      )}

      {isInvoiceModalOpen && selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedInvoiceNumber(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersSection;

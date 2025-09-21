import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Paperclip, Send } from 'lucide-react';
import { useCredit } from '../../contexts/CreditContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PaymentFormProps {
  orderId: string;
  orderTotal: number;
  creditRemaining: number;
  onPaymentCreated: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, orderTotal, creditRemaining, onPaymentCreated }) => {
  const [amount, setAmount] = useState<number>(creditRemaining);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentCapture, setPaymentCapture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPayment } = useCredit();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentCapture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentReference || !paymentCapture) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (amount > creditRemaining) {
      setError(`El monto no puede ser mayor al crédito restante (${creditRemaining})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPayment({
        order_id: orderId,
        amount,
        payment_reference: paymentReference,
        payment_capture_url: '' // The backend will handle the upload
      }, paymentCapture);
      onPaymentCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-4 rounded-lg text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total de la Orden:</span>
          <span className="font-bold text-gray-800">${orderTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Crédito Restante:</span>
          <span className="font-bold text-green-600">${creditRemaining.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            max={creditRemaining}
            step="0.01"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 mb-2">Referencia del Pago</label>
        <input
          type="text"
          id="paymentReference"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de Pago</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Sube un archivo</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
              <p className="pl-1">o arrástralo aquí</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
            {paymentCapture && <p className="text-sm text-green-600">Archivo seleccionado: {paymentCapture.name}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
          Enviar Pago
        </motion.button>
      </div>
    </form>
  );
};
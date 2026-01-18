import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PaymentForm } from '../Credit/PaymentForm';

interface PaymentModalProps {
  order: any;
  onClose: () => void;
  onPaymentCreated: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose, onPaymentCreated }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Realizar Pago</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <PaymentForm orderId={order.id} orderTotal={order.total} creditRemaining={order.credit_remaining || order.total} onPaymentCreated={onPaymentCreated} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
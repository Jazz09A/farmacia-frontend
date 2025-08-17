import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center pt-20 pb-10">
      <div className="text-center p-8 bg-white rounded-2xl shadow-soft max-w-md w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        </motion.div>
        <h1 className="mt-6 text-3xl font-bold text-medical-gray-900">¡Pedido Realizado con Éxito!</h1>
        <p className="mt-4 text-medical-gray-600">
          Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando. Recibirás una notificación por correo electrónico con los detalles.
        </p>
        <div className="mt-8">
          <Link
            to="/profile"
            className="inline-block px-8 py-3 bg-medical-primary text-white font-semibold rounded-xl hover:bg-medical-primary-dark transition-colors duration-300"
          >
            Ir a Mi Perfil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

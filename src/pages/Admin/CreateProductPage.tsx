import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  FileText,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import IndividualProductForm from '../../components/Admin/IndividualProductForm';
import BulkProductUpload from '../../components/Admin/BulkProductUpload';

type CreationMode = 'individual' | 'bulk';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CreationMode>('individual');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    
    // Después de 3 segundos, redirigir a la lista de productos
    setTimeout(() => {
      navigate('/admin/products');
    }, 3000);
  };

  const modes = [
    {
      id: 'individual' as CreationMode,
      name: 'Producto Individual',
      description: 'Crear un producto manualmente',
      icon: Plus,
      color: 'blue'
    },
    {
      id: 'bulk' as CreationMode,
      name: 'Carga Masiva',
      description: 'Subir productos desde CSV/Excel',
      icon: Upload,
      color: 'green'
    }
  ];

  if (showSuccessAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            ¡Éxito!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-6"
          >
            {successMessage}
          </motion.p>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 3 }}
            className="h-1 bg-green-500 rounded-full"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-500 mt-4"
          >
            Redirigiendo a la lista de productos...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Crear Productos
            </h1>
            <p className="mt-2 text-gray-600">
              Agrega nuevos productos a tu inventario de forma individual o masiva
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona el método de creación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((modeOption) => {
            const Icon = modeOption.icon;
            const isActive = mode === modeOption.id;
            
            return (
              <button
                key={modeOption.id}
                onClick={() => setMode(modeOption.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  isActive
                    ? `border-${modeOption.color}-500 bg-${modeOption.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isActive 
                      ? `bg-${modeOption.color}-100` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isActive 
                        ? `text-${modeOption.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isActive ? `text-${modeOption.color}-900` : 'text-gray-900'
                    }`}>
                      {modeOption.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isActive ? `text-${modeOption.color}-700` : 'text-gray-600'
                    }`}>
                      {modeOption.description}
                    </p>
                  </div>
                  {isActive && (
                    <CheckCircle className={`w-5 h-5 text-${modeOption.color}-600`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'individual' ? (
            <IndividualProductForm onSuccess={handleSuccess} />
          ) : (
            <BulkProductUpload onSuccess={handleSuccess} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreateProductPage;

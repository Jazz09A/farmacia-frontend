import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 3500 
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) return;

    // Reset progress when toast becomes visible
    setProgress(100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    // Auto close after duration
    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 min-w-[300px] max-w-md"
        >
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <motion.div
                className={`h-full ${
                  type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            </div>

            <div className="flex items-start gap-3 p-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`p-2 rounded-full flex-shrink-0 ${
                  type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {type === 'success' ? '¡Éxito!' : 'Error'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 break-words">
                  {message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 rounded hover:bg-gray-100"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;


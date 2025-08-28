import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '../services/AuthService';

const EmailVerificationPage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let timeoutId: number | null = null;
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación inválido.');
        return;
      }
      setStatus('verifying');
      const result = await authService.verifyEmailToken(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        timeoutId = window.setTimeout(() => navigate('/', { replace: true }), 1800);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    };

    verify();
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 max-w-md w-full text-center">
        <AnimatePresence mode="wait">
          {status === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Verificando tu correo...</h1>
              <p className="text-gray-500 text-sm">Por favor espera un momento.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">¡Correo verificado!</h1>
              <p className="text-gray-500 text-sm">{message || 'Tu cuenta ha sido validada. Redirigiendo...'}</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">No se pudo verificar</h1>
              <p className="text-gray-500 text-sm">{message || 'El enlace podría haber expirado o ya fue usado.'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmailVerificationPage;



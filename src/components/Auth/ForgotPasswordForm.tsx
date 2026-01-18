import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { authService } from '../../services/AuthService';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Enviado</h2>
          <p className="text-gray-600 mb-4">
            Hemos enviado un email a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Por favor, revisa tu bandeja de entrada y sigue el enlace del email. El enlace expirará en 1 hora.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline font-medium"
        >
          ← Volver al inicio de sesión
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">¿Olvidaste tu contraseña?</h2>
        <p className="text-gray-500 mt-2">Ingresa tu email y te enviaremos un enlace para restablecerla</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-75"
        >
          {isLoading ? (
            <LoadingSpinner variant="button" size="md" />
          ) : (
            'Enviar enlace de recuperación'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio de sesión
        </button>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;


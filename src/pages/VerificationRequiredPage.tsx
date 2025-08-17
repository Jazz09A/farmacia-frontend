import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { authService } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';

const VerificationRequiredPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si el usuario no está autenticado, redirigir al login
  // Si el usuario ya está verificado, redirigir al home
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
    } else if (user && user.is_verified) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await authService.resendVerificationEmail();
      setSubmitStatus('success');
      setMessage(response.message || 'Correo de verificación enviado con éxito.');
    } catch (error: any) {
      setSubmitStatus('error');
      setMessage(error.message || 'Ocurrió un error al enviar el correo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center"
      >
        <Mail className="mx-auto h-12 w-12 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Verifica tu correo electrónico</h1>
        <p className="text-gray-600 mt-2">
          Hola, {user?.email}. Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu correo electrónico.
        </p>
        <p className="text-gray-600 mt-2">
          Si no has recibido el correo, haz clic en el botón de abajo.
        </p>

        <motion.button
          onClick={handleResendEmail}
          disabled={isSubmitting}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-75"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">...</svg>
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          Reenviar correo de verificación
        </motion.button>
        
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-md flex items-center text-sm ${
              submitStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {submitStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationRequiredPage;

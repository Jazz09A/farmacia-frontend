import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { authService } from '../../services/AuthService';

const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido o faltante');
    }
  }, [token]);

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
    }
    return { valid: true, message: '' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar errores del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: [] });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      setFieldErrors({ newPassword: [passwordValidation.message] });
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: ['Las contraseñas no coinciden'] });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.success) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/auth?mode=login', { replace: true });
        }, 3000);
      } else {
        if (response.errors && Object.keys(response.errors).length > 0) {
          setFieldErrors(response.errors);
        } else {
          setError(response.message);
        }
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Contraseña Restablecida!</h2>
          <p className="text-gray-600 mb-4">
            Tu contraseña ha sido restablecida exitosamente.
          </p>
          <p className="text-sm text-gray-500">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>
        <button
          onClick={() => navigate('/auth?mode=login', { replace: true })}
          className="text-blue-600 hover:underline font-medium"
        >
          Ir al inicio de sesión ahora →
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Restablecer Contraseña</h2>
        <p className="text-gray-500 mt-2">Ingresa tu nueva contraseña</p>
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
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.newPassword ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="text-red-500 text-xs mt-2">{fieldErrors.newPassword[0]}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Debe contener: mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.confirmPassword ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Confirma tu nueva contraseña"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-2">{fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-75"
        >
          {isLoading ? (
            <LoadingSpinner variant="button" size="md" />
          ) : (
            'Restablecer Contraseña'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;


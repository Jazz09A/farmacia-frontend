import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { authService } from '../../services/AuthService';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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

    // Validar que todos los campos estén llenos
    if (!formData.currentPassword) {
      setFieldErrors({ currentPassword: ['La contraseña actual es requerida'] });
      return;
    }

    // Validar nueva contraseña
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

    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.currentPassword === formData.newPassword) {
      setFieldErrors({ newPassword: ['La nueva contraseña debe ser diferente a la actual'] });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.success) {
        setSuccess(true);
        // Limpiar el formulario
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Llamar callback de éxito después de 2 segundos
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 lg:w-6 lg:h-6" />
          Cambiar Contraseña
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-medical-gray-400 hover:text-medical-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center mb-6"
          >
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>Contraseña cambiada exitosamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="currentPassword" className="block text-sm font-medium text-medical-gray-700 mb-2">
            Contraseña Actual
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 w-5 h-5" />
            <input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.currentPassword
                  ? 'border-red-500 ring-red-500'
                  : 'border-medical-gray-300 focus:ring-medical-primary'
              }`}
              placeholder="Ingresa tu contraseña actual"
              disabled={isLoading || success}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 hover:text-medical-gray-600"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.currentPassword && (
            <p className="text-red-500 text-xs mt-2">{fieldErrors.currentPassword[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-medical-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 w-5 h-5" />
            <input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.newPassword
                  ? 'border-red-500 ring-red-500'
                  : 'border-medical-gray-300 focus:ring-medical-primary'
              }`}
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
              disabled={isLoading || success}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 hover:text-medical-gray-600"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="text-red-500 text-xs mt-2">{fieldErrors.newPassword[0]}</p>
          )}
          <p className="text-xs text-medical-gray-500 mt-1">
            Debe contener: mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-medical-gray-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.confirmPassword
                  ? 'border-red-500 ring-red-500'
                  : 'border-medical-gray-300 focus:ring-medical-primary'
              }`}
              placeholder="Confirma tu nueva contraseña"
              disabled={isLoading || success}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 hover:text-medical-gray-600"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-2">{fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || success}
              className="flex-1 px-4 py-3 border border-medical-gray-300 text-medical-gray-700 rounded-lg font-medium hover:bg-medical-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || success}
            className="flex-1 bg-medical-primary text-white py-3 rounded-lg font-semibold hover:bg-medical-primary-dark transition flex items-center justify-center disabled:opacity-75"
          >
            {isLoading ? (
              <LoadingSpinner variant="button" size="sm" />
            ) : success ? (
              'Contraseña Cambiada'
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;


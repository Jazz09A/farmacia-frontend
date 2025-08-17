
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { LoginData } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: [] });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (!formData.email) newErrors.email = ['El email es requerido'];
    if (!formData.password) newErrors.password = ['La contraseña es requerida'];
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await login(formData);
      if (response.success) {
        // Si el usuario no está verificado, redirigir a verificación
        if (response.data.user.is_verified === false) {
          navigate('/verify-account', { replace: true });
          return; // Importante: salir aquí para no continuar con la redirección normal
        }
        // Solo si el usuario está verificado, redirigir a la página de origen
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        if (response.errors && Object.keys(response.errors).length > 0) {
          setErrors(response.errors);
        } else {
          setErrors({ general: [response.message || 'Ocurrió un error.'] });
        }
      }
    } catch (error) {
      setErrors({ general: ['Error de conexión.'] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
        <p className="text-gray-500 mt-2">Accede a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>{errors.general[0]}</span>
          </motion.div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="tu@email.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Tu contraseña"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-75"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </form>
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:underline">
            Regístrate
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm; 
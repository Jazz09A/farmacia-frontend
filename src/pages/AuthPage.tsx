import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Building,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginData } from '../types/auth';
import JuridicoRegisterForm from '../components/Auth/JuridicoRegisterForm';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  // Validate login form
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!loginData.email) {
      newErrors.email = ['El email es requerido'];
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = ['Email inválido'];
    }

    if (!loginData.password) {
      newErrors.password = ['La contraseña es requerida'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login(loginData);
      
      if (response.success) {
        setSuccessMessage('Login exitoso. Redirigiendo...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setErrors(response.errors || {});
        if (response.message && !response.errors) {
          setErrors({ general: [response.message] });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: ['Error de conexión. Por favor, intenta nuevamente.'] });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = () => {
    setSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.');
    setMode('login');
    setLoginData({ email: '', password: '' });
  };

  // Handle switch to login after registration
  const handleSwitchToLogin = () => {
    setMode('login');
    setErrors({});
    setSuccessMessage('');
  };

  // Render login form
  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
          Iniciar Sesión
        </h2>
        <p className="text-gray-600 mt-2">
          Accede a tu cuenta de farmacia
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{errors.general[0]}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="farmacia@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={() => setMode('register')}
            className="text-medical-primary hover:text-medical-primary-dark font-medium"
          >
            Registrar Farmacia
          </button>
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-medical-primary to-medical-accent p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <div className="text-center">
                  <Building className="w-16 h-16 mx-auto mb-4" />
                  <h1 className="text-4xl font-bold mb-4">FarmaPlus</h1>
                  <p className="text-xl mb-8 opacity-90">
                    Plataforma exclusiva para farmacias
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center text-white/90">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span>Gestión de inventario avanzada</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span>Precios preferenciales para farmacias</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span>Soporte técnico especializado</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span>Facturación empresarial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Forms */}
            <div className="lg:w-1/2 p-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {mode === 'login' && renderLoginForm()}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                  >
                    <JuridicoRegisterForm 
                      onSuccess={handleRegistrationSuccess}
                      onSwitchToLogin={handleSwitchToLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
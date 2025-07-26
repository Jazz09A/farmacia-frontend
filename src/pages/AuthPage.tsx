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
  Loader2,
  Award,
  Shield,
  Users,
  TrendingUp,
  HeartHandshake,
  Clock
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
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-medical-primary to-medical-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <div className="w-full flex">
        {/* Left Panel - Por qué registrarse (Fondo azul médico) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-medical-primary via-medical-primary-dark to-medical-accent relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            <div className="max-w-lg">
              {/* Logo/Icon */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">FarmaPlus</h1>
                <p className="text-xl text-white/90">
                  La plataforma líder para farmacias en Venezuela
                </p>
              </div>

              {/* Beneficios principales */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  ¿Por qué unirse a FarmaPlus?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Aumenta tus ventas</h3>
                      <p className="text-white/80 text-sm">
                        Accede a miles de productos farmacéuticos con precios preferenciales exclusivos para farmacias asociadas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Garantía de calidad</h3>
                      <p className="text-white/80 text-sm">
                        Todos nuestros productos cuentan con registro sanitario INVIMA y cadena de frío certificada.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Entrega rápida</h3>
                      <p className="text-white/80 text-sm">
                        Despacho en 24-48 horas a nivel nacional con seguimiento en tiempo real de tus pedidos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Soporte especializado</h3>
                      <p className="text-white/80 text-sm">
                        Representante comercial asignado y soporte técnico 24/7 especializado en farmacias.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Beneficios exclusivos</h3>
                      <p className="text-white/80 text-sm">
                        Crédito comercial, descuentos por volumen, facturación empresarial y programas de fidelidad.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <HeartHandshake className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Red de farmacias</h3>
                      <p className="text-white/80 text-sm">
                        Únete a más de 500+ farmacias en toda Venezuela que confían en nuestra plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 text-center">Estadísticas que nos respaldan</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-white/80">Farmacias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm text-white/80">Productos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-white/80">Satisfacción</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Formularios */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderLoginForm()}
                </motion.div>
              )}
              {mode === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-medical-primary to-medical-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
                      Registro de Farmacia
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Únete a nuestra red de farmacias asociadas
                    </p>
                  </div>
                  
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
  );
};

export default AuthPage;
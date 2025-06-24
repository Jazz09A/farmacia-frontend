import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Building, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  FileCheck,
  Globe
} from 'lucide-react';

// Importar componentes de formularios
import { JuridicoRegisterFormComponent } from '../components/Auth/JuridicoRegisterForm';

// Importar tipos compartidos
import { JuridicoRegisterForm as JuridicoFormType } from '../types/auth';

// Importar servicios y tipos
import { 
  AuthService, 
  LoginRequest, 
  RegisterRequest, 
  UserNaturalCreate,
  UserJuridicoCreate,
  validateEmail 
} from '../services/AuthService';

// Interfaces para formularios locales
interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'natural' | 'juridico'>('juridico');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // Estado para formulario de login
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });

  // Estado para formulario de registro (solo farmacias)
  const [juridicoForm, setJuridicoForm] = useState<JuridicoFormType>({
    user_type: 'juridico',
    email: '',
    password: '',
    confirm_password: '',
    company_name: '',
    rif: '',
    registro_mercantil: '',
    phone: '',
    preferred_currency: 'VES',
    representante_legal_cedula: '',
    representante_legal_nombre: '',
    representantes_adicionales: '',
    referencia_comercial_proveedor: '',
    referencia_bancaria: '',
    direccion_establecimiento: '',
    dueno_telefono: '',
    dueno_email: '',
    dueno_cumpleanos: '',
    encargado_compra_telefono: '',
    encargado_compra_email: '',
    encargado_compra_cumpleanos: '',
    encargado_cobranza_telefono: '',
    encargado_cobranza_email: '',
    encargado_cobranza_cumpleanos: '',
    redes_sociales: '',
    pagina_web: '',
    codigo_sicm: ''
  });

  // Pasos del registro jurídico
  const juridicoSteps = [
    { id: 1, title: 'Información Básica', icon: Building },
    { id: 2, title: 'Representantes Legales', icon: Users },
    { id: 3, title: 'Referencias', icon: FileCheck },
    { id: 4, title: 'Contactos Adicionales', icon: Phone },
    { id: 5, title: 'Información Extra', icon: Globe }
  ];

  // Validaciones para login
  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!loginForm.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!loginForm.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers para cambios en formularios
  const handleLoginChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Submit handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const authService = AuthService.getInstance();
      const response = await authService.login(loginForm);
      
      setSuccessMessage('¡Bienvenido! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error al iniciar sesión' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const authService = AuthService.getInstance();
      
      // Solo registros jurídicos (farmacias)
      const { confirm_password, representantes_adicionales, ...juridicoData } = juridicoForm;
      const registerData: RegisterRequest = {
        ...juridicoData,
        representantes_adicionales: representantes_adicionales 
          ? representantes_adicionales.split(',').map(r => r.trim()).filter(r => r)
          : undefined
      } as UserJuridicoCreate;
      
      await authService.register(registerData);
      
      setSuccessMessage('¡Registro exitoso! Puedes iniciar sesión ahora.');
      
      // Reset form and switch to login
      setTimeout(() => {
        setIsLogin(true);
        setSuccessMessage('');
        // Reset formulario jurídico
        setJuridicoForm({
          user_type: 'juridico',
          email: '',
          password: '',
          confirm_password: '',
          company_name: '',
          rif: '',
          registro_mercantil: '',
          phone: '',
          preferred_currency: 'VES',
          representante_legal_cedula: '',
          representante_legal_nombre: '',
          representantes_adicionales: '',
          referencia_comercial_proveedor: '',
          referencia_bancaria: '',
          direccion_establecimiento: '',
          dueno_telefono: '',
          dueno_email: '',
          dueno_cumpleanos: '',
          encargado_compra_telefono: '',
          encargado_compra_email: '',
          encargado_compra_cumpleanos: '',
          encargado_cobranza_telefono: '',
          encargado_cobranza_email: '',
          encargado_cobranza_cumpleanos: '',
          redes_sociales: '',
          pagina_web: '',
          codigo_sicm: ''
        });
        setCurrentStep(1);
      }, 2000);

    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error al registrarse' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMessage('');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-24 sm:pt-40 pb-8 sm:pb-16">
      <div className="medical-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Formulario Principal */}
          <div className="bg-white p-8 rounded-2xl shadow-soft">
            <AnimatePresence mode="wait">
              {isLogin ? (
                // Formulario de Login
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-medical-blue-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                      <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-medical-gray-800 mb-2">Iniciar Sesión</h2>
                    <p className="text-medical-gray-600">Accede a tu cuenta para continuar</p>
                  </div>

                  {/* Mensajes de estado */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-red-700">{errors.general}</span>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-green-700">{successMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => handleLoginChange('email', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => handleLoginChange('password', e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent transition-all ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Tu contraseña"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 hover:text-medical-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Botón de login */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-medical-primary text-white font-semibold rounded-xl hover:bg-medical-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Iniciando sesión...
                        </div>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </button>
                  </form>

                  {/* Link para cambiar a registro */}
                  <div className="text-center mt-6">
                    <p className="text-medical-gray-600">
                      ¿No tienes cuenta?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="text-medical-primary font-semibold hover:underline"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Formularios de Registro
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mensajes de estado */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-red-700">{errors.general}</span>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-green-700">{successMessage}</span>
                    </motion.div>
                  )}

                  {/* Selector de tipo de usuario - Solo para Farmacias */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-medical-gray-800 mb-6">Registro de Farmacia</h2>
                    <div className="w-full max-w-md mx-auto">
                      <div className="p-6 rounded-xl border-2 border-medical-primary bg-medical-blue-50 text-center">
                        <Building className="w-8 h-8 mx-auto mb-3 text-medical-primary" />
                        <h3 className="font-bold text-lg text-medical-gray-800 mb-2">Registro Exclusivo para Farmacias</h3>
                        <p className="text-sm text-medical-gray-600">
                          Únete a nuestra red de farmacias asociadas y accede a beneficios exclusivos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario Jurídico - Solo para Farmacias */}
                  <JuridicoRegisterFormComponent
                    form={juridicoForm}
                    setForm={setJuridicoForm}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    steps={juridicoSteps}
                    onSubmit={handleRegisterSubmit}
                    loading={isLoading}
                  />

                  {/* Link para cambiar a login */}
                  <div className="text-center mt-6">
                    <p className="text-medical-gray-600">
                      ¿Ya tienes cuenta?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="text-medical-primary font-semibold hover:underline"
                      >
                        Inicia sesión aquí
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar de Beneficios */}
          <div className="space-y-6 lg:space-y-8 mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-medical-blue-gradient p-8 rounded-2xl text-white"
            >
              <h3 className="text-2xl font-bold mb-6">¿Por qué registrarte?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Precios Preferenciales</h4>
                    <p className="text-white/80 text-sm">Accede a descuentos exclusivos y promociones especiales</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Historial de Compras</h4>
                    <p className="text-white/80 text-sm">Mantén un registro de todos tus pedidos y facturas</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Soporte Prioritario</h4>
                    <p className="text-white/80 text-sm">Atención personalizada y soporte técnico especializado</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Información adicional para farmacias */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-soft border border-medical-blue-100 mb-8 lg:mb-0"
              >
                <h4 className="font-bold text-medical-gray-800 mb-4">Beneficios para Farmacias</h4>
                <ul className="space-y-2 text-sm text-medical-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Crédito comercial disponible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Descuentos por volumen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Facturación empresarial
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Representante comercial asignado
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
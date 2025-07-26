import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  FileText, 
  Calendar, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  FileCheck,
  Globe
} from 'lucide-react';
import { JuridicoRegisterData } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';

interface JuridicoRegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

// Interface para el formulario con confirm_password
interface JuridicoFormData extends Omit<JuridicoRegisterData, 'representantes_adicionales'> {
  confirm_password: string;
  representantes_adicionales: string; // Como string separado por comas
}

const steps = [
  { id: 1, title: 'Información Básica', icon: Building },
  { id: 2, title: 'Representantes Legales', icon: Users },
  { id: 3, title: 'Referencias', icon: FileCheck },
  { id: 4, title: 'Contactos Adicionales', icon: Phone },
  { id: 5, title: 'Información Extra', icon: Globe }
];

const JuridicoRegisterForm: React.FC<JuridicoRegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { registerJuridico } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<JuridicoFormData>({
    email: '',
    phone: '',
    preferred_currency: 'VES',
    user_type: 'juridico',
    company_name: '',
    rif: '',
    registro_mercantil: '',
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
    codigo_sicm: '',
    fotos_establecimiento: [],
    password: '',
    confirm_password: '',
  });

  const updateForm = (field: keyof JuridicoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (currentStep === 1) {
      // Validaciones paso 1 - Información Básica
      if (!formData.company_name.trim()) newErrors.company_name = ['El nombre de la empresa es requerido'];
      if (!formData.rif.trim()) newErrors.rif = ['El RIF es requerido'];
      if (!formData.registro_mercantil.trim()) newErrors.registro_mercantil = ['El registro mercantil es requerido'];
      if (!formData.email.trim()) newErrors.email = ['El email es requerido'];
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = ['Email inválido'];
      if (!formData.phone.trim()) newErrors.phone = ['El teléfono es requerido'];
      if (!formData.direccion_establecimiento.trim()) newErrors.direccion_establecimiento = ['La dirección es requerida'];
      if (!formData.password) newErrors.password = ['La contraseña es requerida'];
      else if (formData.password.length < 8) newErrors.password = ['La contraseña debe tener al menos 8 caracteres'];
      if (!formData.confirm_password) newErrors.confirm_password = ['Confirmar contraseña es requerido'];
      else if (formData.password !== formData.confirm_password) newErrors.confirm_password = ['Las contraseñas no coinciden'];
    } else if (currentStep === 2) {
      // Validaciones paso 2 - Representantes
      if (!formData.representante_legal_cedula.trim()) newErrors.representante_legal_cedula = ['La cédula del representante legal es requerida'];
      if (!formData.representante_legal_nombre.trim()) newErrors.representante_legal_nombre = ['El nombre del representante legal es requerido'];
    } else if (currentStep === 3) {
      // Validaciones paso 3 - Referencias
      if (!formData.referencia_comercial_proveedor.trim()) newErrors.referencia_comercial_proveedor = ['La referencia comercial es requerida'];
      if (!formData.referencia_bancaria.trim()) newErrors.referencia_bancaria = ['La referencia bancaria es requerida'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Preparar datos para enviar
      const { confirm_password, representantes_adicionales, ...submitData } = formData;
      const finalData: JuridicoRegisterData = {
        ...submitData,
        representantes_adicionales: representantes_adicionales 
          ? representantes_adicionales.split(',').map(r => r.trim()).filter(r => r)
          : []
      };

      const response = await registerJuridico(finalData);
      
      if (response.success) {
        setSuccessMessage(response.message);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setErrors(response.errors || {});
        if (response.message && !response.errors) {
          setErrors({ general: [response.message] });
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors({ general: ['Error de conexión. Por favor, intenta nuevamente.'] });
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Registro Exitoso!</h3>
        <p className="text-gray-600 mb-4">{successMessage}</p>
        <p className="text-sm text-gray-500">Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-10">
        {/* Steps Container */}
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-6 left-0 h-0.5 bg-medical-primary z-10 transition-all duration-500 ease-out"
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
          ></div>

          {/* Steps */}
          <div className="relative flex justify-between z-20">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 transform
                  ${currentStep >= step.id 
                    ? 'bg-medical-primary border-medical-primary text-white shadow-lg scale-110' 
                    : currentStep === step.id - 1
                    ? 'bg-white border-medical-primary text-medical-primary shadow-md scale-105'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                
                {/* Step Label */}
                <div className="mt-3 text-center max-w-20">
                  <div className={`text-xs font-medium transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? 'text-medical-primary' 
                      : 'text-gray-500'
                  }`}>
                    Paso {step.id}
                  </div>
                  <div className={`text-xs mt-1 leading-tight transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? 'text-gray-800 font-semibold' 
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Title */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-full">
            <div className="w-8 h-8 bg-medical-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{currentStep}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {steps[currentStep - 1]?.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Completa la información requerida para continuar
          </p>
        </div>
      </div>

      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{errors.general[0]}</span>
          </div>
        </div>
      )}

      {/* Form Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {currentStep === 1 && <Step1BasicInfo formData={formData} updateForm={updateForm} errors={errors} />}
            {currentStep === 2 && <Step2Representatives formData={formData} updateForm={updateForm} errors={errors} />}
            {currentStep === 3 && <Step3References formData={formData} updateForm={updateForm} errors={errors} />}
            {currentStep === 4 && <Step4AdditionalContacts formData={formData} updateForm={updateForm} errors={errors} />}
            {currentStep === 5 && <Step5ExtraInfo formData={formData} updateForm={updateForm} errors={errors} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium">Anterior</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentStep} de {steps.length}
          </span>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index + 1 <= currentStep 
                    ? 'bg-medical-primary' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 bg-medical-primary text-white rounded-xl hover:bg-medical-primary-dark transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="font-medium">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-medical-accent to-medical-primary text-white rounded-xl hover:from-medical-accent-dark hover:to-medical-primary-dark transform hover:scale-105 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Creando cuenta...</span>
              </>
            ) : (
              <>
                <Building className="w-4 h-4" />
                <span className="font-medium">Crear Cuenta</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Link para cambiar a login */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-medical-primary hover:text-medical-primary-dark font-medium"
          >
            Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

// Componente Paso 1: Información Básica
const Step1BasicInfo: React.FC<{
  formData: JuridicoFormData;
  updateForm: (field: keyof JuridicoFormData, value: string) => void;
  errors: Record<string, string[]>;
}> = ({ formData, updateForm, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Información Básica de la Empresa</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => updateForm('company_name', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Farmacia XYZ C.A."
          />
          {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RIF *
          </label>
          <input
            type="text"
            value={formData.rif}
            onChange={(e) => updateForm('rif', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.rif ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="J-12345678-9"
          />
          {errors.rif && <p className="text-red-500 text-sm mt-1">{errors.rif[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registro Mercantil *
          </label>
          <input
            type="text"
            value={formData.registro_mercantil}
            onChange={(e) => updateForm('registro_mercantil', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.registro_mercantil ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123456"
          />
          {errors.registro_mercantil && <p className="text-red-500 text-sm mt-1">{errors.registro_mercantil[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contacto@farmacia.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono Principal *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+58 212-1234567"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda Preferida
          </label>
          <select
            value={formData.preferred_currency}
            onChange={(e) => updateForm('preferred_currency', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          >
            <option value="VES">Bolívares (VES)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección del Establecimiento *
        </label>
        <textarea
          value={formData.direccion_establecimiento}
          onChange={(e) => updateForm('direccion_establecimiento', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.direccion_establecimiento ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          placeholder="Dirección completa del establecimiento"
        />
        {errors.direccion_establecimiento && <p className="text-red-500 text-sm mt-1">{errors.direccion_establecimiento[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateForm('password', e.target.value)}
              className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => updateForm('confirm_password', e.target.value)}
              className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
                errors.confirm_password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Repetir contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password[0]}</p>}
        </div>
      </div>
    </div>
  );
};

// Componente Paso 2: Representantes Legales
const Step2Representatives: React.FC<{
  formData: JuridicoFormData;
  updateForm: (field: keyof JuridicoFormData, value: string) => void;
  errors: Record<string, string[]>;
}> = ({ formData, updateForm, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Representantes Legales</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Representante Legal *
        </label>
        <input
          type="text"
          value={formData.representante_legal_nombre}
          onChange={(e) => updateForm('representante_legal_nombre', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.representante_legal_nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Juan Pérez"
        />
        {errors.representante_legal_nombre && <p className="text-red-500 text-sm mt-1">{errors.representante_legal_nombre[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cédula del Representante Legal *
        </label>
        <input
          type="text"
          value={formData.representante_legal_cedula}
          onChange={(e) => updateForm('representante_legal_cedula', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.representante_legal_cedula ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="V-12345678"
        />
        {errors.representante_legal_cedula && <p className="text-red-500 text-sm mt-1">{errors.representante_legal_cedula[0]}</p>}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Representantes Adicionales
      </label>
      <textarea
        value={formData.representantes_adicionales}
        onChange={(e) => updateForm('representantes_adicionales', e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
        rows={3}
        placeholder="Nombres separados por comas (opcional)"
      />
      <p className="text-xs text-gray-500 mt-1">Separa múltiples nombres con comas</p>
    </div>
  </div>
);

// Componente Paso 3: Referencias
const Step3References: React.FC<{
  formData: JuridicoFormData;
  updateForm: (field: keyof JuridicoFormData, value: string) => void;
  errors: Record<string, string[]>;
}> = ({ formData, updateForm, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Referencias Comerciales y Bancarias</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referencia Comercial/Proveedor *
        </label>
        <input
          type="text"
          value={formData.referencia_comercial_proveedor}
          onChange={(e) => updateForm('referencia_comercial_proveedor', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.referencia_comercial_proveedor ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre del proveedor de referencia"
        />
        {errors.referencia_comercial_proveedor && <p className="text-red-500 text-sm mt-1">{errors.referencia_comercial_proveedor[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referencia Bancaria *
        </label>
        <input
          type="text"
          value={formData.referencia_bancaria}
          onChange={(e) => updateForm('referencia_bancaria', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.referencia_bancaria ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Banco de referencia"
        />
        {errors.referencia_bancaria && <p className="text-red-500 text-sm mt-1">{errors.referencia_bancaria[0]}</p>}
      </div>
    </div>
  </div>
);

// Componente Paso 4: Contactos Adicionales
const Step4AdditionalContacts: React.FC<{
  formData: JuridicoFormData;
  updateForm: (field: keyof JuridicoFormData, value: string) => void;
  errors: Record<string, string[]>;
}> = ({ formData, updateForm, errors }) => (
  <div className="space-y-8">
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Contactos Adicionales</h3>
    
    {/* Dueño */}
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Información del Dueño</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.dueno_telefono}
            onChange={(e) => updateForm('dueno_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 414-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.dueno_email}
            onChange={(e) => updateForm('dueno_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="dueno@farmacia.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cumpleaños</label>
          <input
            type="date"
            value={formData.dueno_cumpleanos}
            onChange={(e) => updateForm('dueno_cumpleanos', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {/* Encargado de Compra */}
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Encargado de Compra</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.encargado_compra_telefono}
            onChange={(e) => updateForm('encargado_compra_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 414-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.encargado_compra_email}
            onChange={(e) => updateForm('encargado_compra_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="compras@farmacia.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cumpleaños</label>
          <input
            type="date"
            value={formData.encargado_compra_cumpleanos}
            onChange={(e) => updateForm('encargado_compra_cumpleanos', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {/* Encargado de Cobranza */}
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Encargado de Cobranza</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.encargado_cobranza_telefono}
            onChange={(e) => updateForm('encargado_cobranza_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 414-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.encargado_cobranza_email}
            onChange={(e) => updateForm('encargado_cobranza_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="cobranza@farmacia.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cumpleaños</label>
          <input
            type="date"
            value={formData.encargado_cobranza_cumpleanos}
            onChange={(e) => updateForm('encargado_cobranza_cumpleanos', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

// Componente Paso 5: Información Extra
const Step5ExtraInfo: React.FC<{
  formData: JuridicoFormData;
  updateForm: (field: keyof JuridicoFormData, value: string) => void;
  errors: Record<string, string[]>;
}> = ({ formData, updateForm, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Información Adicional</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Redes Sociales
        </label>
        <input
          type="text"
          value={formData.redes_sociales}
          onChange={(e) => updateForm('redes_sociales', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="@farmacia_xyz"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Página Web
        </label>
        <input
          type="url"
          value={formData.pagina_web}
          onChange={(e) => updateForm('pagina_web', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="https://www.farmacia.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código SICM
        </label>
        <input
          type="text"
          value={formData.codigo_sicm}
          onChange={(e) => updateForm('codigo_sicm', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="SICM123456"
        />
      </div>
    </div>

    <div className="bg-blue-50 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-2">¡Casi terminamos!</h4>
      <p className="text-gray-600">
        Revisa que toda la información esté correcta antes de crear tu cuenta. 
        Podrás modificar estos datos desde tu perfil una vez registrado.
      </p>
    </div>
  </div>
);

export default JuridicoRegisterForm; 
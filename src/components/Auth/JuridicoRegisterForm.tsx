import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building, Users, FileCheck, Phone, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';
import { validatePassword, validateEmail, validateRIF } from '../../services/AuthService';
import { JuridicoRegisterForm } from '../../types/auth';

interface Props {
  form: JuridicoRegisterForm;
  setForm: (form: JuridicoRegisterForm) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: Array<{ id: number; title: string; icon: any }>;
  onSubmit: () => void;
  loading: boolean;
}

export const JuridicoRegisterFormComponent: React.FC<Props> = ({
  form, setForm, currentStep, setCurrentStep, steps, onSubmit, loading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: keyof JuridicoRegisterForm, value: string) => {
    setForm({ ...form, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Validaciones paso 1
      if (!form.company_name.trim()) newErrors.company_name = 'El nombre de la empresa es requerido';
      if (!form.rif.trim()) newErrors.rif = 'El RIF es requerido';
      if (!form.registro_mercantil.trim()) newErrors.registro_mercantil = 'El registro mercantil es requerido';
      if (!form.email.trim()) newErrors.email = 'El email es requerido';
      if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido';
      if (!form.direccion_establecimiento.trim()) newErrors.direccion_establecimiento = 'La dirección es requerida';
      if (!form.password) newErrors.password = 'La contraseña es requerida';
      if (!form.confirm_password) newErrors.confirm_password = 'Confirmar contraseña es requerido';

      // Validaciones específicas
      if (form.email && !validateEmail(form.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (form.rif && !validateRIF(form.rif)) {
        newErrors.rif = 'Formato de RIF inválido (ej: J-12345678-9)';
      }

      if (form.password) {
        const passwordErrors = validatePassword(form.password);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors[0];
        }
      }

      if (form.password && form.confirm_password && form.password !== form.confirm_password) {
        newErrors.confirm_password = 'Las contraseñas no coinciden';
      }
    } else if (currentStep === 2) {
      // Validaciones paso 2
      if (!form.representante_legal_cedula.trim()) newErrors.representante_legal_cedula = 'La cédula del representante legal es requerida';
      if (!form.representante_legal_nombre.trim()) newErrors.representante_legal_nombre = 'El nombre del representante legal es requerido';
    } else if (currentStep === 3) {
      // Validaciones paso 3
      if (!form.referencia_comercial_proveedor.trim()) newErrors.referencia_comercial_proveedor = 'La referencia comercial es requerida';
      if (!form.referencia_bancaria.trim()) newErrors.referencia_bancaria = 'La referencia bancaria es requerida';
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

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit();
    }
  };

  return (
    <div>
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
                      ? 'text-medical-gray-800 font-semibold' 
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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-medical-blue-50 rounded-full">
            <div className="w-8 h-8 bg-medical-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{currentStep}</span>
            </div>
            <h3 className="text-lg font-bold text-medical-gray-800">
              {steps[currentStep - 1]?.title}
            </h3>
          </div>
          <p className="text-sm text-medical-gray-600 mt-2">
            Completa la información requerida para continuar
          </p>
        </div>
      </div>

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
          {currentStep === 1 && (
            <Step1BasicInfo 
              form={form} 
              updateForm={updateForm} 
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}
          {currentStep === 2 && <Step2Representatives form={form} updateForm={updateForm} errors={errors} />}
          {currentStep === 3 && <Step3References form={form} updateForm={updateForm} errors={errors} />}
          {currentStep === 4 && <Step4AdditionalContacts form={form} updateForm={updateForm} errors={errors} />}
          {currentStep === 5 && <Step5ExtraInfo form={form} updateForm={updateForm} errors={errors} />}
        </motion.div>
      </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 text-medical-gray-600 hover:text-medical-gray-800 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium">Anterior</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-medical-gray-500">
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
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-medical-accent to-medical-primary text-white rounded-xl hover:from-medical-accent-dark hover:to-medical-primary-dark transform hover:scale-105 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
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
    </div>
  );
};

// Componente Paso 1: Información Básica
const Step1BasicInfo: React.FC<{
  form: JuridicoRegisterForm;
  updateForm: (field: keyof JuridicoRegisterForm, value: string) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}> = ({ form, updateForm, errors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }) => (
  <div className="space-y-6">
    {/* Información básica de la empresa */}
    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Nombre de la Empresa *
      </label>
      <input
        type="text"
        value={form.company_name}
        onChange={(e) => updateForm('company_name', e.target.value)}
        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
          errors.company_name ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Farmacia San José C.A."
        required
      />
      {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          RIF *
        </label>
        <input
          type="text"
          value={form.rif}
          onChange={(e) => updateForm('rif', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.rif ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="J-12345678-9"
          required
        />
        {errors.rif && <p className="text-red-500 text-sm mt-1">{errors.rif}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Registro Mercantil *
        </label>
        <input
          type="text"
          value={form.registro_mercantil}
          onChange={(e) => updateForm('registro_mercantil', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.registro_mercantil ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Número de registro"
          required
        />
        {errors.registro_mercantil && <p className="text-red-500 text-sm mt-1">{errors.registro_mercantil}</p>}
      </div>
    </div>

    {/* Email y teléfono */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Email Corporativo *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="contacto@farmacia.com"
          required
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Teléfono Principal *
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+58 212-1234567"
          required
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
    </div>

    {/* Dirección */}
    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Dirección del Establecimiento *
      </label>
      <textarea
        value={form.direccion_establecimiento}
        onChange={(e) => updateForm('direccion_establecimiento', e.target.value)}
        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
          errors.direccion_establecimiento ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Dirección completa del establecimiento"
        rows={3}
        required
      />
      {errors.direccion_establecimiento && <p className="text-red-500 text-sm mt-1">{errors.direccion_establecimiento}</p>}
    </div>

    {/* Contraseñas */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Contraseña *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => updateForm('password', e.target.value)}
            className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Confirmar Contraseña *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirm_password}
            onChange={(e) => updateForm('confirm_password', e.target.value)}
            className={`w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.confirm_password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Repetir contraseña"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
      </div>
    </div>

    {/* Moneda preferida */}
    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Moneda Preferida *
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => updateForm('preferred_currency', 'VES')}
          className={`p-3 rounded-xl border-2 transition-all ${
            form.preferred_currency === 'VES'
              ? 'border-medical-primary bg-medical-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          VES (Bolívares)
        </button>
        <button
          type="button"
          onClick={() => updateForm('preferred_currency', 'USD')}
          className={`p-3 rounded-xl border-2 transition-all ${
            form.preferred_currency === 'USD'
              ? 'border-medical-primary bg-medical-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          USD (Dólares)
        </button>
      </div>
    </div>
  </div>
);

// Componente Paso 2: Representantes Legales
const Step2Representatives: React.FC<{
  form: JuridicoRegisterForm;
  updateForm: (field: keyof JuridicoRegisterForm, value: string) => void;
  errors: Record<string, string>;
}> = ({ form, updateForm, errors }) => (
  <div className="space-y-6">
    <div className="bg-blue-50 p-4 rounded-xl">
      <h4 className="font-semibold text-medical-gray-800 mb-2">Representante Legal Principal</h4>
      <p className="text-sm text-medical-gray-600">Información del representante legal principal de la empresa</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Cédula del Representante Legal *
        </label>
        <input
          type="text"
          value={form.representante_legal_cedula}
          onChange={(e) => updateForm('representante_legal_cedula', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.representante_legal_cedula ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="V-12345678"
          required
        />
        {errors.representante_legal_cedula && <p className="text-red-500 text-sm mt-1">{errors.representante_legal_cedula}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Nombre Completo *
        </label>
        <input
          type="text"
          value={form.representante_legal_nombre}
          onChange={(e) => updateForm('representante_legal_nombre', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.representante_legal_nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre y apellido completo"
          required
        />
        {errors.representante_legal_nombre && <p className="text-red-500 text-sm mt-1">{errors.representante_legal_nombre}</p>}
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Representantes Adicionales
      </label>
      <textarea
        value={form.representantes_adicionales}
        onChange={(e) => updateForm('representantes_adicionales', e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
        placeholder="Cédulas de representantes adicionales separadas por comas (ej: V-11111111, V-22222222)"
        rows={3}
      />
      <p className="text-sm text-gray-500 mt-1">Opcional: Ingrese las cédulas separadas por comas</p>
    </div>
  </div>
);

// Componente Paso 3: Referencias
const Step3References: React.FC<{
  form: JuridicoRegisterForm;
  updateForm: (field: keyof JuridicoRegisterForm, value: string) => void;
  errors: Record<string, string>;
}> = ({ form, updateForm, errors }) => (
  <div className="space-y-6">
    <div className="bg-green-50 p-4 rounded-xl">
      <h4 className="font-semibold text-medical-gray-800 mb-2">Referencias Comerciales y Bancarias</h4>
      <p className="text-sm text-medical-gray-600">Información para verificar la solvencia comercial de la empresa</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Referencia Comercial de Proveedor *
      </label>
      <textarea
        value={form.referencia_comercial_proveedor}
        onChange={(e) => updateForm('referencia_comercial_proveedor', e.target.value)}
        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
          errors.referencia_comercial_proveedor ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Nombre del proveedor, contacto y teléfono"
        rows={3}
        required
      />
      {errors.referencia_comercial_proveedor && <p className="text-red-500 text-sm mt-1">{errors.referencia_comercial_proveedor}</p>}
    </div>

    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Referencia Bancaria *
      </label>
      <textarea
        value={form.referencia_bancaria}
        onChange={(e) => updateForm('referencia_bancaria', e.target.value)}
        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
          errors.referencia_bancaria ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Banco, número de cuenta y contacto"
        rows={3}
        required
      />
      {errors.referencia_bancaria && <p className="text-red-500 text-sm mt-1">{errors.referencia_bancaria}</p>}
    </div>
  </div>
);

// Componente Paso 4: Contactos Adicionales
const Step4AdditionalContacts: React.FC<{
  form: JuridicoRegisterForm;
  updateForm: (field: keyof JuridicoRegisterForm, value: string) => void;
  errors: Record<string, string>;
}> = ({ form, updateForm, errors }) => (
  <div className="space-y-6">
    <div className="bg-purple-50 p-4 rounded-xl">
      <h4 className="font-semibold text-medical-gray-800 mb-2">Contactos Especializados</h4>
      <p className="text-sm text-medical-gray-600">Información de contactos específicos para diferentes áreas (opcional)</p>
    </div>

    {/* Dueño */}
    <div className="border border-gray-200 rounded-xl p-4">
      <h5 className="font-semibold text-medical-gray-700 mb-4">Información del Dueño</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={form.dueno_telefono}
            onChange={(e) => updateForm('dueno_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 412-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.dueno_email}
            onChange={(e) => updateForm('dueno_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="dueno@empresa.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Cumpleaños
          </label>
          <input
            type="date"
            value={form.dueno_cumpleanos}
            onChange={(e) => updateForm('dueno_cumpleanos', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {/* Encargado de Compras */}
    <div className="border border-gray-200 rounded-xl p-4">
      <h5 className="font-semibold text-medical-gray-700 mb-4">Encargado de Compras</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={form.encargado_compra_telefono}
            onChange={(e) => updateForm('encargado_compra_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 412-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.encargado_compra_email}
            onChange={(e) => updateForm('encargado_compra_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="compras@empresa.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Cumpleaños
          </label>
          <input
            type="date"
            value={form.encargado_compra_cumpleanos}
            onChange={(e) => updateForm('encargado_compra_cumpleanos', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {/* Encargado de Cobranzas */}
    <div className="border border-gray-200 rounded-xl p-4">
      <h5 className="font-semibold text-medical-gray-700 mb-4">Encargado de Cobranzas</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={form.encargado_cobranza_telefono}
            onChange={(e) => updateForm('encargado_cobranza_telefono', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="+58 412-1234567"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.encargado_cobranza_email}
            onChange={(e) => updateForm('encargado_cobranza_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            placeholder="cobranzas@empresa.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Cumpleaños
          </label>
          <input
            type="date"
            value={form.encargado_cobranza_cumpleanos}
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
  form: JuridicoRegisterForm;
  updateForm: (field: keyof JuridicoRegisterForm, value: string) => void;
  errors: Record<string, string>;
}> = ({ form, updateForm, errors }) => (
  <div className="space-y-6">
    <div className="bg-orange-50 p-4 rounded-xl">
      <h4 className="font-semibold text-medical-gray-800 mb-2">Información Adicional</h4>
      <p className="text-sm text-medical-gray-600">Datos complementarios para completar el perfil de la empresa</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Redes Sociales
        </label>
        <input
          type="text"
          value={form.redes_sociales}
          onChange={(e) => updateForm('redes_sociales', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="@farmacia_instagram, facebook.com/farmacia"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Página Web
        </label>
        <input
          type="url"
          value={form.pagina_web}
          onChange={(e) => updateForm('pagina_web', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="https://www.farmacia.com"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
        Código SICM
      </label>
      <input
        type="text"
        value={form.codigo_sicm}
        onChange={(e) => updateForm('codigo_sicm', e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
        placeholder="Código del Sistema Integrado de Control de Medicamentos"
      />
      <p className="text-sm text-gray-500 mt-1">Código SICM si aplica para su establecimiento</p>
    </div>

    <div className="bg-green-50 p-4 rounded-xl">
      <h5 className="font-semibold text-green-800 mb-2">¡Casi terminamos!</h5>
      <p className="text-sm text-green-700">
        Revise toda la información antes de crear su cuenta. Podrá editar estos datos desde su perfil una vez registrado.
      </p>
    </div>
  </div>
); 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  FileText, 
  CheckCircle,
  Users,
  FileCheck,
  Globe,
  AlertCircle
} from 'lucide-react';
import { JuridicoRegisterData } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { FormStepper } from './FormStepper';
import { FormNavigation } from './FormNavigation';
import { InputField } from './InputField';

interface JuridicoRegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

interface JuridicoFormData extends Omit<JuridicoRegisterData, 'representantes_adicionales'> {
  confirm_password: string;
  representantes_adicionales: string;
}

const steps = [
  { id: 1, title: 'Información Básica', icon: Building },
  { id: 2, title: 'Representantes', icon: Users },
  { id: 3, title: 'Referencias', icon: FileCheck },
  { id: 4, title: 'Contactos', icon: Phone },
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (currentStep === 1) {
      if (!formData.company_name.trim()) newErrors.company_name = ['El nombre de la empresa es requerido'];
      if (!formData.rif.trim()) newErrors.rif = ['El RIF es requerido'];
      if (!formData.registro_mercantil.trim()) newErrors.registro_mercantil = ['El registro mercantil es requerido'];
      if (!formData.email.trim()) newErrors.email = ['El email es requerido'];
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = ['Email inválido'];
      if (!formData.phone.trim()) newErrors.phone = ['El teléfono es requerido'];
      if (!formData.direccion_establecimiento.trim()) newErrors.direccion_establecimiento = ['La dirección es requerida'];
      if (!formData.password) newErrors.password = ['La contraseña es requerida'];
      else if (formData.password.length < 8) newErrors.password = ['La contraseña debe tener al menos 8 caracteres'];
      if (formData.password !== formData.confirm_password) newErrors.confirm_password = ['Las contraseñas no coinciden'];
    } else if (currentStep === 2) {
      if (!formData.representante_legal_cedula.trim()) newErrors.representante_legal_cedula = ['La cédula del representante es requerida'];
      if (!formData.representante_legal_nombre.trim()) newErrors.representante_legal_nombre = ['El nombre del representante es requerido'];
    } else if (currentStep === 3) {
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
        setErrors(response.errors || { general: [response.message] });
      }
    } catch (error) {
      setErrors({ general: ['Error de conexión. Intente nuevamente.'] });
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Registro Exitoso!</h3>
        <p className="text-gray-600">{successMessage}</p>
        <p className="text-sm text-gray-500 mt-4">Redirigiendo al login...</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateForm(e.target.id as keyof JuridicoFormData, e.target.value);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <FormStepper steps={steps} currentStep={currentStep} />
      </div>

      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{errors.general[0]}</span>
        </div>
      )}
      
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{steps[currentStep - 1].title}</h3>
            {currentStep === 1 && <Step1BasicInfo formData={formData} onChange={handleInputChange} errors={errors} />}
            {currentStep === 2 && <Step2Representatives formData={formData} onChange={handleInputChange} errors={errors} />}
            {currentStep === 3 && <Step3References formData={formData} onChange={handleInputChange} errors={errors} />}
            {currentStep === 4 && <Step4AdditionalContacts formData={formData} onChange={handleInputChange} errors={errors} />}
            {currentStep === 5 && <Step5ExtraInfo formData={formData} onChange={handleInputChange} errors={errors} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <FormNavigation 
        currentStep={currentStep}
        totalSteps={steps.length}
        isLoading={isLoading}
        onPrevStep={prevStep}
        onNextStep={nextStep}
        onSubmit={handleSubmit}
      />

      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

// Common props for steps
type StepProps = {
  formData: JuridicoFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, any>;
};

const Step1BasicInfo: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField id="company_name" label="Nombre de la Empresa" value={formData.company_name} onChange={onChange} error={errors.company_name?.[0]} required />
      <InputField id="rif" label="RIF" value={formData.rif} onChange={onChange} error={errors.rif?.[0]} required />
      <InputField id="registro_mercantil" label="Registro Mercantil" value={formData.registro_mercantil} onChange={onChange} error={errors.registro_mercantil?.[0]} required />
      <InputField id="email" label="Email" type="email" value={formData.email} onChange={onChange} error={errors.email?.[0]} required />
      <InputField id="phone" label="Teléfono Principal" type="tel" value={formData.phone} onChange={onChange} error={errors.phone?.[0]} required />
      <div className="md:col-span-2">
        <InputField id="direccion_establecimiento" label="Dirección del Establecimiento" value={formData.direccion_establecimiento} onChange={onChange} error={errors.direccion_establecimiento?.[0]} isTextArea required />
      </div>
      <InputField id="password" label="Contraseña" type="password" value={formData.password} onChange={onChange} error={errors.password?.[0]} required />
      <InputField id="confirm_password" label="Confirmar Contraseña" type="password" value={formData.confirm_password} onChange={onChange} error={errors.confirm_password?.[0]} required />
    </div>
);

const Step2Representatives: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="representante_legal_nombre" label="Nombre del Representante Legal" value={formData.representante_legal_nombre} onChange={onChange} error={errors.representante_legal_nombre?.[0]} required />
        <InputField id="representante_legal_cedula" label="Cédula del Representante Legal" value={formData.representante_legal_cedula} onChange={onChange} error={errors.representante_legal_cedula?.[0]} required />
        <div className="md:col-span-2">
            <InputField id="representantes_adicionales" label="Representantes Adicionales" value={formData.representantes_adicionales} onChange={onChange} error={errors.representantes_adicionales?.[0]} isTextArea placeholder="Nombres separados por comas (opcional)" />
        </div>
    </div>
);

const Step3References: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField id="referencia_comercial_proveedor" label="Referencia Comercial/Proveedor" value={formData.referencia_comercial_proveedor} onChange={onChange} error={errors.referencia_comercial_proveedor?.[0]} required />
        <InputField id="referencia_bancaria" label="Referencia Bancaria" value={formData.referencia_bancaria} onChange={onChange} error={errors.referencia_bancaria?.[0]} required />
    </div>
);

const Step4AdditionalContacts: React.FC<StepProps> = ({ formData, onChange }) => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-800 mb-4">Información del Dueño</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="dueno_telefono" label="Teléfono" type="tel" value={formData.dueno_telefono} onChange={onChange} />
            <InputField id="dueno_email" label="Email" type="email" value={formData.dueno_email} onChange={onChange} />
            <InputField id="dueno_cumpleanos" label="Cumpleaños" type="date" value={formData.dueno_cumpleanos} onChange={onChange} />
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-800 mb-4">Encargado de Compra</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="encargado_compra_telefono" label="Teléfono" type="tel" value={formData.encargado_compra_telefono} onChange={onChange} />
            <InputField id="encargado_compra_email" label="Email" type="email" value={formData.encargado_compra_email} onChange={onChange} />
            <InputField id="encargado_compra_cumpleanos" label="Cumpleaños" type="date" value={formData.encargado_compra_cumpleanos} onChange={onChange} />
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-800 mb-4">Encargado de Cobranza</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="encargado_cobranza_telefono" label="Teléfono" type="tel" value={formData.encargado_cobranza_telefono} onChange={onChange} />
            <InputField id="encargado_cobranza_email" label="Email" type="email" value={formData.encargado_cobranza_email} onChange={onChange} />
            <InputField id="encargado_cobranza_cumpleanos" label="Cumpleaños" type="date" value={formData.encargado_cobranza_cumpleanos} onChange={onChange} />
        </div>
      </div>
    </div>
);

const Step5ExtraInfo: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField id="redes_sociales" label="Redes Sociales" value={formData.redes_sociales} onChange={onChange} error={errors.redes_sociales?.[0]} placeholder="@farmacia_xyz" />
            <InputField id="pagina_web" label="Página Web" type="url" value={formData.pagina_web} onChange={onChange} error={errors.pagina_web?.[0]} placeholder="https://www.farmacia.com" />
            <InputField id="codigo_sicm" label="Código SICM" value={formData.codigo_sicm} onChange={onChange} error={errors.codigo_sicm?.[0]} placeholder="SICM123456" />
        </div>
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center">
            <p className="font-semibold">¡Casi listo!</p>
            <p className="text-sm">Revisa que toda la información sea correcta antes de finalizar.</p>
        </div>
    </div>
);

export default JuridicoRegisterForm; 
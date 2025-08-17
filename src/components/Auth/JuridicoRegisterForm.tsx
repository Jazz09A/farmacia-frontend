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
import { useAuth } from '../../contexts/AuthContext';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Por ahora, solo guardamos los nombres de los archivos como strings
      // ya que el tipo espera string[]. Si necesitas subir los archivos,
      // esto requerirá un manejo más complejo (e.g., FormData).
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setFormData(prev => ({ ...prev, fotos_establecimiento: fileNames }));
      if (errors.fotos_establecimiento) {
        setErrors(prev => ({ ...prev, fotos_establecimiento: [] }));
      }
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 sm:pr-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6 mt-4">
            <FormStepper steps={steps} currentStep={currentStep} />
          </div>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg relative mb-3 sm:mb-4 flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{errors.general[0]}</span>
            </div>
          )}
          
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">{steps[currentStep - 1].title}</h3>
                {currentStep === 1 && <Step1BasicInfo formData={formData} onChange={handleInputChange} errors={errors} />}
                {currentStep === 2 && <Step2Representatives formData={formData} onChange={handleInputChange} errors={errors} />}
                {currentStep === 3 && <Step3References formData={formData} onChange={handleInputChange} errors={errors} />}
                {currentStep === 4 && <Step4AdditionalContacts formData={formData} onChange={handleInputChange} errors={errors} />}
                {currentStep === 5 && <Step5ExtraInfo formData={formData} onChange={handleInputChange} onFileChange={handleFileChange} errors={errors} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 w-full max-w-4xl mx-auto">
        <FormNavigation 
          currentStep={currentStep}
          totalSteps={steps.length}
          isLoading={isLoading}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
        />

        <div className="text-center mt-3 sm:mt-4">
          <p className="text-gray-600 text-sm">
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
    </div>
  );
};

// Common props for steps
type StepProps = {
  formData: JuridicoFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string[]>;
};

interface Step5Props extends StepProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Step1BasicInfo: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="representante_legal_nombre" label="Nombre del Representante Legal" value={formData.representante_legal_nombre} onChange={onChange} error={errors.representante_legal_nombre?.[0]} required />
        <InputField id="representante_legal_cedula" label="Cédula del Representante Legal" value={formData.representante_legal_cedula} onChange={onChange} error={errors.representante_legal_cedula?.[0]} required />
        <div className="md:col-span-2">
            <InputField id="representantes_adicionales" label="Representantes Adicionales" value={formData.representantes_adicionales} onChange={onChange} error={errors.representantes_adicionales?.[0]} isTextArea placeholder="Nombres separados por comas (opcional)" />
        </div>
    </div>
);

const Step3References: React.FC<StepProps> = ({ formData, onChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="referencia_comercial_proveedor" label="Referencia Comercial/Proveedor" value={formData.referencia_comercial_proveedor} onChange={onChange} error={errors.referencia_comercial_proveedor?.[0]} required />
        <InputField id="referencia_bancaria" label="Referencia Bancaria" value={formData.referencia_bancaria} onChange={onChange} error={errors.referencia_bancaria?.[0]} required />
    </div>
);

const Step4AdditionalContacts: React.FC<StepProps> = ({ formData, onChange }) => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-800 mb-2">Información del Dueño</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="dueno_telefono" label="Teléfono" type="tel" value={formData.dueno_telefono} onChange={onChange} />
            <InputField id="dueno_email" label="Email" type="email" value={formData.dueno_email} onChange={onChange} />
            <InputField id="dueno_cumpleanos" label="Cumpleaños" type="date" value={formData.dueno_cumpleanos} onChange={onChange} />
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-800 mb-2">Encargado de Compra</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="encargado_compra_telefono" label="Teléfono" type="tel" value={formData.encargado_compra_telefono} onChange={onChange} />
            <InputField id="encargado_compra_email" label="Email" type="email" value={formData.encargado_compra_email} onChange={onChange} />
            <InputField id="encargado_compra_cumpleanos" label="Cumpleaños" type="date" value={formData.encargado_compra_cumpleanos} onChange={onChange} />
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-800 mb-2">Encargado de Cobranza</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg">
            <InputField id="encargado_cobranza_telefono" label="Teléfono" type="tel" value={formData.encargado_cobranza_telefono} onChange={onChange} />
            <InputField id="encargado_cobranza_email" label="Email" type="email" value={formData.encargado_cobranza_email} onChange={onChange} />
            <InputField id="encargado_cobranza_cumpleanos" label="Cumpleaños" type="date" value={formData.encargado_cobranza_cumpleanos} onChange={onChange} />
        </div>
      </div>
    </div>
);

const Step5ExtraInfo: React.FC<Step5Props> = ({ formData, onChange, onFileChange, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField id="redes_sociales" label="Redes Sociales" value={formData.redes_sociales} onChange={onChange} error={errors.redes_sociales?.[0]} placeholder="@farmacia_xyz" />
            <InputField id="pagina_web" label="Página Web" type="url" value={formData.pagina_web} onChange={onChange} error={errors.pagina_web?.[0]} placeholder="https://www.farmacia.com" />
            <div className="md:col-span-2">
                <InputField id="codigo_sicm" label="Código SICM" value={formData.codigo_sicm} onChange={onChange} error={errors.codigo_sicm?.[0]} placeholder="SICM123456" />
            </div>
        </div>
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center">
            <p className="font-semibold">¡Casi listo!</p>
            <p className="text-sm">Revisa que toda la información sea correcta antes de finalizar.</p>
        </div>
        <div className="md:col-span-2">
            <label htmlFor="fotos_establecimiento" className="block text-sm font-medium text-gray-700 mb-1">
              Fotos del Establecimiento
            </label>
            <input
              id="fotos_establecimiento"
              name="fotos_establecimiento"
              type="file"
              multiple
              onChange={onFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.fotos_establecimiento && <p className="mt-1 text-xs text-red-500">{errors.fotos_establecimiento[0]}</p>}
            {formData.fotos_establecimiento.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p>{formData.fotos_establecimiento.length} archivo(s) seleccionado(s):</p>
                <ul className="list-disc list-inside">
                  {formData.fotos_establecimiento.map((name, index) => <li key={index}>{name}</li>)}
                </ul>
              </div>
            )}
          </div>
    </div>
);

export default JuridicoRegisterForm; 
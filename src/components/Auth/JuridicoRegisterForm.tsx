import React, { useState } from 'react';
import { Building, Mail, Phone, Lock, User, FileText, Calendar, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { JuridicoRegisterData } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';

interface JuridicoRegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const JuridicoRegisterForm: React.FC<JuridicoRegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { registerJuridico } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<JuridicoRegisterData>({
    email: '',
    phone: '',
    preferred_currency: 'VES',
    user_type: 'juridico',
    company_name: '',
    rif: '',
    registro_mercantil: '',
    representante_legal_cedula: '',
    representante_legal_nombre: '',
    representantes_adicionales: [],
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
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleRepresentantesAdicionalesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const representantes = value.split('\n').filter(rep => rep.trim() !== '');
    setFormData(prev => ({
      ...prev,
      representantes_adicionales: representantes
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Validaciones básicas
    if (!formData.email) newErrors.email = ['El email es requerido'];
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = ['Email inválido'];

    if (!formData.phone) newErrors.phone = ['El teléfono es requerido'];
    if (!formData.company_name) newErrors.company_name = ['El nombre de la empresa es requerido'];
    if (!formData.rif) newErrors.rif = ['El RIF es requerido'];
    if (!formData.registro_mercantil) newErrors.registro_mercantil = ['El registro mercantil es requerido'];
    if (!formData.representante_legal_cedula) newErrors.representante_legal_cedula = ['La cédula del representante legal es requerida'];
    if (!formData.representante_legal_nombre) newErrors.representante_legal_nombre = ['El nombre del representante legal es requerido'];
    if (!formData.direccion_establecimiento) newErrors.direccion_establecimiento = ['La dirección del establecimiento es requerida'];

    // Validaciones de contraseña
    if (!formData.password) {
      newErrors.password = ['La contraseña es requerida'];
    } else if (formData.password.length < 8) {
      newErrors.password = ['La contraseña debe tener al menos 8 caracteres'];
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirm_password = ['Las contraseñas no coinciden'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await registerJuridico(formData);
      
      if (response.success) {
        setSuccessMessage(response.message);
        
        // Redirigir al login después de 2 segundos
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{errors.general[0]}</span>
          </div>
        </div>
      )}

      {/* Información básica de la empresa */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Información de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.company_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Farmacia XYZ C.A."
            />
            {errors.company_name && (
              <p className="text-red-500 text-xs mt-1">{errors.company_name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RIF *
            </label>
            <input
              type="text"
              name="rif"
              value={formData.rif}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.rif ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="J-12345678-9"
            />
            {errors.rif && (
              <p className="text-red-500 text-xs mt-1">{errors.rif[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registro Mercantil *
            </label>
            <input
              type="text"
              name="registro_mercantil"
              value={formData.registro_mercantil}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.registro_mercantil ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123456"
            />
            {errors.registro_mercantil && (
              <p className="text-red-500 text-xs mt-1">{errors.registro_mercantil[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código SICM
            </label>
            <input
              type="text"
              name="codigo_sicm"
              value={formData.codigo_sicm}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="SICM123456"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección del Establecimiento *
          </label>
          <textarea
            name="direccion_establecimiento"
            value={formData.direccion_establecimiento}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
              errors.direccion_establecimiento ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Dirección completa del establecimiento"
          />
          {errors.direccion_establecimiento && (
            <p className="text-red-500 text-xs mt-1">{errors.direccion_establecimiento[0]}</p>
          )}
        </div>
      </div>

      {/* Representante Legal */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Representante Legal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="representante_legal_nombre"
              value={formData.representante_legal_nombre}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.representante_legal_nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Juan Pérez"
            />
            {errors.representante_legal_nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.representante_legal_nombre[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula *
            </label>
            <input
              type="text"
              name="representante_legal_cedula"
              value={formData.representante_legal_cedula}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.representante_legal_cedula ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="V-12345678"
            />
            {errors.representante_legal_cedula && (
              <p className="text-red-500 text-xs mt-1">{errors.representante_legal_cedula[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Representantes Adicionales
          </label>
          <textarea
            value={formData.representantes_adicionales.join('\n')}
            onChange={handleRepresentantesAdicionalesChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            placeholder="Un representante por línea (opcional)"
          />
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Información de Contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Principal *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="empresa@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono Principal *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+58 412 1234567"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda Preferida
            </label>
            <select
              name="preferred_currency"
              value={formData.preferred_currency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="VES">Bolívares (VES)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referencias */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Referencias
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia Comercial/Proveedor
            </label>
            <input
              type="text"
              name="referencia_comercial_proveedor"
              value={formData.referencia_comercial_proveedor}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="Nombre del proveedor de referencia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia Bancaria
            </label>
            <input
              type="text"
              name="referencia_bancaria"
              value={formData.referencia_bancaria}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="Banco de referencia"
            />
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Seguridad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                errors.confirm_password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Repetir contraseña"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Registrando...
          </>
        ) : (
          'Registrar Empresa'
        )}
      </button>

      {/* Link para cambiar a login */}
      <div className="text-center">
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
    </form>
  );
};

export default JuridicoRegisterForm; 
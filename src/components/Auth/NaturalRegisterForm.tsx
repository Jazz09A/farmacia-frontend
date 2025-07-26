import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Calendar, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { NaturalRegisterData } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';

interface NaturalRegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const NaturalRegisterForm: React.FC<NaturalRegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { registerNatural } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<NaturalRegisterData>({
    email: '',
    phone: '',
    preferred_currency: 'VES',
    user_type: 'natural',
    first_name: '',
    last_name: '',
    cedula: '',
    fecha_nacimiento: '',
    direccion: '',
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Validaciones básicas
    if (!formData.email) newErrors.email = ['El email es requerido'];
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = ['Email inválido'];

    if (!formData.phone) newErrors.phone = ['El teléfono es requerido'];
    if (!formData.first_name) newErrors.first_name = ['El nombre es requerido'];
    if (!formData.last_name) newErrors.last_name = ['El apellido es requerido'];
    if (!formData.cedula) newErrors.cedula = ['La cédula es requerida'];
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = ['La fecha de nacimiento es requerida'];
    if (!formData.direccion) newErrors.direccion = ['La dirección es requerida'];

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
      const response = await registerNatural(formData);
      
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
          Registro Personal
        </h2>
        <p className="text-gray-600 mt-2">
          Crea tu cuenta personal para acceder a todos nuestros servicios
        </p>
      </div>

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

        {/* Información personal */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tu apellido"
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                  errors.cedula ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="V-12345678"
              />
              {errors.cedula && (
                <p className="text-red-500 text-xs mt-1">{errors.cedula[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                    errors.fecha_nacimiento ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.fecha_nacimiento && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento[0]}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                rows={3}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                  errors.direccion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tu dirección completa"
              />
            </div>
            {errors.direccion && (
              <p className="text-red-500 text-xs mt-1">{errors.direccion[0]}</p>
            )}
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Información de Contacto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+58 412 1234567"
                />
              </div>
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
            'Crear Cuenta'
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
    </div>
  );
};

export default NaturalRegisterForm; 
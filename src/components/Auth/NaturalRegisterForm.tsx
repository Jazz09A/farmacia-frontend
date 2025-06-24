import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Calendar, MapPin, Loader2 } from 'lucide-react';
import { validatePassword, validateEmail, validateCedula } from '../../services/AuthService';
import { NaturalRegisterForm } from '../../types/auth';

interface Props {
  form: NaturalRegisterForm;
  setForm: (form: NaturalRegisterForm) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const NaturalRegisterFormComponent: React.FC<Props> = ({ form, setForm, onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: keyof NaturalRegisterForm, value: string) => {
    setForm({ ...form, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones requeridas
    if (!form.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
    if (!form.last_name.trim()) newErrors.last_name = 'El apellido es requerido';
    if (!form.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
    if (!form.email.trim()) newErrors.email = 'El email es requerido';
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!form.password) newErrors.password = 'La contraseña es requerida';
    if (!form.confirm_password) newErrors.confirm_password = 'Confirmar contraseña es requerido';

    // Validaciones específicas
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (form.cedula && !validateCedula(form.cedula)) {
      newErrors.cedula = 'Formato de cédula inválido (ej: V-12345678)';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Información Personal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => updateForm('first_name', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tu nombre"
            required
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => updateForm('last_name', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tu apellido"
            required
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
      </div>

      {/* Cédula */}
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          Cédula de Identidad *
        </label>
        <input
          type="text"
          value={form.cedula}
          onChange={(e) => updateForm('cedula', e.target.value)}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
            errors.cedula ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="V-12345678"
          required
        />
        {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
      </div>

      {/* Email y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="tu@email.com"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+58 412-1234567"
            required
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Fecha de Nacimiento */}
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Fecha de Nacimiento
        </label>
        <input
          type="date"
          value={form.birth_date}
          onChange={(e) => updateForm('birth_date', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
        />
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Dirección
        </label>
        <textarea
          value={form.address}
          onChange={(e) => updateForm('address', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-primary focus:border-transparent"
          placeholder="Tu dirección completa"
          rows={3}
        />
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Moneda Preferida */}
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
            <span className="font-semibold">VES (Bolívares)</span>
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
            <span className="font-semibold">USD (Dólares)</span>
          </button>
        </div>
      </div>

      {/* Botón de registro */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-medical-primary text-white font-semibold rounded-xl hover:bg-medical-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creando cuenta...
          </div>
        ) : (
          'Crear Cuenta'
        )}
      </button>
    </motion.div>
  );
}; 
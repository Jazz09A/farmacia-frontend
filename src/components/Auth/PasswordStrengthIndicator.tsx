import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  icon: React.ElementType;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword: string;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  confirmPassword,
  showRequirements = true
}) => {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'Mínimo 8 caracteres',
      validator: (pwd) => pwd.length >= 8,
      icon: CheckCircle
    },
    {
      id: 'uppercase',
      label: 'Al menos una mayúscula',
      validator: (pwd) => /[A-Z]/.test(pwd),
      icon: CheckCircle
    },
    {
      id: 'lowercase',
      label: 'Al menos una minúscula',
      validator: (pwd) => /[a-z]/.test(pwd),
      icon: CheckCircle
    },
    {
      id: 'number',
      label: 'Al menos un número',
      validator: (pwd) => /\d/.test(pwd),
      icon: CheckCircle
    },
    {
      id: 'special',
      label: 'Al menos un carácter especial',
      validator: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      icon: CheckCircle
    }
  ];

  const getPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    if (pwd.length === 0) return 'weak';
    
    const passedRequirements = requirements.filter(req => req.validator(pwd)).length;
    const totalRequirements = requirements.length;
    
    if (passedRequirements === totalRequirements && pwd.length >= 12) return 'strong';
    if (passedRequirements >= 4) return 'medium';
    return 'weak';
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'strong': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStrengthText = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  if (!showRequirements) return null;

  return (
    <div className="space-y-3">
      {/* Barra de fortaleza */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Fortaleza de la contraseña:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(strength)}`}>
            {getStrengthText(strength)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength === 'weak' ? 'bg-red-500 w-1/3' :
              strength === 'medium' ? 'bg-yellow-500 w-2/3' :
              'bg-green-500 w-full'
            }`}
          />
        </div>
      </div>

      {/* Requisitos */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Requisitos:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {requirements.map((req) => {
            const isValid = req.validator(password);
            const Icon = isValid ? CheckCircle : XCircle;
            const iconColor = isValid ? 'text-green-500' : 'text-red-500';
            
            return (
              <div key={req.id} className="flex items-center space-x-2 text-sm">
                <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                <span className={isValid ? 'text-gray-700' : 'text-gray-500'}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmación de contraseña */}
      {confirmPassword.length > 0 && (
        <div className="flex items-center space-x-2 text-sm">
          {passwordsMatch ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={passwordsMatch ? 'text-green-700' : 'text-red-700'}>
            {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
          </span>
        </div>
      )}

      {/* Consejos de seguridad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejos de seguridad:</p>
            <ul className="space-y-1 text-xs">
              <li>• Usa una contraseña única que no uses en otros sitios</li>
              <li>• Evita información personal como fechas de nacimiento</li>
              <li>• Considera usar un gestor de contraseñas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

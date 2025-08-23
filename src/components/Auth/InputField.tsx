
import React, { useState } from 'react';
import { Eye, EyeOff, Calendar } from 'lucide-react';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  isTextArea?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  isTextArea = false,
  required = false,
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isDate = type === 'date';

  const commonProps = {
    id,
    value,
    onChange,
    placeholder,
    required,
    className: `w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      error ? 'border-red-500 ring-red-500' : 'border-gray-300'
    } ${isPassword || isDate ? 'pr-10' : ''}`,
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      <div className="relative">
        {isTextArea ? (
          <textarea {...commonProps} rows={3} />
        ) : (
          <input {...commonProps} type={isPassword ? (showPassword ? 'text' : 'password') : type} />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {isDate && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <Calendar className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}; 
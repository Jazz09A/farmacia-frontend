
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  isTextArea?: boolean;
  required?: boolean;
};

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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const commonProps = {
    id,
    value,
    onChange,
    placeholder,
    required,
    className: `w-full p-2 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      error ? 'border-red-500' : 'border-gray-300'
    }`,
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {isTextArea ? (
          <textarea {...commonProps} rows={2} />
        ) : (
          <input {...commonProps} type={isPassword && !showPassword ? 'password' : 'text'} />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>}
    </div>
  );
}; 
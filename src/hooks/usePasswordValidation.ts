import { useState, useCallback, useMemo } from 'react';

interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  errors: string[];
}

export const usePasswordValidation = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = useCallback((pwd: string): PasswordValidationResult => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };

    const passedRequirements = Object.values(requirements).filter(Boolean).length;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (passedRequirements === 5 && pwd.length >= 12) {
      strength = 'strong';
    } else if (passedRequirements >= 4) {
      strength = 'medium';
    }

    const errors: string[] = [];
    if (pwd.length > 0) {
      if (!requirements.length) errors.push('Mínimo 8 caracteres');
      if (!requirements.uppercase) errors.push('Al menos una mayúscula');
      if (!requirements.lowercase) errors.push('Al menos una minúscula');
      if (!requirements.number) errors.push('Al menos un número');
      if (!requirements.special) errors.push('Al menos un carácter especial');
    }

    return {
      isValid: passedRequirements === 5 && pwd.length >= 8,
      strength,
      requirements,
      errors
    };
  }, []);

  const validateConfirmPassword = useCallback((pwd: string, confirmPwd: string): boolean => {
    return pwd === confirmPwd && pwd.length > 0;
  }, []);

  const passwordValidation = useMemo(() => validatePassword(password), [password, validatePassword]);
  const confirmPasswordValidation = useMemo(() => 
    validateConfirmPassword(password, confirmPassword), 
    [password, confirmPassword, validateConfirmPassword]
  );

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordValidation,
    confirmPasswordValidation,
    validatePassword,
    validateConfirmPassword
  };
};

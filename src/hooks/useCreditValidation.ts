import { useCallback } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { VALIDATION_RULES } from '../config/creditConfig';

export const useCreditValidation = () => {
  const { creditInfo } = useCredit();

  // Validar si hay crédito suficiente para una compra
  const validateCreditAvailability = useCallback((amount: number): { 
    isValid: boolean; 
    error?: string; 
    availableCredit: number;
    creditLimit: number;
  } => {
    if (!creditInfo) {
      return {
        isValid: false,
        error: 'No se pudo obtener información de crédito',
        availableCredit: 0,
        creditLimit: 0
      };
    }

    if (creditInfo.credit_status !== 'active') {
      return {
        isValid: false,
        error: 'Su crédito no está activo',
        availableCredit: creditInfo.available_credit,
        creditLimit: creditInfo.credit_limit
      };
    }

    if (amount <= 0) {
      return {
        isValid: false,
        error: 'El monto debe ser mayor a 0',
        availableCredit: creditInfo.available_credit,
        creditLimit: creditInfo.credit_limit
      };
    }

    if (amount > creditInfo.available_credit) {
      return {
        isValid: false,
        error: `Crédito insuficiente. Necesita $${amount} pero solo tiene $${creditInfo.available_credit} disponible`,
        availableCredit: creditInfo.available_credit,
        creditLimit: creditInfo.credit_limit
      };
    }

    return {
      isValid: true,
      availableCredit: creditInfo.available_credit,
      creditLimit: creditInfo.credit_limit
    };
  }, [creditInfo]);

  // Validar si el usuario puede hacer una compra
  const canMakePurchase = useCallback((amount: number): boolean => {
    const validation = validateCreditAvailability(amount);
    return validation.isValid;
  }, [validateCreditAvailability]);

  // Obtener porcentaje de crédito utilizado
  const getCreditUsagePercentage = useCallback((): number => {
    if (!creditInfo || creditInfo.credit_limit === 0) {
      return 0;
    }

    const used = creditInfo.credit_limit - creditInfo.available_credit;
    return Math.round((used / creditInfo.credit_limit) * 100);
  }, [creditInfo]);

  // Obtener estado del crédito con información detallada
  const getCreditStatusInfo = useCallback(() => {
    if (!creditInfo) {
      return {
        status: 'unknown',
        message: 'No se pudo obtener información de crédito',
        color: 'gray',
        icon: '❓'
      };
    }

    const usagePercentage = getCreditUsagePercentage();

    switch (creditInfo.credit_status) {
      case 'active':
        if (usagePercentage >= 90) {
          return {
            status: 'warning',
            message: 'Crédito casi agotado',
            color: 'orange',
            icon: '⚠️'
          };
        } else if (usagePercentage >= 75) {
          return {
            status: 'info',
            message: 'Crédito en uso moderado',
            color: 'blue',
            icon: 'ℹ️'
          };
        } else {
          return {
            status: 'success',
            message: 'Crédito disponible',
            color: 'green',
            icon: '✅'
          };
        }
      
      case 'suspended':
        return {
          status: 'error',
          message: 'Crédito suspendido',
          color: 'red',
          icon: '❌'
        };
      
      case 'inactive':
        return {
          status: 'warning',
          message: 'Crédito inactivo',
          color: 'yellow',
          icon: '⏸️'
        };
      
      default:
        return {
          status: 'unknown',
          message: 'Estado de crédito desconocido',
          color: 'gray',
          icon: '❓'
        };
    }
  }, [creditInfo, getCreditUsagePercentage]);

  // Validar si se puede crear una orden de crédito
  const canCreateCreditOrder = useCallback((cartTotal: number): { 
    canCreate: boolean; 
    reason?: string;
    suggestions?: string[];
  } => {
    const validation = validateCreditAvailability(cartTotal);
    
    if (!validation.isValid) {
      const suggestions: string[] = [];
      
      if (validation.error?.includes('insuficiente')) {
        suggestions.push('Reduzca la cantidad de productos en su carrito');
        suggestions.push('Contacte al administrador para solicitar más crédito');
      } else if (validation.error?.includes('no está activo')) {
        suggestions.push('Contacte al administrador para activar su crédito');
      }
      
      return {
        canCreate: false,
        reason: validation.error,
        suggestions
      };
    }

    return { canCreate: true };
  }, [validateCreditAvailability]);

  return {
    validateCreditAvailability,
    canMakePurchase,
    getCreditUsagePercentage,
    getCreditStatusInfo,
    canCreateCreditOrder
  };
};


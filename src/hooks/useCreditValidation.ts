import { useCallback } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { VALIDATION_RULES } from '../config/creditConfig';
import { formatREF } from '../utils/currencyUtils';

export const useCreditValidation = () => {
  const { creditInfo } = useCredit();

  // Validar si hay crédito suficiente para una compra
  const validateCreditAvailability = useCallback((amount: string | number): { 
    isValid: boolean; 
    error?: string; 
    availableCredit: string;
    creditLimit: string;
  } => {
    if (!creditInfo) {
      return {
        isValid: false,
        error: 'No se pudo obtener información de crédito',
        availableCredit: '0.00',
        creditLimit: '0.00'
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

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const availableCredit = parseFloat(creditInfo.available_credit);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return {
        isValid: false,
        error: 'El monto debe ser mayor a 0',
        availableCredit: creditInfo.available_credit,
        creditLimit: creditInfo.credit_limit
      };
    }

    if (numericAmount > availableCredit) {
      return {
        isValid: false,
        error: `Crédito insuficiente. Necesita ${formatREF(amount.toString())} pero solo tiene ${formatREF(creditInfo.available_credit)} disponible`,
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
  const canMakePurchase = useCallback((amount: string | number): boolean => {
    const validation = validateCreditAvailability(amount);
    return validation.isValid;
  }, [validateCreditAvailability]);

  // Obtener porcentaje de crédito utilizado
  const getCreditUsagePercentage = useCallback((): number => {
    if (!creditInfo) {
      return 0;
    }

    const creditLimit = parseFloat(creditInfo.credit_limit);
    const availableCredit = parseFloat(creditInfo.available_credit);

    if (creditLimit === 0) {
      return 0;
    }

    const used = creditLimit - availableCredit;
    return Math.round((used / creditLimit) * 100);
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
  const canCreateCreditOrder = useCallback((cartTotal: string | number): { 
    canCreate: boolean; 
    reason?: string;
    suggestions?: string[];
  } => {
    // Si no hay crédito disponible, no se puede crear la orden
    if (!creditInfo) {
      return {
        canCreate: false,
        reason: 'No se pudo obtener información de crédito',
        suggestions: ['Contacte al administrador para verificar su cuenta']
      };
    }

    // Si el crédito no está activo, no se puede crear la orden
    if (creditInfo.credit_status !== 'active') {
      return {
        canCreate: false,
        reason: 'Su crédito no está activo',
        suggestions: ['Contacte al administrador para activar su crédito']
      };
    }

    // Si el carrito está vacío o el total es 0, no se puede crear la orden
    const numericTotal = typeof cartTotal === 'string' ? parseFloat(cartTotal) : cartTotal;
    if (isNaN(numericTotal) || numericTotal <= 0) {
      return {
        canCreate: false,
        reason: 'El carrito está vacío o el total es 0',
        suggestions: ['Agregue productos al carrito para continuar']
      };
    }

    // Validar si hay crédito suficiente
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
  }, [validateCreditAvailability, creditInfo]);

  return {
    validateCreditAvailability,
    canMakePurchase,
    getCreditUsagePercentage,
    getCreditStatusInfo,
    canCreateCreditOrder
  };
};


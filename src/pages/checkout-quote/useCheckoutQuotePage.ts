import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useUserAddressesQuery } from '../../hooks/queries/useAuthQueries';
import quoteService, { QuoteConflictError, QuoteServiceError } from '../../services/api/quotes';
import type {
  QuoteCreateRequest,
  QuoteCreateResponse,
  CartValidationResponse,
  QuoteCurrency,
} from '../../types/quotes';
import { useQuoteCart } from '../../hooks/useQuoteCart';
import type { Address } from './types';
import {
  PAYMENT_TERMS_OPTIONS,
  TRANSPORT_OPTIONS,
  DEFAULT_QUOTE_VALIDITY_DAYS,
  DEFAULT_PAYMENT_TERM,
  DEFAULT_TRANSPORT_CODE,
  computeValidUntil,
} from './constants';

export function useCheckoutQuotePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    currency,
    formatPriceFromBackend,
    getCurrencySymbol,
  } = useGlobalCurrency();
  const {
    items,
    detailedItems,
    loadingProducts,
    clearItems,
  } = useQuoteCart({ hydrateProducts: true });

  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictQuoteId, setConflictQuoteId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastQuoteCreated, setLastQuoteCreated] = useState<QuoteCreateResponse | null>(null);
  const [paymentTerm, setPaymentTerm] = useState<string>(DEFAULT_PAYMENT_TERM);
  const [transportCode, setTransportCode] = useState<string>(DEFAULT_TRANSPORT_CODE);
  
  // Estados para validación del carrito
  const [validationResult, setValidationResult] = useState<CartValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValidationInProgress = isValidating;
  const hasValidationError = !isValidationInProgress && Boolean(validationError);
  const hasValidationWarnings =
    !isValidationInProgress && Boolean(validationResult && !validationResult.valido);
  const isValidationSuccess =
    !isValidationInProgress && Boolean(validationResult && validationResult.valido);

  const localTotals = useMemo(() => {
    const subtotal = detailedItems.reduce((sum, item) => {
      const priceStr = item.product?.price ?? item.product?.current_price ?? '0';
      const price = parseFloat(priceStr);
      if (!Number.isFinite(price)) {
        return sum;
      }
      return sum + price * item.cantidad;
    }, 0);

    const itemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

    return {
      subtotal,
      total: subtotal,
      itemsCount,
    };
  }, [detailedItems, items]);

  // Determinar el texto del modo de pago según la condición seleccionada
  const paymentModeText = useMemo(() => {
    if (!paymentTerm) {
      return {
        mode: 'Modo cotización',
        description: 'Sin pago inmediato'
      };
    }
    
    if (paymentTerm === 'CON') {
      return {
        mode: 'Pago de contado',
        description: 'Pago inmediato al recibir'
      };
    } else {
      // Cualquier otro código es crédito
      const selectedOption = PAYMENT_TERMS_OPTIONS.find(opt => opt.code === paymentTerm);
      const days = selectedOption?.label.match(/\d+/)?.[0] || '';
      return {
        mode: 'Pago a crédito',
        description: days ? `${days} días de crédito` : 'Pago diferido'
      };
    }
  }, [paymentTerm]);

  const {
    data: addressesData,
    isFetching: addressesLoading,
  } = useUserAddressesQuery(undefined, Boolean(user));

  useEffect(() => {
    if (!addressesData) {
      console.log('[CheckoutQuote] addressesData is falsy:', addressesData);
      return;
    }

    const response = addressesData as any;
    console.log('[CheckoutQuote] addressesData type:', typeof addressesData);
    console.log('[CheckoutQuote] addressesData ctor:', response?.constructor?.name);
    console.log('[CheckoutQuote] addressesData keys:', response && typeof response === 'object' ? Object.keys(response) : response);

    // La API puede devolver diferentes envoltorios:
    // - { addresses: [...] }
    // - { data: { addresses: [...] } }
    // - { success: true, data: { addresses: [...] } }
    // - o directamente [...]
    const candidates = [
      response?.addresses,
      response?.data?.addresses,
      response?.data?.data?.addresses,
      response?.payload?.addresses,
      response?.result?.addresses,
      response,
    ];

    const rawList = candidates.find(Array.isArray) as any[] | undefined;
    console.log('[CheckoutQuote] candidates:', candidates);
    console.log('[CheckoutQuote] rawList:', rawList);

    if (!Array.isArray(rawList)) {
      setAddresses([]);
      return;
    }

    const normalizedList = rawList
      .map((item: any, index: number): Address | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const trimmedId =
          typeof item.id === 'string' && item.id.trim().length > 0
            ? item.id.trim()
            : null;

        const primaryAddressField =
          typeof item.address === 'string' && item.address.trim().length > 0
            ? item.address.trim()
            : undefined;

        const street =
          typeof item.street === 'string' && item.street.trim().length > 0
            ? item.street.trim()
            : primaryAddressField;

        const city =
          typeof item.city === 'string' && item.city.trim().length > 0
            ? item.city.trim()
            : undefined;

        const state =
          typeof item.state === 'string' && item.state.trim().length > 0
            ? item.state.trim()
            : undefined;

        const postalCodeCandidates = [
          item.postal_code,
          item.zip,
          item.zip_code,
          item.postalCode,
        ];
        const postal_code = postalCodeCandidates.find(
          value => typeof value === 'string' && value.trim().length > 0
        ) as string | undefined;

        const phoneCandidates = [
          item.recipient_phone,
          item.phone,
          item.phones,
          item.telefono,
        ];
        const recipient_phone = phoneCandidates.find(
          value => typeof value === 'string' && value.trim().length > 0
        ) as string | undefined;

        const labelCandidates = [
          item.label,
          item.recipient_name,
          item.customer_name,
          item.alias,
          item.address_name,
        ];
        const label = labelCandidates.find(
          value => typeof value === 'string' && value.trim().length > 0
        ) as string | undefined;

        const address_type =
          typeof item.address_type === 'string' && item.address_type.trim().length > 0
            ? item.address_type.trim()
            : typeof item.type === 'string' && item.type.trim().length > 0
            ? item.type.trim()
            : undefined;

        const co_tran =
          typeof item.co_tran === 'string' && item.co_tran.trim().length > 0
            ? item.co_tran.trim()
            : undefined;

        const transport_code =
          typeof item.transport_code === 'string' && item.transport_code.trim().length > 0
            ? item.transport_code.trim()
            : co_tran;

        const country =
          typeof item.country === 'string' && item.country.trim().length > 0
            ? item.country.trim()
            : undefined;

        const raw_address = primaryAddressField ?? street ?? undefined;

        const id =
          trimmedId ??
          (raw_address
            ? `profit-address-${index}-${raw_address
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')}`
            : `address-${index}`);

        const recipient_name = label ?? (raw_address ? 'Dirección de cliente' : undefined);

        const is_default =
          typeof item.is_default === 'boolean'
            ? item.is_default
            : address_type === 'principal';

        return {
          id,
          recipient_name,
          street,
          city,
          state,
          postal_code,
          country,
          recipient_phone,
          address_type,
          is_default,
          co_tran,
          transport_code,
          label,
          raw_address,
          is_profit_address: !trimmedId && Boolean(raw_address),
        };
      })
      .filter((addr): addr is Address => Boolean(addr));

    setAddresses(normalizedList);

    if (!selectedAddressId && normalizedList.length > 0) {
      const defaultAddress =
        normalizedList.find(addr => addr.is_default) || normalizedList[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addressesData, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find(addr => addr.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const transportOptions = useMemo(() => {
    const inferredCode = selectedAddress?.co_tran ?? selectedAddress?.transport_code;
    const hasInferredInList = inferredCode
      ? TRANSPORT_OPTIONS.some(option => option.code === inferredCode)
      : true;

    if (inferredCode && !hasInferredInList) {
      return [
        ...TRANSPORT_OPTIONS,
        {
          code: inferredCode,
          label: `${inferredCode} · Transporte asociado a la dirección`,
        },
      ];
    }

    return TRANSPORT_OPTIONS;
  }, [selectedAddress]);

  const selectedPaymentTermOption = useMemo(
    () => PAYMENT_TERMS_OPTIONS.find(option => option.code === paymentTerm),
    [paymentTerm]
  );

  const selectedTransportOption = useMemo(
    () => transportOptions.find(option => option.code === transportCode),
    [transportOptions, transportCode]
  );

  useEffect(() => {
    if (!selectedAddress) {
      setTransportCode(DEFAULT_TRANSPORT_CODE);
      return;
    }

    const inferredCode = selectedAddress.co_tran ?? selectedAddress.transport_code;
    if (inferredCode && inferredCode !== transportCode) {
      setTransportCode(inferredCode);
    }
  }, [selectedAddress, transportCode]);

  const validateCartContents = useCallback(async (): Promise<CartValidationResponse | null> => {
    if (items.length === 0) {
      setValidationResult(null);
      return null;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await quoteService.validateCart(items);
      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Error validating cart:', error);
      setValidationError(
        error instanceof Error
          ? error.message
          : 'Error al validar el carrito. Por favor, inténtalo nuevamente.'
      );
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  useEffect(() => {
    validateCartContents();
  }, [validateCartContents]);

  // Totales basados en validación o carrito
  const totals = useMemo(() => {
    if (validationResult?.totales) {
      const bruto = parseFloat(validationResult.totales.bruto);
      const impuestos = parseFloat(validationResult.totales.impuestos);
      const neto = parseFloat(validationResult.totales.neto);
      // Manejar tanto descuento (singular) como descuentos (plural)
      const descuentos = parseFloat(validationResult.totales.descuentos || validationResult.totales.descuento || '0');

      return {
        subtotal: bruto,
        taxes: impuestos,
        discounts: descuentos,
        total: neto,
        currencySymbol: getCurrencySymbol(currency),
        itemsCount: validationResult.items_verificados.length,
      };
    }

    if (items.length === 0) {
      return null;
    }

    return {
      subtotal: localTotals.subtotal,
      taxes: 0,
      total: localTotals.total,
      currencySymbol: getCurrencySymbol(currency),
      itemsCount: localTotals.itemsCount,
    };
  }, [validationResult, currency, getCurrencySymbol, localTotals, items.length]);

  const buildQuotePayload = (validation: CartValidationResponse | null = validationResult): QuoteCreateRequest | null => {
    if (!user) {
      setErrorMessage('No se pudo cargar la información necesaria para la cotización.');
      return null;
    }

    if (items.length === 0) {
      setErrorMessage('Tu carrito está vacío. Agrega productos antes de generar una cotización.');
      return null;
    }

    // Si hay validación, usar datos autoritativos
    if (!validation || !validation.valido) {
      setErrorMessage(
        'El carrito contiene errores. Por favor, revisa los productos y corrígelos antes de continuar.'
      );
      return null;
    }

    // Usar datos de validación (autoritativos)
    // Según documentación: solo enviar line_number, product_code y quantity
    // El backend calcula automáticamente: precios, nombres, descuentos e impuestos
    const itemsPayload = validation.items_verificados
      .filter(item => item.error === null && item.stock_ok) // Solo items válidos
      .map((item, index) => ({
          line_number: index + 1,
          product_code: item.co_art,
          quantity: item.cantidad,
      }));

    if (itemsPayload.length === 0) {
      setErrorMessage('No hay productos válidos en el carrito para generar la cotización.');
      return null;
    }

    const normalizedNotes = customerNotes.trim() ? customerNotes.trim() : undefined;
    const deliveryTransportCode = selectedAddress
      ? transportCode || DEFAULT_TRANSPORT_CODE
      : undefined;

    const deliveryPayload = selectedAddress
      ? {
          mode: 'delivery' as const,
          ...(selectedAddress.is_profit_address ? {} : { address_id: selectedAddress.id }),
          notes: normalizedNotes,
          ...(deliveryTransportCode ? { co_tran: deliveryTransportCode } : {}),
        }
      : undefined;

    const profitDirection = selectedAddress?.is_profit_address
      ? (() => {
          if (selectedAddress.raw_address && selectedAddress.raw_address.trim().length > 0) {
            return selectedAddress.raw_address.trim();
          }

          const components = [
            selectedAddress.street,
            selectedAddress.city,
            selectedAddress.state,
            selectedAddress.postal_code,
          ]
            .map(part => (typeof part === 'string' && part.trim().length > 0 ? part.trim() : ''))
            .filter(Boolean);

          return components.length > 0 ? components.join(', ') : undefined;
        })()
      : undefined;

    const backendCurrency: QuoteCurrency = 'US$';

    const payload: QuoteCreateRequest = {
      customer: {
        email: user.email,
        name: user.company_name || user.email || 'Cliente sin nombre',
        phone: user.phone,
      },
      channel: 'web_b2b',
      currency: backendCurrency,
      valid_until: computeValidUntil(DEFAULT_QUOTE_VALIDITY_DAYS),
      payment_terms: paymentTerm,
      delivery: deliveryPayload,
      ...(profitDirection ? { direc: profitDirection } : {}),
      notes: normalizedNotes,
      items: itemsPayload,
    };

    return payload;
  };

  const handleValidateCart = async () => {
    await validateCartContents();
  };

  const handleCreateQuote = async () => {
    setErrorMessage(null);
    setConflictQuoteId(undefined);

    // Revalidar antes de crear
    const latestValidation = await validateCartContents();

    const payload = buildQuotePayload(latestValidation);
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    try {
      const quote = await quoteService.createQuote(payload);
      setLastQuoteCreated(quote);
      clearItems();
      navigate('/checkout/quote/success', {
        state: {
          quote,
          address: selectedAddress,
          issuedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof QuoteConflictError) {
        setConflictQuoteId(error.existingQuoteId);
        setErrorMessage(error.message);
        return;
      }

      if (error instanceof QuoteServiceError) {
        switch (error.status) {
          case 400:
          case 422:
            setErrorMessage(error.message || 'Revisa los datos de la cotización e inténtalo nuevamente.');
            break;
          case 502:
            setErrorMessage('No pudimos confirmar los datos del carrito. Reintenta en unos segundos.');
            break;
          default:
            setErrorMessage(error.message || 'No se pudo crear la cotización. Intenta de nuevo.');
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado al crear la cotización.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    navigate,
    authLoading,
    currency,
    formatPriceFromBackend,
    items,
    detailedItems,
    loadingProducts,
    customerNotes,
    setCustomerNotes,
    selectedAddressId,
    setSelectedAddressId,
    addresses,
    errorMessage,
    conflictQuoteId,
    isSubmitting,
    lastQuoteCreated,
    paymentTerm,
    setPaymentTerm,
    transportCode,
    setTransportCode,
    validationResult,
    isValidating,
    validationError,
    isValidationInProgress,
    hasValidationError,
    hasValidationWarnings,
    isValidationSuccess,
    paymentModeText,
    addressesLoading,
    selectedAddress,
    transportOptions,
    selectedPaymentTermOption,
    selectedTransportOption,
    totals,
    handleValidateCart,
    handleCreateQuote,
  };
}

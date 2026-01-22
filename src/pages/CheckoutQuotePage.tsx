import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  NotebookPen,
  Percent,
  Sparkles,
  XCircle,
  RefreshCw,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useUserAddressesQuery } from '../hooks/queries/useAuthQueries';
import quoteService, { QuoteConflictError, QuoteServiceError } from '../services/api/quotes';
import type {
  QuoteCreateRequest,
  QuoteCreateResponse,
  CartValidationResponse,
  QuoteCurrency,
} from '../types/quotes';
import { useQuoteCart } from '../hooks/useQuoteCart';

type Address = {
  id: string;
  recipient_name?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  recipient_phone?: string;
  address_type?: string;
  is_default?: boolean;
  co_tran?: string;
  transport_code?: string;
  label?: string;
  raw_address?: string;
  is_profit_address?: boolean;
};

// Helper opcional (por ahora no se usa en esta pantalla)
// const toDecimalString = (value: string | number | null | undefined): string => {
//   if (typeof value === 'string' && value.trim() !== '') {
//     return value;
//   }
//   if (typeof value === 'number' && Number.isFinite(value)) {
//     return value.toFixed(2);
//   }
//   return '0.00';
// };

const PAYMENT_TERMS_OPTIONS = [
  { code: 'CON', label: 'CON · Contado' },
  { code: '3D', label: '3D · 3 días de crédito' },
  { code: '5D', label: '5D · 5 días de crédito' },
  { code: '7D', label: '7D · 7 días de crédito' },
  { code: '10D', label: '10D · 10 días de crédito' },
  { code: '12D', label: '12D · 12 días de crédito' },
  { code: '14D', label: '14D · 14 días de crédito' },
  { code: '15D', label: '15D · 15 días de crédito' },
  { code: '16D', label: '16D · 16 días de crédito' },
  { code: '20D', label: '20D · 20 días de crédito' },
  { code: '21D', label: '21D · 21 días de crédito' },
  { code: '30D', label: '30D · 30 días de crédito' },
  { code: '360D', label: '360D · 360 días de crédito' },
];

const TRANSPORT_OPTIONS = [
  { code: '001', label: '001 · Entrega directa (Oficina)' },
  { code: '002', label: '002 · Tealca Paraiso (Sra. Carmen 0414 3224289)' },
  { code: '003', label: '003 · Zeus Express CA (Sr. Dennys 0414 8239491)' },
  { code: '004', label: '004 · Transporte Alianza (Sr. Edgar 0412 5354934)' },
  { code: '005', label: '005 · Zoom Montalban (Sr. Leandro 0412 2076171)' },
  { code: '006', label: '006 · Zoom La Urbina (Sra. Gleimar 0414 2649087)' },
  { code: '007', label: '007 · Marcha Express (Anmary Seijas 0412 8052157)' },
];

const DEFAULT_QUOTE_VALIDITY_DAYS = 30;
const DEFAULT_PAYMENT_TERM = 'CON';
const DEFAULT_TRANSPORT_CODE = '001';

const computeValidUntil = (validityDays: number): string => {
  const now = new Date();
  const expiration = new Date(now);
  expiration.setDate(expiration.getDate() + validityDays);
  expiration.setHours(23, 59, 59, 0);
  return expiration.toISOString();
};

const CheckoutQuotePage: React.FC = () => {
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

  if (authLoading || (loadingProducts && items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-gray-50">
        <LoadingSpinner message="Preparando tu cotización..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
        <div className="medical-container text-center">
          <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-soft p-12">
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-14 w-14 text-medical-primary" />
              <h1 className="text-3xl font-bold text-medical-gray-900">
                Tu carrito está vacío
              </h1>
              <p className="text-medical-gray-600">
                Agrega productos al carrito para generar una cotización personalizada.
              </p>
                <Link
                  to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-medical-primary text-white font-semibold shadow-lg hover:bg-medical-primary-dark transition-all"
              >
                <Sparkles className="h-5 w-5" />
                Explorar productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-28 pb-16">
      <div className="medical-container">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-medical-gray-600 hover:text-medical-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-medical-gray-900">
              Confirmar Cotización
            </h1>
            <p className="text-medical-gray-600 mt-2 max-w-2xl">
              Revisa tu resumen y confirma los datos de entrega. Enviaremos tu cotización al equipo
              comercial para su procesamiento interno.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-medical-primary/30 rounded-2xl px-5 py-3 shadow-soft">
            <Sparkles className="h-8 w-8 text-medical-primary" />
            <div>
              <p className="text-sm text-medical-gray-500">{paymentModeText.mode}</p>
              <p className="text-lg font-semibold text-medical-gray-900">
                {paymentModeText.description}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">No pudimos crear la cotización</p>
                <p className="text-sm mt-1">{errorMessage}</p>
                {conflictQuoteId && (
                  <button
                    onClick={() => navigate(`/profile/quotes/${conflictQuoteId}`, { state: { returnToTab: 'cotizaciones' } })}
                    className="mt-3 inline-flex items-center gap-2 text-medical-primary font-semibold hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Ver cotización existente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validación del carrito */}
        {isValidationInProgress && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <p className="text-blue-800 font-medium">Comprobando disponibilidad y precios actualizados...</p>
            </div>
          </div>
        )}

        {hasValidationError && validationError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error al validar el carrito</p>
                <p className="text-sm text-red-700 mt-1">{validationError}</p>
                <button
                  onClick={handleValidateCart}
                  className="mt-3 inline-flex items-center gap-2 text-red-700 font-semibold hover:underline"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar validación
                </button>
              </div>
            </div>
          </div>
        )}

        {hasValidationWarnings && validationResult && (
          <div className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-lg text-red-800 mb-2">La verificación del carrito falló</p>
                <p className="text-sm text-red-700 mb-4">
                  No se puede generar la cotización porque hay errores en los productos. Por favor, corrige los siguientes problemas:
                </p>
                <div className="bg-white rounded-lg border border-red-200 p-4 space-y-3">
                  {validationResult.items_verificados
                    .filter(item => item.error || !item.stock_ok)
                    .map((item, idx) => (
                      <div key={idx} className="border-b border-red-100 last:border-none pb-3 last:pb-0">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">
                              {item.descripcion || item.co_art}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Código: <span className="font-mono">{item.co_art}</span> • Cantidad solicitada: <span className="font-semibold">{item.cantidad}</span>
                            </p>
                            {item.error && (
                              <p className="text-sm text-red-700 mt-2 font-medium bg-red-50 p-2 rounded border border-red-200">
                                {item.error}
                              </p>
                            )}
                            {!item.stock_ok && !item.error && (
                              <p className="text-sm text-red-700 mt-2 font-medium bg-red-50 p-2 rounded border border-red-200">
                                Stock insuficiente. Revisa la cantidad disponible.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleValidateCart}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                    Validar nuevamente
                </button>
                  <p className="text-xs text-red-600">
                    Ajusta las cantidades o elimina los productos con problemas antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isValidationSuccess && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Carrito validado correctamente. Todos los productos disponibles con precios confirmados.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
              <header className="flex items-center gap-3 mb-6">
                <MapPin className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">
                    Dirección de entrega
                  </h2>
                  <p className="text-sm text-medical-gray-500">
                    Selecciona la dirección donde deseas recibir tu pedido cotizado.
                  </p>
                </div>
              </header>

              {addressesLoading && (
                <div className="py-6">
                  <LoadingSpinner message="Cargando direcciones..." variant="inline" />
                </div>
              )}

              {!addressesLoading && addresses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-medical-primary/40 bg-medical-blue-50 p-6">
                  <p className="font-semibold text-medical-gray-800">
                    No tienes direcciones guardadas.
                  </p>
                  <p className="text-sm text-medical-gray-600 mt-1">
                    Agrega una desde tu perfil para poder completar la cotización.
                  </p>
                  <Link
                    to="/profile?tab=addresses"
                    className="inline-flex items-center gap-2 mt-4 text-medical-primary font-semibold"
                  >
                    <NotebookPen className="h-4 w-4" />
                    Administrar direcciones
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                {addresses.map(address => {
                  const isSelected = address.id === selectedAddressId;
                  const recipientLabel =
                    (address.recipient_name && address.recipient_name.trim().length > 0
                      ? address.recipient_name.trim()
                      : undefined) ??
                    (address.label && address.label.trim().length > 0
                      ? address.label.trim()
                      : undefined) ??
                    'Dirección sin nombre';

                  const locationParts = [
                    address.street,
                    address.city,
                    address.state,
                    address.postal_code,
                  ]
                    .map(value =>
                      typeof value === 'string' && value.trim().length > 0 ? value.trim() : ''
                    )
                    .filter(Boolean);

                  const locationLine =
                    locationParts.join(', ') ||
                    (address.raw_address && address.raw_address.trim().length > 0
                      ? address.raw_address.trim()
                      : 'Sin detalles de dirección');

                  const phoneLine =
                    address.recipient_phone && address.recipient_phone.trim().length > 0
                      ? address.recipient_phone.trim()
                      : undefined;

                  return (
                    <label
                      key={address.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-medical-primary bg-medical-blue-50/60 shadow-soft'
                          : 'border-gray-200 hover:border-medical-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 h-5 w-5 text-medical-primary focus:ring-medical-primary"
                      />
                      <div>
                        <p className="font-semibold text-medical-gray-900">{recipientLabel}</p>
                        <p className="text-sm text-medical-gray-600 mt-1">{locationLine}</p>
                        {phoneLine && (
                          <p className="text-xs text-medical-gray-500 mt-1">{phoneLine}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
              <header className="flex items-center gap-3 mb-6">
                <NotebookPen className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">
                    Condiciones comerciales
                  </h2>
                  <p className="text-sm text-medical-gray-500">
                    Elige la condición de pago y el transporte para enviar la solicitud correctamente.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="payment_term" className="text-sm font-medium text-medical-gray-800">
                      Condición de pago
                    </label>
                    <span className="text-xs text-medical-gray-500">Requerido</span>
                  </div>
                  <select
                    id="payment_term"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-medical-gray-800 focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20 transition-all"
                    value={paymentTerm}
                    onChange={event => setPaymentTerm(event.target.value)}
                  >
                    {PAYMENT_TERMS_OPTIONS.map(option => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-medical-gray-500">
                    Coincide con las condiciones disponibles en Profit Plus. Puedes modificarlo según el acuerdo comercial.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="transport_code" className="text-sm font-medium text-medical-gray-800">
                      Código de transporte
                    </label>
                    <span className="text-xs text-medical-gray-500">
                      {selectedAddressId ? 'Requerido' : 'Selecciona una dirección primero'}
                    </span>
                  </div>
                  <select
                    id="transport_code"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-medical-gray-800 focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20 transition-all disabled:opacity-60"
                    value={transportCode}
                    onChange={event => setTransportCode(event.target.value)}
                    disabled={!selectedAddressId}
                  >
                    {transportOptions.map(option => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-medical-gray-500">
                    Define cómo se enviará la cotización. Si la dirección ya tiene un transporte asignado lo seleccionamos automáticamente.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
              <header className="flex items-center gap-3 mb-6">
                <NotebookPen className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">
                    Notas adicionales
                  </h2>
                  <p className="text-sm text-medical-gray-500">
                    Comparte instrucciones importantes para la entrega o información comercial.
                  </p>
                </div>
              </header>
              <textarea
                value={customerNotes}
                onChange={event => setCustomerNotes(event.target.value)}
                rows={5}
                maxLength={500}
                placeholder="Ej: Entregar en el muelle de recepción. Contactar al encargado al llegar."
                className="w-full rounded-2xl border border-gray-200 focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20 p-4 text-medical-gray-800 transition-all"
              />
              <p className="text-right text-xs text-medical-gray-400 mt-2">
                {customerNotes.length}/500 caracteres
              </p>
            </section>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-medical-primary" />
                  <div>
                    <h2 className="text-xl font-semibold text-medical-gray-900">
                      Resumen de productos
                    </h2>
                    <p className="text-sm text-medical-gray-500">
                      {validationResult
                        ? 'Precios y disponibilidad confirmados recientemente'
                        : 'Confirmaremos estos productos antes de generar tu cotización.'}
                    </p>
                  </div>
                </div>
                {!isValidationInProgress && (
                  <button
                    onClick={handleValidateCart}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-medical-primary hover:bg-medical-blue-50 rounded-lg transition-colors"
                    title="Actualizar precios y existencia"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Comprobar otra vez
                  </button>
                )}
              </header>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {validationResult && !isValidationInProgress
                  ? validationResult.items_verificados.map((item, idx) => {
                      const hasError = item.error !== null || !item.stock_ok;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-none ${
                            hasError ? 'bg-red-50/50 rounded-lg p-3 -mx-3' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <p className="font-medium text-medical-gray-900">
                                {item.descripcion || item.co_art}
                              </p>
                              {hasError && (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                              {!hasError && item.stock_ok && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-xs text-medical-gray-500 mt-1">
                              Código: <span className="font-semibold">{item.co_art}</span> • Cantidad:{' '}
                              <span className="font-semibold">{item.cantidad}</span>
                            </p>
                            {item.error && (
                              <p className="text-xs text-red-600 mt-1 font-medium">{item.error}</p>
                            )}
                            {!item.stock_ok && !item.error && (
                              <p className="text-xs text-red-600 mt-1 font-medium">
                                Stock insuficiente
                              </p>
                            )}
                            {validationResult.valido && item.stock_ok && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Disponible • Precio actualizado
                              </p>
                            )}
                            {item.descuento_info && parseFloat(item.descuento || '0') > 0 && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-1 text-xs text-red-700 font-semibold">
                                  <Percent className="w-3 h-3" />
                                  <span>Descuento aplicado: {item.descuento_info.porcentaje}%</span>
                                </div>
                                <p className="text-xs text-red-600 mt-1">
                                  Ahorro: {formatPriceFromBackend(item.descuento, currency)}
                                </p>
                                {item.descuento_info.disponibles < item.descuento_info.limite_total && (
                                  <p className="text-xs text-red-500 mt-1 italic">
                                    {item.descuento_info.disponibles} de {item.descuento_info.limite_total} disponibles
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              {parseFloat(item.descuento || '0') > 0 && (
                                <span className="text-xs text-medical-gray-500 line-through mb-0.5">
                                  {formatPriceFromBackend((parseFloat(item.subtotal) + parseFloat(item.descuento)).toString(), currency)}
                                </span>
                              )}
                            <span className="text-sm font-semibold text-medical-gray-900">
                              {formatPriceFromBackend(item.subtotal, currency)}
                            </span>
                            </div>
                              <p className="text-xs text-medical-gray-500 mt-0.5">
                                +{formatPriceFromBackend(item.impuestos, currency)} imp.
                              </p>
                          </div>
                        </div>
                      );
                    })
                  : detailedItems.map(item => {
                      const productName = item.product?.name || `Artículo ${item.co_art}`;
                      const estimatedSubtotal = (() => {
                        const priceStr = item.product?.price ?? item.product?.current_price ?? '0';
                        const price = parseFloat(priceStr);
                        if (!Number.isFinite(price)) {
                          return 0;
                        }
                        return price * item.cantidad;
                      })();

                      return (
                      <div
                        key={item.co_art}
                        className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-none"
                      >
                        <div>
                          <p className="font-medium text-medical-gray-900">{productName}</p>
                          <p className="text-xs text-medical-gray-500 mt-1">
                            Cantidad: <span className="font-semibold">{item.cantidad}</span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-medical-gray-900">
                          {formatPriceFromBackend(estimatedSubtotal.toFixed(2), currency)}
                        </span>
                      </div>
                      );
                    })}
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <header className="flex items-center gap-3 mb-5">
                <Sparkles className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">
                    Preferencias de cotización
                  </h2>
                  <p className="text-sm text-medical-gray-500">
                    Estos datos se enviarán junto con la solicitud al equipo comercial.
                  </p>
                </div>
              </header>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-medical-gray-600">Condición de pago</dt>
                  <dd className="font-semibold text-medical-gray-900 text-right">
                    {selectedPaymentTermOption?.label || paymentTerm}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-medical-gray-600">Transporte asignado</dt>
                  <dd className="font-semibold text-medical-gray-900 text-right">
                    {selectedAddressId
                      ? selectedTransportOption?.label || transportCode
                      : 'Selecciona una dirección'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-medical-gray-600">Vigencia estimada</dt>
                  <dd className="font-semibold text-medical-gray-900 text-right">
                    {DEFAULT_QUOTE_VALIDITY_DAYS} días a partir de hoy
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 space-y-3">
              <div className="flex justify-between text-sm text-medical-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-medical-gray-900">
                  {totals ? formatPriceFromBackend(totals.subtotal, currency) : '--'}
                </span>
              </div>
              {validationResult?.totales && (parseFloat(validationResult.totales.descuentos || validationResult.totales.descuento || '0') > 0) && (
                <div className="flex justify-between text-sm text-red-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    Descuento
                  </span>
                  <span className="font-semibold text-red-600">
                    -{formatPriceFromBackend(validationResult.totales.descuentos || validationResult.totales.descuento || '0', currency)}
                  </span>
                </div>
              )}
              {validationResult?.totales ? (
                <div className="flex justify-between text-sm text-medical-gray-600">
                  <span>Impuestos</span>
                  <span className="font-semibold text-medical-gray-900">
                    {formatPriceFromBackend(validationResult.totales.impuestos, currency)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-sm text-medical-gray-600">
                  <span>Impuestos</span>
                  <span className="font-semibold text-medical-gray-900 text-xs">
                    Se calcularán al validar
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-medical-gray-900 border-t border-gray-100 pt-3">
                <span>Total {validationResult ? 'verificado' : 'estimado'}</span>
                <span>
                  {totals ? formatPriceFromBackend(totals.total, currency) : '--'}
                </span>
              </div>
              {isValidationSuccess && (
                <p className="text-xs text-green-600 text-center mt-2">
                  ✓ Precios y disponibilidad confirmados
                </p>
              )}
              {lastQuoteCreated && (
                <div className="mt-3 rounded-2xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Última cotización enviada: {lastQuoteCreated.quote_id}
                </div>
              )}
            </section>

            <button
              onClick={handleCreateQuote}
              disabled={
                isSubmitting ||
                isValidating ||
                !selectedAddressId ||
                (validationResult && !validationResult.valido) ||
                !validationResult
              }
              className="w-full bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 hover:from-medical-blue-700 hover:to-medical-blue-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generando cotización...
                </>
              ) : isValidating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Validando...
                </>
              ) : !validationResult ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Validando carrito...
                </>
              ) : !validationResult.valido ? (
                <>
                  <XCircle className="h-5 w-5" />
                  Corrige los errores primero
                </>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Handshake className="h-5 w-5" />
                  <span>Enviar solicitud</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>

            <p className="text-xs text-medical-gray-500 text-center">
              Al confirmar aceptas que nuestro equipo procesará la cotización y te notificará por correo electrónico.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutQuotePage;


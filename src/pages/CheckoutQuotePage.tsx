import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useUserAddressesQuery } from '../hooks/queries/useAuthQueries';
import quoteService, { QuoteConflictError, QuoteServiceError } from '../services/api/quotes';
import type { QuoteCreateRequest, QuoteCreateResponse } from '../types/quotes';

type Address = {
  id: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  recipient_phone?: string;
  address_type?: string;
  is_default?: boolean;
};

const toDecimalString = (value: string | number | null | undefined): string => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(2);
  }
  return '0.00';
};

const CheckoutQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const {
    currency,
    formatPriceFromBackend,
    getCurrencySymbol,
  } = useGlobalCurrency();

  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictQuoteId, setConflictQuoteId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastQuoteCreated, setLastQuoteCreated] = useState<QuoteCreateResponse | null>(null);

  const {
    data: addressesData,
    isFetching: addressesLoading,
  } = useUserAddressesQuery(
    { include_checkout_preview: true, cart_total: cart?.total || 0 },
    Boolean(user)
  );

  useEffect(() => {
    if (!addressesData) {
      return;
    }

    const response = addressesData as any;
    const list: Address[] = response.addresses || response;

    if (Array.isArray(list)) {
      setAddresses(list);

      if (!selectedAddressId && list.length > 0) {
        const defaultAddress = list.find(addr => addr.is_default) || list[0];
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addressesData, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find(addr => addr.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const totals = useMemo(() => {
    if (!cart) {
      return null;
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const lineSubtotal =
        typeof item.subtotal === 'number'
          ? item.subtotal
          : Number(item.subtotal ?? 0);
      return sum + (Number.isFinite(lineSubtotal) ? lineSubtotal : 0);
    }, 0);

    return {
      subtotal,
      total: cart.total,
      currencySymbol: getCurrencySymbol(currency),
      itemsCount: cart.total_items,
    };
  }, [cart, currency, getCurrencySymbol]);

  const buildQuotePayload = (): QuoteCreateRequest | null => {
    if (!cart || !user) {
      setErrorMessage('No se pudo cargar la información necesaria para la cotización.');
      return null;
    }

    if (cart.items.length === 0) {
      setErrorMessage('Tu carrito está vacío. Agrega productos antes de generar una cotización.');
      return null;
    }

    const customerCode = user.customer_code || user.rif;

    if (!customerCode) {
      setErrorMessage(
        'No encontramos un código de cliente asociado a tu cuenta. Por favor, contacta a soporte.'
      );
      return null;
    }

    const items = cart.items.map((item, index) => {
      const unitPriceValue = parseFloat(
        item.product.current_price ?? item.product.price ?? '0'
      );
      const unitPrice = Number.isFinite(unitPriceValue) ? unitPriceValue : 0;
      const subtotalValue =
        typeof item.subtotal === 'number'
          ? item.subtotal
          : Number(item.subtotal ?? 0);
      const lineSubtotal = Number.isFinite(subtotalValue) ? subtotalValue : 0;
      const computedDiscount = Math.max(0, unitPrice * item.quantity - lineSubtotal);

      return {
        line_number: index + 1,
        product_code: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: toDecimalString(item.product.current_price ?? unitPrice),
        discount_amount: toDecimalString(computedDiscount),
        tax_amount: '0.00',
      };
    });

    const payload: QuoteCreateRequest = {
      customer: {
        code: customerCode,
        email: user.email,
        name: user.company_name || user.email || 'Cliente sin nombre',
        phone: user.phone,
      },
      channel: 'web_b2b',
      currency,
      payment_terms: 'CONTADO',
      delivery: selectedAddressId
        ? {
            mode: 'delivery',
            address_id: selectedAddressId,
            notes: customerNotes || undefined,
          }
        : undefined,
      notes: customerNotes || undefined,
      items,
    };

    return payload;
  };

  const handleCreateQuote = async () => {
    setErrorMessage(null);
    setConflictQuoteId(undefined);

    const payload = buildQuotePayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    try {
      const quote = await quoteService.createQuote(payload);
      setLastQuoteCreated(quote);
      await clearCart();
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
            setErrorMessage('No pudimos conectar con Profit Plus. Reintenta en unos segundos.');
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

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-gray-50">
        <LoadingSpinner message="Preparando tu cotización..." />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
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
                to="/catalogo"
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
              comercial para su procesamiento en Profit Plus.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-medical-primary/30 rounded-2xl px-5 py-3 shadow-soft">
            <Sparkles className="h-8 w-8 text-medical-primary" />
            <div>
              <p className="text-sm text-medical-gray-500">Modo cotización</p>
              <p className="text-lg font-semibold text-medical-gray-900">
                Sin pago inmediato
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
                        <p className="font-semibold text-medical-gray-900">
                          {address.recipient_name || 'Dirección sin nombre'}
                        </p>
                        <p className="text-sm text-medical-gray-600 mt-1">
                          {address.street}, {address.city}, {address.state}
                        </p>
                        {address.recipient_phone && (
                          <p className="text-xs text-medical-gray-500 mt-1">
                            {address.recipient_phone}
                          </p>
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
              <header className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">
                    Resumen de productos
                  </h2>
                  <p className="text-sm text-medical-gray-500">
                    Confirmaremos estos productos en Profit Plus.
                  </p>
                </div>
              </header>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-none"
                  >
                    <div>
                      <p className="font-medium text-medical-gray-900">{item.product.name}</p>
                      <p className="text-xs text-medical-gray-500 mt-1">
                        Cantidad: <span className="font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-medical-gray-900">
                      {formatPriceFromBackend(item.subtotal, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 space-y-3">
              <div className="flex justify-between text-sm text-medical-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-medical-gray-900">
                  {totals ? formatPriceFromBackend(totals.subtotal, currency) : '--'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-medical-gray-600">
                <span>Impuestos estimados</span>
                <span className="font-semibold text-medical-gray-900">Incluidos al generar</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-medical-gray-900 border-t border-gray-100 pt-3">
                <span>Total estimado</span>
                <span>
                  {totals ? formatPriceFromBackend(totals.total, currency) : '--'}
                </span>
              </div>
              {lastQuoteCreated && (
                <div className="mt-3 rounded-2xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Última cotización enviada: {lastQuoteCreated.quote_id}
                </div>
              )}
            </section>

            <button
              onClick={handleCreateQuote}
              disabled={isSubmitting || !selectedAddressId}
              className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-2xl bg-medical-primary text-white font-semibold text-lg shadow-xl hover:bg-medical-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generando cotización...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Crear cotización
                </>
              )}
            </button>

            <p className="text-xs text-medical-gray-500 text-center">
              Al confirmar aceptas que nuestro equipo procesará la cotización en Profit Plus y te
              notificará por correo electrónico.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutQuotePage;


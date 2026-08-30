import React from 'react';
import {
  CheckCircle2,
  FileText,
  Loader2,
  Percent,
  Sparkles,
  XCircle,
  RefreshCw,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import type { CartValidationResponse, QuoteCreateResponse } from '../../types/quotes';
import type { Currency } from '../../types';
import { DEFAULT_QUOTE_VALIDITY_DAYS } from './constants';

type DetailedItem = {
  co_art: string;
  cantidad: number;
  product?: { name?: string; price?: string; current_price?: string } | null;
};

interface QuoteSummaryAsideProps {
  currency: Currency;
  formatPriceFromBackend: (value: string | number, currency?: Currency) => string;
  validationResult: CartValidationResponse | null;
  isValidationInProgress: boolean;
  isValidationSuccess: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  selectedAddressId: string;
  paymentTerm: string;
  transportCode: string;
  selectedPaymentTermOption?: { code: string; label: string } | null;
  selectedTransportOption?: { code: string; label: string } | null;
  detailedItems: DetailedItem[];
  totals: { subtotal: number; total: number; taxes?: number; discounts?: number; currencySymbol?: string; itemsCount?: number } | null;
  lastQuoteCreated: QuoteCreateResponse | null;
  onValidateCart: () => void;
  onCreateQuote: () => void;
}

export const QuoteSummaryAside: React.FC<QuoteSummaryAsideProps> = ({
  currency,
  formatPriceFromBackend,
  validationResult,
  isValidationInProgress,
  isValidationSuccess,
  isSubmitting,
  isValidating,
  selectedAddressId,
  paymentTerm,
  transportCode,
  selectedPaymentTermOption,
  selectedTransportOption,
  detailedItems,
  totals,
  lastQuoteCreated,
  onValidateCart,
  onCreateQuote,
}) => {
  return (
          <aside data-testid="quote-summary" className="lg:col-span-1 space-y-6">
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
                    data-testid="validate-cart-button"
                    onClick={onValidateCart}
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
              data-testid="submit-quote-button"
              onClick={onCreateQuote}
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

);
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MapPin,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCheckoutQuotePage } from './checkout-quote/useCheckoutQuotePage';
import {
  PAYMENT_TERMS_OPTIONS,
} from './checkout-quote/constants';
import { QuoteValidationAlerts } from './checkout-quote/QuoteValidationAlerts';
import { QuoteSummaryAside } from './checkout-quote/QuoteSummaryAside';

const CheckoutQuotePage: React.FC = () => {
  const {
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
    transportOptions,
    selectedPaymentTermOption,
    selectedTransportOption,
    totals,
    handleValidateCart,
    handleCreateQuote,
  } = useCheckoutQuotePage();

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

        <QuoteValidationAlerts
          data-testid="validation-alerts"
          errorMessage={errorMessage}
          conflictQuoteId={conflictQuoteId}
          onNavigateToConflict={(quoteId) =>
            navigate(`/profile/quotes/${quoteId}`, { state: { returnToTab: 'cotizaciones' } })
          }
          isValidationInProgress={isValidationInProgress}
          hasValidationError={hasValidationError}
          validationError={validationError}
          hasValidationWarnings={hasValidationWarnings}
          validationResult={validationResult}
          isValidationSuccess={isValidationSuccess}
          onRetryValidation={handleValidateCart}
        />

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
                      data-testid="address-option"
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
                    data-testid="payment-term-select"
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
                    data-testid="transport-select"
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
                data-testid="notes-textarea"
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

          <QuoteSummaryAside
            currency={currency}
            formatPriceFromBackend={formatPriceFromBackend}
            validationResult={validationResult}
            isValidationInProgress={isValidationInProgress}
            isValidationSuccess={isValidationSuccess}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            selectedAddressId={selectedAddressId}
            paymentTerm={paymentTerm}
            transportCode={transportCode}
            selectedPaymentTermOption={selectedPaymentTermOption}
            selectedTransportOption={selectedTransportOption}
            detailedItems={detailedItems}
            totals={totals}
            lastQuoteCreated={lastQuoteCreated}
            onValidateCart={handleValidateCart}
            onCreateQuote={handleCreateQuote}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutQuotePage;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  FileText,
  Home,
  MailCheck,
  MapPin,
} from 'lucide-react';
import type { QuoteCreateResponse } from '../types/quotes';

type LocationState = {
  quote?: QuoteCreateResponse;
  address?: {
    recipient_name: string;
    street: string;
    city: string;
    state: string;
    recipient_phone?: string;
  } | null;
  issuedAt?: string;
};

const formatCurrency = (value: string, currency: string) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  try {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: ['VES', 'USD'].includes(currency) ? currency : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
};

const formatDateTime = (isoString?: string | null) => {
  if (!isoString) {
    return 'Pendiente';
  }

  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
};

const QuoteSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const quote = state.quote;

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-green-50 pt-28 pb-20">
      <div className="medical-container">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-medical-primary/20 overflow-hidden">
          <div className="bg-medical-primary text-white px-8 py-10 flex flex-col items-center text-center gap-4">
            <BadgeCheck className="h-14 w-14 text-white drop-shadow-lg" />
            <h1 className="text-3xl font-bold">
              ¡Tu cotización está en marcha!
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Hemos registrado tu solicitud y nuestro equipo la procesará en Profit Plus.
              Recibirás un correo con todos los detalles.
            </p>
          </div>

          <div className="px-8 py-10 space-y-8">
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 p-6 bg-medical-blue-50/40">
                <div className="flex items-center gap-3 text-medical-primary mb-3">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Detalles de la cotización
                  </h2>
                </div>
                <ul className="space-y-2 text-medical-gray-700">
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Código interno:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {quote?.quote_id || 'Asignándose'}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      ID Profit Plus:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {quote?.profit_plus_id || 'Pendiente'}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Estado:
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-medical-primary">
                      <span className="h-2 w-2 rounded-full bg-medical-primary"></span>
                      {quote?.status ? quote.status.toUpperCase() : 'PENDING'}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Total estimado:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {quote
                        ? formatCurrency(quote.total_gross, quote.currency)
                        : 'Por confirmar'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 p-6 bg-medical-green-50/40">
                <div className="flex items-center gap-3 text-medical-primary mb-3">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Fechas importantes
                  </h2>
                </div>
                <ul className="space-y-2 text-medical-gray-700">
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Creación:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {state.issuedAt
                        ? formatDateTime(state.issuedAt)
                        : quote?.email_sent_at
                        ? formatDateTime(quote.email_sent_at)
                        : 'En cola'}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Vencimiento:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {quote ? formatDateTime(quote.expires_at) : 'Asignando fecha'}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="font-medium text-medical-gray-600">
                      Correo enviado:
                    </span>
                    <span className="font-semibold text-medical-gray-900">
                      {quote?.email_sent_at ? formatDateTime(quote.email_sent_at) : 'En cola'}
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {state.address && (
              <section className="rounded-3xl border border-gray-100 p-6 bg-white shadow-soft">
                <div className="flex items-center gap-3 text-medical-primary mb-4">
                  <MapPin className="h-5 w-5" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Entrega estimada
                  </h2>
                </div>
                <div className="text-medical-gray-700">
                  <p className="font-semibold text-medical-gray-900">
                    {state.address.recipient_name}
                  </p>
                  <p className="text-sm mt-1">
                    {state.address.street}, {state.address.city}, {state.address.state}
                  </p>
                  {state.address.recipient_phone && (
                    <p className="text-xs text-medical-gray-500 mt-2">
                      Teléfono: {state.address.recipient_phone}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-medical-primary/40 bg-medical-blue-50/20 p-6">
              <div className="flex items-start gap-3">
                <MailCheck className="h-6 w-6 text-medical-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-medical-gray-900">
                    ¿Qué ocurre ahora?
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-medical-gray-700 list-disc list-inside">
                    <li>Validamos stock y precios con Profit Plus.</li>
                    <li>Te escribiremos si necesitamos información adicional.</li>
                    <li>Podrás aceptar o convertir la cotización desde tu perfil.</li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
              <button
                onClick={() => navigate('/profile', { state: { defaultTab: 'cotizaciones' } })}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-medical-primary text-white font-semibold shadow-lg hover:bg-medical-primary-dark transition-all"
              >
                <ArrowRight className="h-5 w-5" />
                Ver mis cotizaciones
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-medical-primary text-medical-primary font-semibold hover:bg-medical-blue-50 transition-all"
              >
                <Home className="h-5 w-5" />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSuccessPage;


import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import type { CartValidationResponse } from '../../types/quotes';

interface QuoteValidationAlertsProps {
  errorMessage: string | null;
  conflictQuoteId?: string;
  onNavigateToConflict: (quoteId: string) => void;
  isValidationInProgress: boolean;
  hasValidationError: boolean;
  validationError: string | null;
  hasValidationWarnings: boolean;
  validationResult: CartValidationResponse | null;
  isValidationSuccess: boolean;
  onRetryValidation: () => void;
}

export const QuoteValidationAlerts: React.FC<QuoteValidationAlertsProps> = ({
  errorMessage,
  conflictQuoteId,
  onNavigateToConflict,
  isValidationInProgress,
  hasValidationError,
  validationError,
  hasValidationWarnings,
  validationResult,
  isValidationSuccess,
  onRetryValidation,
}) => {
  return (
    <>
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">No pudimos crear la cotización</p>
                <p className="text-sm mt-1">{errorMessage}</p>
                {conflictQuoteId && (
                  <button
                    onClick={() => onNavigateToConflict(conflictQuoteId)}
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
                  onClick={onRetryValidation}
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
                  onClick={onRetryValidation}
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


    </>
  );
};

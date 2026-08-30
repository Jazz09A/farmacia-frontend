import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Label for debugging / logging */
  name?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for critical route trees (checkout, profile, admin).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const label = this.props.name || 'ErrorBoundary';
    console.error(`[${label}]`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const title = this.props.fallbackTitle || 'Algo salió mal';
    const message =
      this.props.fallbackMessage ||
      'Ocurrió un error inesperado. Puedes reintentar o volver al inicio.';

    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-medical-gray-900">{title}</h2>
          <p className="text-sm text-medical-gray-600">{message}</p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-medical-gray-100 p-3 rounded overflow-auto max-h-32 text-red-700">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-medical-blue-600 text-white text-sm font-medium hover:bg-medical-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-medical-gray-300 text-medical-gray-800 text-sm font-medium hover:bg-medical-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

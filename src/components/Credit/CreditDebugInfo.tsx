import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const CreditDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = () => {
    setLoading(true);
    
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    const info = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      hasUser: !!user,
      userInfo: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString(),
      localStorageKeys: Object.keys(localStorage).filter(key => key.includes('auth'))
    };
    
    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Debug - Estado de Autenticación
        </h3>
        <button
          onClick={checkAuthStatus}
          disabled={loading}
          className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {debugInfo.hasToken ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium">Token de Autenticación:</span>
            <span className={debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.hasToken ? 'Presente' : 'Ausente'}
            </span>
          </div>
          
          <div className="pl-6">
            <p className="text-gray-600">
              <strong>Preview:</strong> {debugInfo.tokenPreview}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {debugInfo.hasUser ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium">Datos de Usuario:</span>
            <span className={debugInfo.hasUser ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.hasUser ? 'Presentes' : 'Ausentes'}
            </span>
          </div>

          {debugInfo.userInfo && (
            <div className="pl-6">
              <p className="text-gray-600">
                <strong>Usuario:</strong> {debugInfo.userInfo.company_name || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {debugInfo.userInfo.email || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Rol:</strong> {debugInfo.userInfo.role || 'N/A'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-medium">Claves en localStorage:</span>
            <div className="pl-2 mt-1">
              {debugInfo.localStorageKeys.map((key: string) => (
                <div key={key} className="text-gray-600 text-xs">
                  • {key}
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="font-medium">Última verificación:</span>
            <p className="text-gray-600 text-xs">
              {new Date(debugInfo.timestamp).toLocaleString('es-VE')}
            </p>
          </div>
        </div>
      </div>

      {!debugInfo.hasToken && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Problema de Autenticación</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            No se encontró token de autenticación. Por favor, inicia sesión nuevamente.
          </p>
        </div>
      )}
    </div>
  );
};

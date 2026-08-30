import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

/**
 * Seguimiento de pedidos legacy deshabilitado:
 * /api/v1/user/orders/{id} no está montado en backend.
 * El flujo de negocio es cotizaciones.
 */
const TrackingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-medical-gray-50 pt-24 pb-12">
      <div className="medical-container">
        <div className="bg-white rounded-2xl shadow-soft p-6 text-center max-w-lg mx-auto">
          <Package className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-medical-gray-900 mb-2">
            Seguimiento no disponible
          </h1>
          <p className="text-medical-gray-600 mb-6">
            El seguimiento de pedidos directos no está habilitado. Los pedidos se gestionan vía cotizaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/profile" state={{ defaultTab: 'cotizaciones' }} className="btn-medical-primary">
              Ver cotizaciones
            </Link>
            <Link to="/profile" state={{ defaultTab: 'pedidos' }} className="btn-medical-secondary">
              Ir al perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;

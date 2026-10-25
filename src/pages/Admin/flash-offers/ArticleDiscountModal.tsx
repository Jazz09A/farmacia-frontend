import React from 'react';
import {
  Edit,
  AlertCircle,
  XCircle,
  Tag,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';

interface ArticleDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onEdit?: (code: string) => void;
  onEditFlashOffer?: () => void;
  onDeleteFlashOffer?: () => void;
}

export const ArticleDiscountModal: React.FC<ArticleDiscountModalProps> = ({
  isOpen,
  onClose,
  data,
  onEdit,
  onEditFlashOffer,
  onDeleteFlashOffer,
}) => {
  if (!isOpen || !data) return null;

  // Función auxiliar para formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 sm:p-4 z-[9999]" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        margin: 0,
        padding: '12px',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] transform transition-all duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white rounded-t-xl lg:rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Detalles del Descuento
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Información detallada del descuento para el artículo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Resumen Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-600 font-medium mb-1">Código Artículo</div>
              <div className="text-lg font-bold text-gray-900">{data.co_art?.trim() || 'N/A'}</div>
              <div className="text-xs text-blue-500 mt-1">{data.art_des || 'Sin descripción'}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="text-sm text-purple-600 font-medium mb-1">Código Descuento</div>
              <div className="text-lg font-bold text-gray-900">{data.co_desc || 'N/A'}</div>
              <div className="text-xs text-purple-500 mt-1">{data.des_des || 'Sin descripción'}</div>
            </div>
          </div>

          {/* Detalles Específicos */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
              Vigencia y Estado
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fecha Inicio</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(data.fecha_ini)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fecha Fin</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(data.fecha_fin)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Estado</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    data.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tipo Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">{data.tip_cli?.trim() || 'N/A'}</p>
                </div>
              </div>

              {data.campo1 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Campo 1</p>
                    <p className="text-sm font-semibold text-gray-900">{data.campo1}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Escalas de Descuento */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
              Escalas de Descuento
            </h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasta (Unidades)</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5]
                    .filter((level) => {
                      const hasta = data[`hasta${level}`];
                      const porc = data[`porc${level}`];
                      return hasta || porc;
                    })
                    .map((level) => {
                    const hasta = data[`hasta${level}`];
                    const porc = data[`porc${level}`];

                    return (
                      <tr key={level}>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{level}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{hasta ? parseFloat(hasta).toString() : '-'}</td>
                        <td className="px-4 py-2 text-sm text-green-600 font-bold">{porc ? `${parseFloat(porc)}%` : '-'}</td>
                      </tr>
                    );
                  })}
                  {!data.hasta1 && !data.porc1 && (
                    <tr key="no-scales">
                      <td colSpan={3} className="px-4 py-4 text-sm text-gray-500 text-center italic">
                        No hay escalas definidas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl lg:rounded-b-2xl flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {(onEditFlashOffer || onDeleteFlashOffer) && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* {onEditFlashOffer && (
                <button
                  onClick={onEditFlashOffer}
                  className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 font-medium text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Edit className="w-4 h-4" />
                  Editar oferta flash
                </button>
              )} */}
              {/* {onDeleteFlashOffer && (
                <button
                  onClick={onDeleteFlashOffer}
                  className="px-5 py-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 font-medium text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar oferta
                </button>
              )} */}
            </div>
          )}
          <div className="flex justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(data.co_desc || '')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-all active:scale-95"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Editar descuento ERP
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 font-medium text-sm shadow-sm transition-all active:scale-95"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

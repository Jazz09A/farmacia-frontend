import React from 'react';
import { Product } from '../../types';
import {
  XCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  DollarSign,
  Star,
  Tag,
  Layers,
  BarChart3,
  Calendar,
  Image as ImageIcon,
  TrendingUp
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
};

const getStockStatusInfo = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    switch (status) {
      case 'in_stock':
        return { 
            icon: <CheckCircle className="w-5 h-5 text-green-500" />, 
            text: 'En Stock',
            className: 'text-green-600'
        };
      case 'low_stock':
        return { 
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, 
            text: 'Stock Bajo',
            className: 'text-yellow-600'
        };
      case 'out_of_stock':
        return { 
            icon: <XCircle className="w-5 h-5 text-red-500" />, 
            text: 'Agotado',
            className: 'text-red-600'
        };
      default:
        return { 
            icon: <AlertTriangle className="w-5 h-5 text-gray-500" />, 
            text: 'Desconocido',
            className: 'text-gray-600'
        };
    }
};

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const stockInfo = getStockStatusInfo(product.in_stock ? 'in_stock' : 'out_of_stock');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md md:max-w-4xl w-full max-h-[95vh] transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-16 h-16 mr-4 rounded-lg overflow-hidden border border-gray-200">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500">{product.brand}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Detalles Principales */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Detalles del Producto</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Categoría:</span>
                  <span className="font-medium text-gray-800">{product.category}</span>
                </div>
                <div className="flex items-center">
                  <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Stock:</span>
                  <span className={`font-bold flex items-center ${stockInfo.className}`}>
                    {stockInfo.icon}
                    <span className="ml-1.5">{stockInfo.text} ({product.stock} unidades)</span>
                  </span>
                </div>
                 <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Precio:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(product.price_ves)}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Rating:</span>
                  <span className="font-medium text-gray-800">{0} / 5 ({0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Última Actualización:</span>
                  <span className="font-medium text-gray-800">{formatDate(product.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas de Rendimiento */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Estadísticas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Vistas:</span>
                  <span className="font-medium text-gray-800">{0}</span>
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Ventas:</span>
                  <span className="font-medium text-gray-800">{0}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Ingresos:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(product.price_ves)}</span>
                </div>
                 <div className="flex items-center">
                  <ImageIcon className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Requiere Prescripción:</span>
                  <span className={`font-medium ${product.prescription ? 'text-red-600' : 'text-green-600'}`}>
                    {product.prescription ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción e Imágenes */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {product.description}
              </p>
            </div>
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Galería de Imágenes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {product.images.map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200 aspect-square">
                       <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 
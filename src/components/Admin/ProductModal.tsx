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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-4xl max-h-[95vh] transform transition-all duration-300 ease-in-out flex flex-col">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">{product.brand}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              <XCircle className="w-6 h-6 lg:w-7 lg:h-7" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Detalles Principales */}
            <div className="space-y-3 lg:space-y-4 bg-gray-50 p-3 lg:p-4 rounded-lg">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 border-b pb-2 mb-2 lg:mb-3">Detalles del Producto</h3>
              <div className="space-y-2 lg:space-y-3 text-sm">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Categoría:</span>
                  <span className="font-medium text-gray-800 truncate">{product.category}</span>
                </div>
                <div className="flex items-start">
                  <Layers className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 mr-2">Stock:</span>
                  <div className={`font-bold flex items-center ${stockInfo.className}`}>
                    {stockInfo.icon}
                    <span className="ml-1.5">{stockInfo.text} ({product.stock} unidades)</span>
                  </div>
                </div>
                 <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Precio:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(product.price_ves)}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Rating:</span>
                  <span className="font-medium text-gray-800">{0} / 5 ({0} reviews)</span>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 mr-2">Última Actualización:</span>
                  <span className="font-medium text-gray-800 break-words">{formatDate(product.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas de Rendimiento */}
            <div className="space-y-3 lg:space-y-4 bg-gray-50 p-3 lg:p-4 rounded-lg">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 border-b pb-2 mb-2 lg:mb-3">Estadísticas</h3>
              <div className="space-y-2 lg:space-y-3 text-sm">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Vistas:</span>
                  <span className="font-medium text-gray-800">{0}</span>
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Ventas:</span>
                  <span className="font-medium text-gray-800">{0}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="text-gray-500 mr-2">Ingresos:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(product.price_ves)}</span>
                </div>
                 <div className="flex items-start">
                  <ImageIcon className="w-4 h-4 text-gray-400 mr-2 lg:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 mr-2">Requiere Prescripción:</span>
                  <span className={`font-medium ${product.prescription ? 'text-red-600' : 'text-green-600'}`}>
                    {product.prescription ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción e Imágenes */}
          <div className="space-y-3 lg:space-y-4">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 lg:p-4 rounded-lg">
                {product.description}
              </p>
            </div>
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-2">Galería de Imágenes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  {product.images.map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200 aspect-square cursor-pointer group">
                       <img 
                         src={img} 
                         alt={`${product.name} ${index + 1}`} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                       />
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
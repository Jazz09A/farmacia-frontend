// 🔥 Admin Flash Offers Management Page
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingDown,
  Filter,
  RefreshCw,
  AlertCircle,
  XCircle,
  Tag,
  Calendar,
  Layers,
  CheckCircle,
  Search,
  ChevronDown,
  Package
} from 'lucide-react';
import { 
  useAdminFlashOffersQuery, 
  useCreateFlashOfferMutation,
  useUpdateFlashOfferMutation,
  useDeleteFlashOfferMutation,
  useToggleFlashOfferStatusMutation
} from '../../hooks/queries/useFlashOffersQueries';
import { FlashOfferFilters, flashOfferService } from '../../services/FlashOfferService';
import { FlashOfferWithProduct, CreateFlashOfferPayload, Product } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import { useProductsQuery } from '../../hooks/queries/useProductsQueries';

type FlashOfferFormValues = {
  productCode: string; // co_art
  desDes: string; // des_des - Descripción de la promoción
  startDate: string; // fecha_ini
  endDate: string; // fecha_fin
  hasta1: string; // hasta1 - Cantidad máxima para primer descuento
  porc1: string; // porc1 - Porcentaje del primer descuento
  hasta2: string; // hasta2 - Cantidad máxima para segundo descuento (opcional)
  porc2: string; // porc2 - Porcentaje del segundo descuento (opcional)
  campo1: string; // campo1 - Observación interna (opcional)
};

const defaultFormValues: FlashOfferFormValues = {
  productCode: '',
  desDes: 'Promo Web',
  startDate: '',
  endDate: '',
  hasta1: '',
  porc1: '',
  hasta2: '',
  porc2: '',
  campo1: '',
};

const formatDateForInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoString = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

interface FlashOfferFormModalProps {
  title: string;
  isOpen: boolean;
  initialValues: FlashOfferFormValues;
  onClose: () => void;
  onSubmit: (values: FlashOfferFormValues) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
  errorMessage?: string | null;
  onFetchProfitData?: (code: string) => Promise<any>;
}

const FlashOfferFormModal: React.FC<FlashOfferFormModalProps> = ({
  title,
  isOpen,
  initialValues,
  onClose,
  onSubmit,
  submitting,
  submitLabel,
  errorMessage,
  onFetchProfitData
}) => {
  const [values, setValues] = useState<FlashOfferFormValues>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setFormError(null);
    }
  }, [initialValues, isOpen]);

  const handleChange = (field: keyof FlashOfferFormValues, value: string | boolean) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Obtener productos con cache
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: productsData, isLoading: productsLoading } = useProductsQuery({
    search: searchQuery,
    limit: 50,
    page: 1
  });

  const products = productsData?.products || [];
  const selectedProduct = useMemo(() => {
    if (!values.productCode) return null;
    return products.find(p => p.id === values.productCode);
  }, [values.productCode, products]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    };

    if (isProductDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProductDropdownOpen]);

  const handleProductSelect = (product: Product) => {
    setValues(prev => ({ ...prev, productCode: product.id }));
    setIsProductDropdownOpen(false);
    setSearchQuery('');
  };

  const handleSyncProfit = async () => {
    if (!onFetchProfitData || !selectedProduct) return;
    
    // Obtener el código del producto para sincronizar con Profit
    // Asumiendo que el id del producto es el código de Profit
    const productCode = selectedProduct.id;
    
    setSyncing(true);
    setFormError(null);
    try {
      const data = await onFetchProfitData(productCode);
      
      if (data) {
        setValues(prev => ({
          ...prev,
          // Mapeo de campos basado en el JSON de Profit
          desDes: data.des_des || prev.desDes || 'Promo Web',
          porc1: data.porc1 ? parseFloat(data.porc1).toString() : prev.porc1,
          hasta1: data.hasta1 ? data.hasta1.toString() : prev.hasta1,
          porc2: data.porc2 ? parseFloat(data.porc2).toString() : prev.porc2,
          hasta2: data.hasta2 ? data.hasta2.toString() : prev.hasta2,
          startDate: data.fecha_ini ? new Date(data.fecha_ini).toISOString().slice(0, 16) : prev.startDate,
          endDate: data.fecha_fin ? new Date(data.fecha_fin).toISOString().slice(0, 16) : prev.endDate,
          campo1: data.campo1 || prev.campo1 || ''
        }));
      } else {
        setFormError('No se encontró información de descuento para este artículo.');
      }
    } catch (error) {
      console.error('Error syncing with Profit:', error);
      setFormError('Error al sincronizar con Profit.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!values.productCode.trim()) {
      setFormError('Debes seleccionar un producto.');
      return;
    }
    if (!values.desDes.trim()) {
      setFormError('Debes ingresar una descripción de la promoción.');
      return;
    }
    if (!values.porc1 || Number(values.porc1) <= 0 || Number(values.porc1) > 100) {
      setFormError('Define un porcentaje de descuento válido (1-100).');
      return;
    }
    if (!values.hasta1 || Number(values.hasta1) <= 0) {
      setFormError('Define una cantidad máxima válida para el primer descuento.');
      return;
    }
    if (!values.startDate || !values.endDate) {
      setFormError('Selecciona la fecha de inicio y fin.');
      return;
    }
    if (new Date(values.startDate) >= new Date(values.endDate)) {
      setFormError('La fecha de inicio debe ser menor a la de fin.');
      return;
    }
    // Validar segundo descuento si está completo
    if (values.hasta2 && values.porc2) {
      if (Number(values.hasta2) <= Number(values.hasta1)) {
        setFormError('La cantidad del segundo descuento debe ser mayor que la del primero.');
        return;
      }
      if (Number(values.porc2) <= 0 || Number(values.porc2) > 100) {
        setFormError('El porcentaje del segundo descuento debe ser válido (1-100).');
        return;
      }
    }

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      setFormError(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        margin: 0,
        padding: '16px',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              Completa los campos según la guía de ofertas flash.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Producto
              <div className="relative mt-1">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={productSearchRef}
                      type="text"
                      value={selectedProduct ? selectedProduct.name : searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsProductDropdownOpen(true);
                        if (!e.target.value) {
                          setValues(prev => ({ ...prev, productCode: '' }));
                        }
                      }}
                      onFocus={() => {
                        if (!selectedProduct) {
                          setIsProductDropdownOpen(true);
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={selectedProduct ? selectedProduct.name : "Buscar producto por nombre..."}
                      readOnly={!!selectedProduct}
                    />
                    {selectedProduct ? (
                      <button
                        type="button"
                        onClick={() => {
                          setValues(prev => ({ ...prev, productCode: '' }));
                          setSearchQuery('');
                          setIsProductDropdownOpen(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Limpiar selección"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    ) : (
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {onFetchProfitData && selectedProduct && (
                    <button
                      type="button"
                      onClick={handleSyncProfit}
                      disabled={syncing}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      title="Sincronizar con Profit"
                    >
                      <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
                
                {/* Dropdown de productos */}
                {isProductDropdownOpen && !selectedProduct && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {productsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Cargando productos...</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Package className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No se encontraron productos</p>
                        {searchQuery && (
                          <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
                        )}
                      </div>
                    ) : (
                      <ul className="py-1">
                        {products.map((product) => (
                          <li
                            key={product.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {product.brand && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {product.brand}
                                    </p>
                                  )}
                                  {product.category && (
                                    <>
                                      <span className="text-xs text-gray-300">•</span>
                                      <p className="text-xs text-gray-500 truncate">
                                        {product.category}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
              </div>
            </label>

            {/* Mostrar información del producto seleccionado */}
            {selectedProduct ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 mb-1">Producto seleccionado</span>
                <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 mb-2">
                        {selectedProduct.name}
                      </p>
                      {selectedProduct.category && (
                        <p className="text-sm text-gray-600 mb-1">
                          Categoría: {selectedProduct.category}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 font-mono">
                        Código: {selectedProduct.id}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 ml-3" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 mb-1">Producto seleccionado</span>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-400 text-center">
                    Selecciona un producto para continuar
                  </p>
                </div>
              </div>
            )}

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Descripción de la promoción
              <input
                type="text"
                value={values.desDes}
                onChange={(e) => handleChange('desDes', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: Promo Web"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Primer descuento - Cantidad máxima
              <input
                type="number"
                min="1"
                value={values.hasta1}
                onChange={(e) => handleChange('hasta1', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 100"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Primer descuento - Porcentaje (%)
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={values.porc1}
                onChange={(e) => handleChange('porc1', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 15 (para 15%)"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Segundo descuento - Cantidad máxima (opcional)
              <input
                type="number"
                min="1"
                value={values.hasta2}
                onChange={(e) => handleChange('hasta2', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 200"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Segundo descuento - Porcentaje % (opcional)
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={values.porc2}
                onChange={(e) => handleChange('porc2', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 20 (para 20%)"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Observación interna (opcional)
              <input
                type="text"
                value={values.campo1}
                onChange={(e) => handleChange('campo1', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: Observación interna"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Inicio de la oferta
              <input
                type="datetime-local"
                value={values.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Fin de la oferta
              <input
                type="datetime-local"
                value={values.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </label>

          </div>

          {(formError || errorMessage) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{formError || errorMessage}</span>
            </div>
          )}

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ArticleDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onEdit?: (code: string) => void;
  onEditFlashOffer?: () => void;
  onDeleteFlashOffer?: () => void;
}

interface EditArticleDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (code: string, payload: any) => Promise<void>;
  submitting?: boolean;
}

const ArticleDiscountModal: React.FC<ArticleDiscountModalProps> = ({
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

const EditArticleDiscountModal: React.FC<EditArticleDiscountModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  submitting = false
}) => {
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const formatDecimalString = (value: any, decimals = 2) => {
    if (value === null || value === undefined || value === '') return '';
    const numericValue =
      typeof value === 'string'
        ? parseFloat(value.replace(',', '.'))
        : typeof value === 'number'
          ? value
          : Number(value);
    if (Number.isNaN(numericValue)) return '';
    return numericValue.toFixed(decimals);
  };

  const normalizeNumericInput = (value: string) =>
    value.replace(/[^\d.,-]/g, '').replace(',', '.');

  const handleNumberChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: normalizeNumericInput(value),
    }));
  };

  const handleNumberBlur = (field: string, decimals = 2) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: formatDecimalString(prev[field], decimals),
    }));
  };

  React.useEffect(() => {
    if (isOpen && data) {
      setFormData({
        co_desc: data.co_desc || '',
        co_art: data.co_art?.trim() || '',
        fecha_ini: data.fecha_ini ? new Date(data.fecha_ini).toISOString().slice(0, 16) : '',
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString().slice(0, 16) : '',
        is_active: data.is_active ?? true,
        hasta1: formatDecimalString(data.hasta1, 2),
        porc1: formatDecimalString(data.porc1, 2),
        hasta2: formatDecimalString(data.hasta2, 2),
        porc2: formatDecimalString(data.porc2, 2),
        hasta3: formatDecimalString(data.hasta3, 2),
        porc3: formatDecimalString(data.porc3, 2),
        hasta4: formatDecimalString(data.hasta4, 2),
        porc4: formatDecimalString(data.porc4, 2),
        hasta5: formatDecimalString(data.hasta5, 2),
        porc5: formatDecimalString(data.porc5, 2),
        hasta6: formatDecimalString(data.hasta6, 2),
        porc6: formatDecimalString(data.porc6, 2),
      });
      setFormError(null);
    }
  }, [isOpen, data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.co_art?.trim()) {
      setFormError('El código del artículo es requerido.');
      return;
    }

    if (!formData.co_desc?.trim()) {
      setFormError('El código del descuento es requerido.');
      return;
    }

    if (!formData.fecha_ini || !formData.fecha_fin) {
      setFormError('Las fechas de inicio y fin son requeridas.');
      return;
    }

    if (new Date(formData.fecha_ini) >= new Date(formData.fecha_fin)) {
      setFormError('La fecha de inicio debe ser menor a la fecha de fin.');
      return;
    }

    try {
      const payload: any = {
        co_desc: formData.co_desc.trim(),
        co_art: formData.co_art.trim(),
        fecha_ini: new Date(formData.fecha_ini).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        is_active: formData.is_active,
      };

      // Agregar escalas solo si tienen valores
      for (let i = 1; i <= 6; i++) {
        if (formData[`hasta${i}`] || formData[`porc${i}`]) {
          payload[`hasta${i}`] = formData[`hasta${i}`] ? parseFloat(formData[`hasta${i}`]).toFixed(5) : null;
          payload[`porc${i}`] = formData[`porc${i}`] ? parseFloat(formData[`porc${i}`]).toFixed(5) : null;
        }
      }

      await onSave(formData.co_desc.trim(), payload);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar los cambios.';
      setFormError(message);
    }
  };

  if (!isOpen || !data) return null;

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
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white rounded-t-xl lg:rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Editar Descuento del Artículo
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Modifica los campos del descuento en el sistema ERP
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Código Artículo
              <input
                type="text"
                value={formData.co_art || ''}
                readOnly
                disabled
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 uppercase cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Código Descuento
              <input
                type="text"
                value={formData.co_desc || ''}
                onChange={(e) => handleChange('co_desc', e.target.value.toUpperCase())}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Fecha Inicio
              <input
                type="datetime-local"
                value={formData.fecha_ini || ''}
                onChange={(e) => handleChange('fecha_ini', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Fecha Fin
              <input
                type="datetime-local"
                value={formData.fecha_fin || ''}
                onChange={(e) => handleChange('fecha_fin', e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 md:col-span-2">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
              />
              Activo
            </label>
          </div>

          {/* Escalas de Descuento */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
              Escalas de Descuento
            </h4>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <div key={level} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">Nivel {level}</span>
                  </div>
                  <label className="flex flex-col text-xs font-medium text-gray-600">
                    Hasta (Unidades)
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData[`hasta${level}`] || ''}
                      onChange={(e) => handleNumberChange(`hasta${level}`, e.target.value)}
                      onBlur={() => handleNumberBlur(`hasta${level}`, 2)}
                      className="mt-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </label>
                  <label className="flex flex-col text-xs font-medium text-gray-600">
                    Porcentaje (%)
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData[`porc${level}`] || ''}
                      onChange={(e) => handleNumberChange(`porc${level}`, e.target.value)}
                      onBlur={() => handleNumberBlur(`porc${level}`, 2)}
                      className="mt-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminFlashOffersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FlashOfferFilters>({
    active_only: false,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FlashOfferWithProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showEditDiscountModal, setShowEditDiscountModal] = useState(false);
  const [discountData, setDiscountData] = useState<any>(null);
  const [updatingDiscount, setUpdatingDiscount] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: flashOffersResponse, isLoading: loading, error, refetch } = useAdminFlashOffersQuery(filters);
  const createMutation = useCreateFlashOfferMutation();
  const updateMutation = useUpdateFlashOfferMutation();
  const deleteMutation = useDeleteFlashOfferMutation();
  const toggleStatusMutation = useToggleFlashOfferStatusMutation();

  const offers = flashOffersResponse?.flash_offers || [];
  const totalCount = flashOffersResponse?.total_count || 0;
  const activeCount = flashOffersResponse?.active_count || 0;

  const actions = {
    refresh: async () => {
      setIsRefreshing(true);
      try {
        await refetch();
        showNotification('success', 'Ofertas actualizadas correctamente');
      } catch (error) {
        showNotification('error', 'Error al actualizar las ofertas');
      } finally {
        setIsRefreshing(false);
      }
    },
    create: async (payload: CreateFlashOfferPayload) => {
      try {
      await createMutation.mutateAsync(payload);
        // Invalidar y refetch para mostrar el nuevo offer inmediatamente
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash creada correctamente');
        setShowCreateModal(false);
      } catch (error) {
        showNotification('error', 'Error al crear la oferta flash');
        throw error;
      }
    },
    update: async (id: string, payload: Partial<CreateFlashOfferPayload>) => {
      try {
      await updateMutation.mutateAsync({ id, payload });
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash actualizada correctamente');
      } catch (error) {
        showNotification('error', 'Error al actualizar la oferta flash');
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
      await deleteMutation.mutateAsync(id);
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash eliminada correctamente');
      } catch (error) {
        showNotification('error', 'Error al eliminar la oferta flash');
        throw error;
      }
    },
    toggleStatus: async (id: string, is_active: boolean) => {
      try {
      await toggleStatusMutation.mutateAsync({ id, is_active });
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', `Oferta ${is_active ? 'activada' : 'desactivada'} correctamente`);
      } catch (error) {
        showNotification('error', 'Error al cambiar el estado de la oferta');
        throw error;
      }
    },
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    if (notificationHideTimeoutRef.current) {
      clearTimeout(notificationHideTimeoutRef.current);
    }

    setNotification({ type, message });

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => setNotificationVisible(true));
    } else {
      setNotificationVisible(true);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotificationVisible(false);
      notificationHideTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 250);
    }, 3500);
  };

  const handleCloseNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    if (notificationHideTimeoutRef.current) {
      clearTimeout(notificationHideTimeoutRef.current);
    }
    setNotificationVisible(false);
    notificationHideTimeoutRef.current = setTimeout(() => setNotification(null), 200);
  };

  React.useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      if (notificationHideTimeoutRef.current) clearTimeout(notificationHideTimeoutRef.current);
    };
  }, []);

  const fetchArticleDiscountCached = React.useCallback(async (coDesc: string) => {
    const normalizedCode = coDesc?.trim();
    
    if (!coDesc) {
      throw new Error('Código de descuento inválido');
    }

    return queryClient.fetchQuery({
      queryKey: ['article-discount', normalizedCode],
      queryFn: () => flashOfferService.getArticleDiscount(normalizedCode),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
    });
  }, [queryClient]);

  const handleOfferRowClick = (offer: FlashOfferWithProduct) => {
    // Usar co_desc (código del descuento) en lugar de co_art (código del artículo)
    const discountCode = offer.co_desc;
    
    if (!discountCode) {
      showNotification('error', 'No se encontró el código del descuento.');
      return;
    }
    setSelectedOffer(offer);
    handleViewArticleDiscount(discountCode);
  };

  const handleOfferRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, offer: FlashOfferWithProduct) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOfferRowClick(offer);
    }
  };

  const handleViewArticleDiscount = async (coDesc: string) => {
    try {
      const data = await fetchArticleDiscountCached(coDesc);
      setDiscountData(data);
      setShowDiscountModal(true);
    } catch (error) {
      console.error('Error fetching article discount:', error);
      showNotification('error', 'No se pudo mostrar los detalles del descuento.');
    }
  };

  const handleEditArticleDiscount = async (coDesc: string) => {
    try {
      const data = await fetchArticleDiscountCached(coDesc);
      setDiscountData(data);
      setShowEditDiscountModal(true);
    } catch (error) {
      console.error('Error fetching article discount for edit:', error);
      showNotification('error', 'No se pudo cargar la información para editar este descuento.');
    }
  };

  const handleSaveArticleDiscount = async (coDesc: string, payload: any) => {
    setUpdatingDiscount(true);
    try {
      await flashOfferService.updateArticleDiscount(coDesc, payload);
      // Revalidar y actualizar caché
      const updatedData = await fetchArticleDiscountCached(coDesc);
      queryClient.setQueryData(['article-discount', coDesc.trim()], updatedData);
      setDiscountData(updatedData);
      setShowEditDiscountModal(false);
      showNotification('success', 'Descuento actualizado correctamente.');
    } catch (error) {
      console.error('Error updating article discount:', error);
      showNotification('error', 'No se pudo guardar el descuento. Intenta nuevamente.');
      throw error;
    } finally {
      setUpdatingDiscount(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oferta flash?')) {
      try {
        await actions.delete(offerId);
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const mapFormValuesToPayload = (values: FlashOfferFormValues): CreateFlashOfferPayload => {
    const payload: CreateFlashOfferPayload = {
      co_art: values.productCode.trim(),
      des_des: values.desDes.trim(),
      fecha_ini: toIsoString(values.startDate) || new Date().toISOString(),
      fecha_fin: toIsoString(values.endDate) || new Date().toISOString(),
      hasta1: Number(values.hasta1),
      porc1: Number(values.porc1),
    };
    
    // Agregar segundo descuento solo si ambos campos están completos
    if (values.hasta2 && values.porc2) {
      payload.hasta2 = Number(values.hasta2);
      payload.porc2 = Number(values.porc2);
    }
    
    // Agregar observación interna si está presente
    if (values.campo1.trim()) {
      payload.campo1 = values.campo1.trim();
    }
    
    return payload;
  };

  const mapOfferToFormValues = (offer: FlashOfferWithProduct): FlashOfferFormValues => {
    // Nota: Esta función puede necesitar ajustes según la estructura de respuesta del backend
    // Por ahora, mapeamos a valores por defecto ya que el backend puede devolver datos en formato diferente
    return {
      productCode: offer.product_id || offer.product?.id || '',
      desDes: 'Promo Web', // Valor por defecto, debería venir del backend
      startDate: formatDateForInput(offer.start_time),
      endDate: formatDateForInput(offer.end_time),
      hasta1: offer.max_quantity ? offer.max_quantity.toString() : '',
      porc1: offer.discount_value ? offer.discount_value.toString() : '',
      hasta2: '',
      porc2: '',
      campo1: '',
    };
  };

  const editInitialValues = useMemo(() => {
    return selectedOffer ? mapOfferToFormValues(selectedOffer) : defaultFormValues;
  }, [selectedOffer]);

  const handleCreateSubmit = async (values: FlashOfferFormValues) => {
    try {
    const payload = mapFormValuesToPayload(values);
    await actions.create(payload);
    } catch (error) {
      // El error ya se maneja en actions.create
      console.error('Error creating flash offer:', error);
    }
  };

  const handleEditSubmit = async (values: FlashOfferFormValues) => {
    if (!selectedOffer?.id) return;
    const payload = mapFormValuesToPayload(values);
    await actions.update(selectedOffer.id, payload);
  };

  const openEditModal = async (offer: FlashOfferWithProduct) => {
    try {
      const discountCode = offer.co_desc;
      let updatedOffer = { ...offer };

      if (discountCode) {
        try {
          // Obtener datos del ERP usando el código del descuento (co_desc)
          const erpData = await flashOfferService.getArticleDiscount(discountCode);
          
          if (erpData && erpData.success) {
            updatedOffer = {
              ...updatedOffer,
              // Mapear valor del descuento (asumiendo porcentaje si viene en porc1)
              discount_value: erpData.porc1 ? parseFloat(erpData.porc1) : updatedOffer.discount_value,
              discount_type: erpData.porc1 ? 'percentage' : updatedOffer.discount_type,
              
              // Mapear fechas
              start_time: erpData.fecha_ini || updatedOffer.start_time,
              end_time: erpData.fecha_fin || updatedOffer.end_time,
              
              // Mapear stock/cantidad disponible (campo1 según tu ejemplo)
              max_quantity: erpData.campo1 ? parseInt(erpData.campo1) : updatedOffer.max_quantity
            };
          }
        } catch (e) {
          console.warn("No se pudo obtener info del ERP al editar, usando datos locales", e);
        }
      }

      setSelectedOffer(updatedOffer);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error al preparar edición:", error);
      // Fallback
    setSelectedOffer(offer);
    setShowEditModal(true);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOffer(null);
  };

  const getStatusColor = (isActive: boolean, endTime: string) => {
    if (!isActive) return 'gray';
    const isExpired = new Date(endTime) < new Date();
    if (isExpired) return 'red';
    return 'green';
  };

  const getStatusText = (isActive: boolean, endTime: string) => {
    if (!isActive) return 'Inactiva';
    const isExpired = new Date(endTime) < new Date();
    if (isExpired) return 'Expirada';
    return 'Activa';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 lg:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 lg:gap-3">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
              <span className="truncate">Ofertas Flash</span>
            </h1>
            {loading && (
              <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500 animate-spin" />
            )}
          </div>
          <p className="mt-1 text-sm lg:text-base text-gray-600">Gestiona las ofertas flash de GRUPO DROZAINKA</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 lg:gap-6 mt-3 lg:mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs lg:text-sm font-medium text-gray-600">
                {activeCount} Activas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
              <span className="text-xs lg:text-sm font-medium text-gray-600">
                {totalCount} Total
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3 w-full sm:w-auto">
          {/* Refresh Button */}
          <button
            onClick={() => actions.refresh()}
            disabled={loading || isRefreshing}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Nueva Oferta Flash</span>
            <span className="sm:hidden">Nueva Oferta</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.active_only}
              onChange={(e) => setFilters(prev => ({ ...prev, active_only: e.target.checked }))}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs lg:text-sm text-gray-700">Solo activas</span>
          </label>

          <select
            value={filters.sort_by}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              sort_by: e.target.value as FlashOfferFilters['sort_by']
            }))}
            className="text-xs lg:text-sm border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="created_at">Fecha de creación</option>
            <option value="end_time">Fecha de vencimiento</option>
            <option value="discount_value">Descuento</option>
          </select>

          <select
            value={filters.sort_order}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              sort_order: e.target.value as FlashOfferFilters['sort_order']
            }))}
            className="text-xs lg:text-sm border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 text-sm">
              {error instanceof Error ? error.message : 'Error al cargar las ofertas flash'}
            </p>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide">Producto</th>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide hidden md:table-cell">Código</th>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide hidden lg:table-cell">Promoción</th>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide">Descuento</th>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide hidden sm:table-cell">Vencimiento</th>
                <th scope="col" className="px-4 lg:px-8 py-4 font-semibold tracking-wide hidden sm:table-cell">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-8 py-5">
                      <div className="space-y-2.5">
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-5 hidden md:table-cell">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 lg:px-8 py-5 hidden lg:table-cell">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 lg:px-8 py-5">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 lg:px-8 py-5 hidden sm:table-cell">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 lg:px-8 py-5 hidden sm:table-cell">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : offers.length > 0 ? (
                offers.map((offer, index) => {
                  const statusColor = getStatusColor(offer.is_active, offer.end_time);
                  const statusText = getStatusText(offer.is_active, offer.end_time);

                  // Obtener datos directamente del offer (que viene del mapeo)
                  const productName = offer.product?.name || 'Producto sin nombre';
                  const discountCode = offer.co_desc || '-';
                  const promoName = offer.des_des || 'Promoción';
                  const discountValue = offer.discount_value || 0;
                  const discountType = offer.discount_type || 'percentage';

                  return (
                    <tr
                      key={offer.id || offer.product_id || `offer-${index}`}
                      className="group hover:bg-gray-50 focus-within:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                      onClick={() => handleOfferRowClick(offer)}
                      onKeyDown={(event) => handleOfferRowKeyDown(event, offer)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver descuento de ${productName}`}
                    >
                      <td className="px-4 lg:px-8 py-5">
                          <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm lg:text-base leading-relaxed">
                            {productName}
                            </div>
                          <div className="text-xs text-gray-500 mt-1.5 font-mono">
                            {offer.product_id || offer.product?.id || '-'}
                          </div>
                          {/* Mobile: mostrar descuento y estado */}
                          <div className="md:hidden mt-3 space-y-2">
                              <div className="flex items-center text-xs text-red-600 font-semibold">
                              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                              {discountType === 'percentage' 
                                ? `${discountValue}%` 
                                : `Bs ${discountValue}`}
                              </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                              <span className={`w-1.5 h-1.5 mr-1.5 bg-${statusColor}-500 rounded-full`}></span>
                                {statusText}
                              </div>
                            </div>
                          </div>
                      </td>
                      <td className="px-4 lg:px-8 py-5 hidden md:table-cell">
                        <div className="text-sm font-mono text-gray-700 font-semibold">
                          {discountCode}
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-5 hidden lg:table-cell">
                        <div className="text-sm text-gray-700 truncate max-w-xs">
                          {promoName}
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-5">
                        <div className="flex items-center text-sm lg:text-base font-semibold text-red-600">
                          <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 mr-2 flex-shrink-0" />
                          <span>
                            {discountType === 'percentage' 
                              ? `${discountValue}%` 
                              : `Bs ${discountValue}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-5 hidden sm:table-cell">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(offer.end_time).toLocaleDateString('es-VE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(offer.end_time).toLocaleTimeString('es-VE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-4 lg:px-8 py-5 hidden sm:table-cell">
                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-800`}>
                          <span className={`w-2 h-2 mr-2 bg-${statusColor}-500 rounded-full flex-shrink-0`}></span>
                          {statusText}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 lg:px-8 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Flame className="w-8 h-8 lg:w-12 lg:h-12 text-gray-300 mb-3 lg:mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No hay ofertas flash
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-500 px-4">
                        Crea tu primera oferta flash para comenzar.
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-3 lg:mt-4 inline-flex items-center px-3 lg:px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Oferta Flash
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <FlashOfferFormModal
        title="Nueva oferta flash"
        isOpen={showCreateModal}
        initialValues={defaultFormValues}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        submitting={createMutation.isPending}
        submitLabel="Crear oferta"
        errorMessage={createMutation.error?.message || null}
        onFetchProfitData={flashOfferService.getArticleDiscount.bind(flashOfferService)}
      />

      <FlashOfferFormModal
        title="Editar oferta flash"
        isOpen={showEditModal}
        initialValues={editInitialValues}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        submitting={updateMutation.isPending}
        submitLabel="Guardar cambios"
        errorMessage={updateMutation.error?.message || null}
        onFetchProfitData={flashOfferService.getArticleDiscount.bind(flashOfferService)}
      />

      <ArticleDiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        data={discountData}
        onEdit={handleEditArticleDiscount}
        onEditFlashOffer={selectedOffer ? () => openEditModal(selectedOffer) : undefined}
        onDeleteFlashOffer={selectedOffer?.id ? () => handleDeleteOffer(selectedOffer.id!) : undefined}
      />

      <EditArticleDiscountModal
        isOpen={showEditDiscountModal}
        onClose={() => setShowEditDiscountModal(false)}
        data={discountData}
        onSave={handleSaveArticleDiscount}
        submitting={updatingDiscount}
      />

      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
            notificationVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-start gap-3 px-4 py-3 bg-white/95 backdrop-blur border border-gray-200 shadow-2xl rounded-2xl min-w-[260px]">
            <div
              className={`p-2 rounded-full ${
                notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {notification.message}
              </p>
            </div>
            <button
              onClick={handleCloseNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashOffersPage;


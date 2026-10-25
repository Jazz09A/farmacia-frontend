import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RefreshCw,
  AlertCircle,
  XCircle,
  CheckCircle,
  Search,
  Package
} from 'lucide-react';
import { useProductsQuery } from '../../../hooks/queries/useProductsQueries';
import { Product } from '../../../types';
import { FlashOfferFormValues } from './flashOfferFormUtils';

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

export const FlashOfferFormModal: React.FC<FlashOfferFormModalProps> = ({
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

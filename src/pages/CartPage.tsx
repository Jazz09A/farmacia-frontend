import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  XCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import quoteService from '../services/api/quotes';
import type { CartValidationResponse, CartValidationItemResult } from '../types/quotes';
import { useQuoteCart } from '../hooks/useQuoteCart';

const CartPage: React.FC = () => {
  const { formatPriceFromBackend, currency } = useGlobalCurrency();
  const {
    items,
    detailedItems,
    loadingProducts,
    updateItem,
    removeItem,
  } = useQuoteCart({ hydrateProducts: true });

  const [validationResult, setValidationResult] = useState<CartValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValidationInProgress = isValidating;
  const hasValidationError = !isValidationInProgress && Boolean(validationError);
  const hasValidationWarnings =
    !isValidationInProgress && Boolean(validationResult && !validationResult.valido);
  const isValidationSuccess =
    !isValidationInProgress && Boolean(validationResult && validationResult.valido);

  const validateCartContents = useCallback(async () => {
    if (items.length === 0) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await quoteService.validateCart(items);
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating cart:', error);
      setValidationError(
        error instanceof Error
          ? error.message
          : 'Error al validar el carrito. Por favor, inténtalo nuevamente.'
      );
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  useEffect(() => {
    validateCartContents();
  }, [validateCartContents]);

  const handleValidateCart = () => {
    validateCartContents();
  };

  const getItemValidation = useCallback(
    (co_art: string): CartValidationItemResult | null => {
      if (!validationResult) return null;
      return validationResult.items_verificados.find(item => item.co_art === co_art) || null;
    },
    [validationResult]
  );

  const handleIncreaseQuantity = (co_art: string, currentQuantity: number) => {
    updateItem(co_art, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (co_art: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      handleRemoveItem(co_art);
      return;
    }
    updateItem(co_art, currentQuantity - 1);
  };

  const handleRemoveItem = (co_art: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      removeItem(co_art);
    }
  };

  const localTotals = useMemo(() => {
    const subtotal = detailedItems.reduce((sum, item) => {
      const priceStr = item.product?.price ?? item.product?.current_price ?? '0';
      const price = parseFloat(priceStr);
      if (!Number.isFinite(price)) {
        return sum;
      }
      return sum + price * item.cantidad;
    }, 0);

    const itemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

    return {
      subtotal,
      total: subtotal,
      itemsCount,
    };
  }, [detailedItems, items]);

  if (loadingProducts && items.length > 0 && detailedItems.every(item => item.product === null)) {
    return <LoadingSpinner message="Cargando productos del carrito..." />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-medical-gray-50 pt-24 text-center px-4">
        <ShoppingCart className="w-24 h-24 text-medical-gray-300 mb-6" />
        <h1 data-testid="empty-cart-message" className="text-3xl font-bold text-medical-gray-800 mb-2">Tu carrito está vacío</h1>
        <p className="text-medical-gray-600 mb-8">
          Parece que no has añadido nada a tu carrito. ¡Explora nuestro catálogo farmacéutico!
        </p>
        <Link
          to="/catalog"
          className="px-8 py-4 bg-medical-primary text-white font-semibold rounded-2xl shadow-medical hover:bg-medical-primary-dark transition-all"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32">
      <div className="medical-container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-medical-gray-900">Tu Carrito de Compras</h1>
          {!isValidationInProgress && items.length > 0 && (
            <button
              onClick={handleValidateCart}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-medical-primary hover:bg-medical-blue-50 rounded-xl transition-colors border border-medical-primary/30"
              title="Comprobar nuevamente precios y disponibilidad"
            >
              <RefreshCw className="h-4 w-4" />
              Comprobar otra vez
            </button>
          )}
        </div>

        {/* Estado de validación */}
        {isValidationInProgress && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <p className="text-blue-800 font-medium">Comprobando disponibilidad y precios actualizados...</p>
            </div>
          </div>
        )}

        {hasValidationError && validationError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">Error al validar el carrito</p>
                <p className="text-sm text-red-700 mt-1">{validationError}</p>
                <button
                  onClick={handleValidateCart}
                  className="mt-2 inline-flex items-center gap-2 text-red-700 font-semibold hover:underline text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {hasValidationWarnings && validationResult && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">Algunos productos tienen problemas</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Revisa los detalles en cada producto. Los productos con errores no se incluirán en la cotización.
                </p>
              </div>
            </div>
          </div>
        )}

        {isValidationSuccess && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                ✓ Carrito validado. Todos los productos disponibles con precios confirmados.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {detailedItems.map((item, index) => {
              const itemValidation = getItemValidation(item.co_art);
              const hasError = itemValidation && (itemValidation.error !== null || !itemValidation.stock_ok);
              const product = item.product;
              const productName =
                itemValidation?.descripcion || product?.name || `Artículo ${item.co_art}`;
              const productBrand = product?.brand;
              const productImage =
                (product?.images && product.images.length > 0 ? product.images[0] : product?.image) ||
                'https://via.placeholder.com/150';

              const estimatedSubtotal = (() => {
                const priceStr = product?.price ?? product?.current_price ?? '0';
                const price = parseFloat(priceStr);
                if (!Number.isFinite(price)) {
                  return 0;
                }
                return price * item.cantidad;
              })();
              
              return (
                <motion.div
                  key={item.co_art}
                  data-testid="cart-item"
                  className={`flex items-start space-x-6 bg-white p-6 rounded-2xl shadow-soft ${
                    hasError ? 'border-2 border-red-200 bg-red-50/30' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img 
                    src={productImage} 
                    alt={productName} 
                    className="w-24 h-24 object-cover rounded-xl" 
                  />
                  <div className="flex-grow">
                    <div className="flex items-start gap-2">
                      <Link to={`/product/${encodeURIComponent(item.co_art)}`} className="font-bold text-lg text-medical-gray-800 hover:text-medical-primary transition-colors">
                        {productName}
                      </Link>
                      {hasError && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                      {itemValidation && !hasError && itemValidation.stock_ok && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-sm text-medical-gray-500">
                      Código: {item.co_art} {productBrand && `• ${productBrand}`}
                    </p>
                    
                    {/* Mensajes de error/validación */}
                    {itemValidation?.error && (
                      <p className="text-sm text-red-600 font-medium mt-2">{itemValidation.error}</p>
                    )}
                    {itemValidation && !itemValidation.stock_ok && !itemValidation.error && (
                      <p className="text-sm text-red-600 font-medium mt-2">Stock insuficiente</p>
                    )}
                    {itemValidation && !hasError && itemValidation.stock_ok && (
                      <p className="text-xs text-green-600 mt-1">✓ Disponible • Precio actualizado</p>
                    )}
                    
                    <div className="flex items-center border border-medical-gray-200 rounded-lg mt-4 w-fit">
                      <button 
                        onClick={() => handleDecreaseQuantity(item.co_art, item.cantidad)} 
                        className="p-2 text-medical-gray-500 hover:text-medical-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span data-testid="quantity-input" className="px-3 text-md font-semibold">{item.cantidad}</span>
                      <button 
                        onClick={() => handleIncreaseQuantity(item.co_art, item.cantidad)} 
                        className="p-2 text-medical-gray-500 hover:text-medical-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    {itemValidation ? (
                      <>
                        <p className="font-bold text-lg text-medical-primary">
                          {formatPriceFromBackend(itemValidation.subtotal, currency)}
                        </p>
                        {parseFloat(itemValidation.impuestos) > 0 && (
                          <p className="text-xs text-medical-gray-500">
                            +{formatPriceFromBackend(itemValidation.impuestos, currency)} imp.
                          </p>
                        )}
                        {product && parseFloat(itemValidation.precio_unitario_real) !== parseFloat(product.price || '0') && (
                          <p className="text-xs text-medical-gray-400 line-through mt-1">
                            {formatPriceFromBackend(product.price, currency)}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-lg text-medical-primary">
                          {formatPriceFromBackend(estimatedSubtotal.toFixed(2), currency)}
                        </p>
                      </>
                    )}
                    <button 
                      data-testid="remove-item-button"
                      onClick={() => handleRemoveItem(item.co_art)} 
                      className="text-medical-gray-400 hover:text-red-500 mt-4 transition-colors"
                      title="Eliminar producto del carrito"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-soft sticky top-28">
              <h2 className="text-2xl font-bold text-medical-gray-800 border-b pb-4 mb-6">
                Resumen del Pedido Comercial
              </h2>
              <div className="space-y-4 text-medical-gray-700">
                {validationResult?.totales ? (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal ({validationResult.items_verificados.filter(i => !i.error && i.stock_ok).length} productos válidos)</span>
                      <span className="font-semibold">
                        {formatPriceFromBackend(validationResult.totales.bruto, currency)}
                      </span>
                    </div>
                    {(parseFloat(validationResult.totales.descuentos || validationResult.totales.descuento || '0') > 0) && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento</span>
                        <span className="font-semibold">
                          -{formatPriceFromBackend(validationResult.totales.descuentos || validationResult.totales.descuento || '0', currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Impuestos</span>
                      <span className="font-semibold">
                        {formatPriceFromBackend(validationResult.totales.impuestos, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-medical-gray-900 border-t pt-4 mt-4">
                      <span>Total</span>
                      <span data-testid="cart-total">{formatPriceFromBackend(validationResult.totales.neto, currency)}</span>
                    </div>
                    <p className="text-xs text-medical-gray-500 italic">
                      * Precios confirmados con la última validación
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal ({localTotals.itemsCount} productos)</span>
                      <span className="font-semibold">
                        {formatPriceFromBackend(localTotals.subtotal.toFixed(2), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-medical-gray-900 border-t pt-4 mt-4">
                      <span>Total estimado</span>
                      <span data-testid="cart-total">{formatPriceFromBackend(localTotals.total.toFixed(2), currency)}</span>
                    </div>
                    <p className="text-xs text-medical-gray-500 italic">
                      * Los precios se validarán al generar la cotización
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  data-testid="checkout-button"
                  to="/checkout/quote"
                  className={`w-full text-center block px-6 py-4 bg-medical-primary text-white font-semibold rounded-2xl shadow-medical hover:bg-medical-primary-dark transition-all ${
                    validationResult && !validationResult.valido
                      ? 'opacity-60 cursor-not-allowed pointer-events-none'
                      : ''
                  }`}
                  title={
                    validationResult && !validationResult.valido
                      ? 'Corrige los errores antes de continuar'
                      : 'Generar cotización'
                  }
                >
                  {validationResult && !validationResult.valido
                    ? 'Corrige errores para continuar'
                    : 'Generar Cotización'}
                </Link>
                <Link
                  data-testid="continue-shopping-button"
                  to="/catalog"
                  className="w-full flex items-center justify-center gap-2 text-center px-6 py-3 text-medical-primary font-semibold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

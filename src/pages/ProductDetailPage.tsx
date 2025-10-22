import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, AlertTriangle, ChevronRight, ShoppingCart, Plus, Minus, Heart, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { Product } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/ProductService';
import { ProductDetailSkeleton } from '../components/Skeleton';

// Placeholder for a component of product carousel
const ProductsCarousel: React.FC<{ products: Product[], title: string }> = ({ products, title }) => (
  <div className="py-12">
    <h2 className="text-2xl font-bold text-medical-gray-800 mb-6">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.images && product.images.length > 1 ? product.images[1] : product.image} 
              alt={product.name} 
              className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform" 
            />
            <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-medical-primary">{product.brand}</p>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState('');

  const { formatPrice, getDisplayPrice, currency } = useCurrency();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (id) {
          const fetchedProduct = await productService.getProductById(id);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            setActiveImage(fetchedProduct.images && fetchedProduct.images.length > 1 ? fetchedProduct.images[1] : fetchedProduct.image);
          } else {
            setProduct(null);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Show skeleton while loading
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Show not found message if product doesn't exist
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-medical pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Producto no encontrado</h2>
          <Link to="/catalog" className="text-medical-primary hover:underline mt-4 inline-block">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (product) {
      setAddingToCart(true);
      try {
        await addToCart(product.id, quantity);
        // Maybe show a success notification
      } catch (error) {
        console.error("Failed to add item to cart", error);
        // Maybe show an error notification
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const relatedProducts: Product[] = []; 
  const recommendedProducts: Product[] = []; 
  const productReviews: any[] = [];

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-24 lg:pt-32">
      <div className="medical-container mb-12">
        <nav className="text-sm text-medical-gray-600 mb-8 flex items-center space-x-2">
          <Link to="/" className="hover:text-medical-primary">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/catalog" className="hover:text-medical-primary">Catálogo</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-medical-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            <motion.div 
              className="bg-white rounded-2xl shadow-soft p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img src={activeImage} alt={product.name} className="w-full h-80 sm:h-96 object-contain rounded-xl" />
            </motion.div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {product.images?.filter((_, index) => index > 0).map((img, index) => (
                <div 
                  key={index + 1}
                  onClick={() => setActiveImage(img)}
                  className={`cursor-pointer rounded-xl p-1 sm:p-2 border-2 transition-all ${activeImage === img ? 'border-medical-primary' : 'border-transparent hover:border-medical-gray-200'}`}
                >
                  <img src={img} alt={`${product.name} view ${index + 2}`} className="w-full h-16 sm:h-20 object-cover rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-medical-gray-900">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-lg font-medium text-medical-primary">{product.brand}</span>
              <span className="text-medical-gray-400 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-medical-gray-600">{product.rating} ({product.review_count} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-medical-blue-50/50 rounded-2xl p-4 sm:p-6">
              {product.is_offer && product.original_price ? (
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="text-3xl lg:text-4xl font-bold text-medical-accent">
                    {formatPrice(getDisplayPrice(product.price, currency), currency)}
                  </span>
                  <span className="text-lg lg:text-xl font-medium text-medical-gray-500 line-through">
                    {formatPrice(getDisplayPrice(product.original_price, currency), currency)}
                  </span>
                  <span className="text-base lg:text-lg font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">
                    - {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl lg:text-4xl font-bold text-medical-primary">
                  {formatPrice(getDisplayPrice(product.price, currency), currency)}
                </span>
              )}
              <p className="text-base lg:text-lg text-medical-gray-600 mt-2">
                Aprox. {currency === 'VES' ? formatPrice(product.price, 'USD') : formatPrice(getDisplayPrice(product.price, 'VES' as any), 'VES' as any)}
              </p>
            </div>
            
            {/* Stock & Prescription */}
            <div className="flex items-center space-x-6">
              {product.in_stock ? (
                <span className="flex items-center space-x-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>En Stock ({product.stock} unidades)</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 text-red-600 font-semibold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Agotado</span>
                </span>
              )}
              {product.prescription && (
                <span className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Requiere récipe</span>
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="flex w-full max-w-xs items-center justify-between rounded-xl border border-medical-gray-300 sm:w-auto">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-medical-gray-600 transition-colors hover:text-medical-primary"><Minus className="w-5 h-5" /></button>
                <span className="w-16 px-4 text-center text-lg font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-medical-gray-600 transition-colors hover:text-medical-primary"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex w-full max-w-xs items-stretch gap-2 sm:w-auto">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
                  className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-medical-primary px-4 py-3 font-semibold text-white shadow-medical transition-all duration-300 hover:bg-medical-primary-dark disabled:cursor-not-allowed disabled:bg-medical-gray-400"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {addingToCart ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  <span>{addingToCart ? 'Agregando...' : 'Agregar al Carrito'}</span>
                </motion.button>
                <motion.button 
                  className="rounded-2xl border border-medical-gray-300 p-3 text-medical-gray-600 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 pt-4">
                <div className="flex items-center text-medical-gray-700">
                    <Truck className="w-5 h-5 mr-3 text-medical-primary"/>
                    <span>Envío gratuito en pedidos sobre <span className="font-bold">{formatPrice(25, 'REF')}</span></span>
                </div>
                <div className="flex items-center text-medical-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-medical-primary"/>
                    <span>Entrega estimada en Caracas: <span className="font-bold">24-48 horas</span></span>
                </div>
            </div>
          </div>
        </div>

        {/* Tabs for more details */}
        <div className="mt-16">
          <div className="border-b border-medical-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg transition-colors ${
                    activeTab === tab
                      ? 'border-medical-primary text-medical-primary'
                      : 'border-transparent text-medical-gray-500 hover:text-medical-gray-700 hover:border-medical-gray-300'
                  }`}
                >
                  {tab === 'description' ? 'Descripción' : tab === 'details' ? 'Detalles' : `Opiniones (${productReviews.length})`}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-8">
            {activeTab === 'description' && <p className="text-medical-gray-700 leading-relaxed">{product.description}</p>}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-medical-gray-700">
                {product.ingredients && <p><strong>Ingredientes:</strong> {product.ingredients.join(', ')}</p>}
                {product.dosage && <p><strong>Dosis:</strong> {product.dosage}</p>}
                {product.presentation && <p><strong>Presentación:</strong> {product.presentation}</p>}
                {product.laboratorio && <p><strong>Laboratorio:</strong> {product.laboratorio}</p>}
                {product.registro_sanitario && <p><strong>Registro Sanitario:</strong> {product.registro_sanitario}</p>}
                {product.patology && <p><strong>Patología:</strong> {product.patology}</p>}
                {product.contraindicaciones && <p><strong>Contraindicaciones:</strong> {product.contraindicaciones}</p>}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {productReviews.length > 0 ? productReviews.map(review => (
                  <div key={review.id} className="border-b border-medical-gray-200 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="ml-4 font-bold">{review.userName}</p>
                    </div>
                    <p className="text-medical-gray-700">{review.comment}</p>
                    <p className="text-sm text-medical-gray-500 mt-2">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                )) : <p>No hay opiniones para este producto todavía.</p>}
              </div>
            )}
          </div>
        </div>
        
        <ProductsCarousel products={relatedProducts} title="Productos Relacionados" />
        <ProductsCarousel products={recommendedProducts} title="También te podría interesar" />
      </div>
    </div>
  );
};

export default ProductDetailPage; 
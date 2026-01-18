import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Package,
  FileText,
  Tag,
  Pill,
  AlertCircle
} from 'lucide-react';
import { adminService, BulkProduct } from '../../services/AdminService';
import { ProductImage } from '../common';
import ImageUploader from './ImageUploader';

interface IndividualProductFormProps {
  onSuccess: (message: string) => void;
}

interface ImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
  format: string;
  isMain?: boolean;
}

interface ProductFormData extends Omit<BulkProduct, 'row_number' | 'images'> {
  ingredients_text: string; // Para manejar ingredientes como texto
  imageData: ImageData[]; // Para manejar múltiples imágenes
}

const IndividualProductForm: React.FC<IndividualProductFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    description: '',
    brand: '',
    category: '',
    subcategory: '',
    patology: '',
    image: '',
    ingredients: [],
    ingredients_text: '',
    in_stock: true,
    stock: 0,
    prescription: false,
    dosage: '',
    presentation: '',
    laboratorio: '',
    registro_sanitario: '',
    contraindicaciones: '',
    efectos_secundarios: '',
    sku: '',
    featured: false,
    is_offer: false,
    original_price: 0,
    imageData: []
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { id: 'general', name: 'General', icon: Package },
    { id: 'pricing', name: 'Precios', icon: DollarSign },
    { id: 'medical', name: 'Información Médica', icon: Pill },
    { id: 'images', name: 'Imágenes', icon: ImageIcon }
  ];

  const categories = [
    'Analgésicos',
    'Antibióticos',
    'Vitaminas',
    'Sistema Cardiovascular',
    'Sistema Digestivo',
    'Sistema Respiratorio',
    'Dermatología',
    'Oftalmología',
    'Ginecología',
    'Pediatría'
  ];

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.brand.trim()) newErrors.brand = 'La marca es requerida';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    if (formData.price <= 0) newErrors.price = 'El precio (USD) debe ser mayor a 0';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Procesar ingredientes de texto a array
      const ingredients = formData.ingredients_text
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      // Procesar imágenes
      const images = formData.imageData.map(img => img.url);
      const mainImage = formData.imageData.find(img => img.isMain)?.url || formData.imageData[0]?.url || '';

      const productData = {
        ...formData,
        ingredients,
        images,
        image: mainImage,
        original_price: formData.is_offer ? formData.original_price : formData.price
      };

      // Remover campos temporales
      delete (productData as any).ingredients_text;
      delete (productData as any).imageData;

      await adminService.createProduct(productData);
      onSuccess('Producto creado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ general: 'Error al crear el producto. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Ibuprofeno 600mg"
          />
          {errors.name && (
            <p className="text-red-500 text-xs lg:text-sm mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Bayer"
          />
          {errors.brand && (
            <p className="text-red-500 text-xs lg:text-sm mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span>{errors.brand}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs lg:text-sm mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Código único del producto"
          />
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Subcategoría
          </label>
          <input
            type="text"
            value={formData.subcategory}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Antiinflamatorios"
          />
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Patología
          </label>
          <input
            type="text"
            value={formData.patology}
            onChange={(e) => handleInputChange('patology', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Dolor e inflamación"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción detallada del producto..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.in_stock}
              onChange={(e) => handleInputChange('in_stock', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">En Stock</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.prescription}
              onChange={(e) => handleInputChange('prescription', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Requiere Receta</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Destacado</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Precio (USD) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-red-500 text-xs lg:text-sm mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span>{errors.price}</span>
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-4 lg:pt-6">
        <label className="flex items-center mb-3 lg:mb-4">
          <input
            type="checkbox"
            checked={formData.is_offer}
            onChange={(e) => handleInputChange('is_offer', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-xs lg:text-sm font-medium text-gray-700">Este producto está en oferta</span>
        </label>

        {formData.is_offer && (
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
              Precio Original (antes de la oferta)
            </label>
            <input
              type="number"
              value={formData.original_price}
              onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalTab = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Laboratorio
          </label>
          <input
            type="text"
            value={formData.laboratorio}
            onChange={(e) => handleInputChange('laboratorio', e.target.value)}
            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Laboratorios Bayer"
          />
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Registro Sanitario
          </label>
          <input
            type="text"
            value={formData.registro_sanitario}
            onChange={(e) => handleInputChange('registro_sanitario', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de registro sanitario"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosificación
          </label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => handleInputChange('dosage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 1 tableta cada 8 horas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Presentación
          </label>
          <input
            type="text"
            value={formData.presentation}
            onChange={(e) => handleInputChange('presentation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Caja con 20 tabletas"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredientes Activos
        </label>
        <textarea
          value={formData.ingredients_text}
          onChange={(e) => handleInputChange('ingredients_text', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Separar ingredientes con comas. Ej: Ibuprofeno 600mg, Excipiente c.s.p."
        />
        <p className="text-sm text-gray-500 mt-1">
          Separar cada ingrediente con comas
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraindicaciones
        </label>
        <textarea
          value={formData.contraindicaciones}
          onChange={(e) => handleInputChange('contraindicaciones', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describir las contraindicaciones del producto..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Efectos Secundarios
        </label>
        <textarea
          value={formData.efectos_secundarios}
          onChange={(e) => handleInputChange('efectos_secundarios', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describir los posibles efectos secundarios..."
        />
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Imágenes del Producto
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Sube hasta 5 imágenes para tu producto. La primera imagen se marcará como principal automáticamente.
        </p>
        
        <ImageUploader
          images={formData.imageData}
          onImagesChange={(images) => handleInputChange('imageData', images)}
          maxImages={5}
          allowReorder={true}
          showMainSelector={true}
        />
      </div>

      <div className="border-t pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Consejos para mejores imágenes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Usa imágenes de alta calidad (mínimo 800x800px)</li>
                <li>• Fondo blanco o neutro para mejor presentación</li>
                <li>• Muestra el producto desde diferentes ángulos</li>
                <li>• Incluye detalles importantes como etiquetas o información</li>
                <li>• Las imágenes se optimizarán automáticamente para web</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'pricing':
        return renderPricingTab();
      case 'medical':
        return renderMedicalTab();
      case 'images':
        return renderImagesTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 lg:p-4">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm lg:text-base">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 lg:space-x-2 px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline lg:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-sm lg:text-base rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          )}
          <span>{loading ? 'Creando...' : 'Crear Producto'}</span>
        </button>
      </div>
    </form>
  );
};

export default IndividualProductForm;

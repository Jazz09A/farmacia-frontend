import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  X,
  Edit,
  Save,
  Eye,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { adminService, BulkUploadResponse, BulkProduct, ValidationError } from '../../services/AdminService';
import ProductImageManager from './ProductImageManager';

interface BulkProductUploadProps {
  onSuccess: (message: string) => void;
}

type UploadStep = 'upload' | 'preview' | 'processing';

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<BulkUploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [editedProducts, setEditedProducts] = useState<BulkProduct[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Solo se permiten archivos CSV o Excel (.csv, .xls, .xlsx)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo no puede ser mayor a 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await adminService.bulkUploadProducts(file);
      setUploadData(response);
      setEditedProducts([...response.valid_products]);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleProductEdit = (index: number, field: keyof BulkProduct, value: any) => {
    setEditedProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleProductImages = (index: number, images: string[]) => {
    setEditedProducts(prev => {
      const updated = [...prev];
      updated[index] = { 
        ...updated[index], 
        images,
        image: images[0] || updated[index].image // Usar la primera imagen como principal
      };
      return updated;
    });
  };

  const handleFinalSubmit = async () => {
    if (!editedProducts.length) return;

    setLoading(true);
    setCurrentStep('processing');

    try {
      const response = await adminService.bulkCreateProducts(editedProducts);
      onSuccess(`${response.created_count} productos creados exitosamente`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear los productos');
      setCurrentStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,brand,category,subcategory,patology,price_ves,price_ref,description,stock,prescription,dosage,presentation,laboratorio,registro_sanitario,contraindicaciones,efectos_secundarios,sku,image
Ibuprofeno 600mg,Bayer,Analgésicos,Antiinflamatorios,Dolor e inflamación,15.50,2.25,"Analgésico y antiinflamatorio para el alivio del dolor",100,false,"1 tableta cada 8 horas","Caja con 20 tabletas",Laboratorios Bayer,RS-12345,"Hipersensibilidad al ibuprofeno","Náuseas, vómitos",IBU600,https://example.com/ibuprofeno.jpg`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Descarga la plantilla
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Usa nuestra plantilla para asegurar que tu archivo tenga el formato correcto.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla CSV
            </button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subir Archivo de Productos
        </h3>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {file ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remover archivo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Formatos soportados: CSV, XLS, XLSX (máximo 10MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {file && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Procesando...' : 'Procesar Archivo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderValidationErrors = (errors: ValidationError[]) => {
    if (!errors.length) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="font-semibold text-red-900">
            Errores de Validación ({errors.length})
          </h3>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-red-700">
              <strong>Fila {error.row_number}:</strong> {error.field} - {error.error_message}
              {error.value && <span className="text-red-600"> (Valor: "{error.value}")</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProductPreview = () => {
    if (!uploadData) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Carga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{uploadData.total_rows}</p>
              <p className="text-sm text-blue-700">Filas Totales</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{uploadData.valid_products.length}</p>
              <p className="text-sm text-green-700">Productos Válidos</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{uploadData.validation_errors.length}</p>
              <p className="text-sm text-red-700">Errores</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{uploadData.warnings.length}</p>
              <p className="text-sm text-yellow-700">Advertencias</p>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {renderValidationErrors(uploadData.validation_errors)}

        {/* Warnings */}
        {uploadData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="font-semibold text-yellow-900">
                Advertencias ({uploadData.warnings.length})
              </h3>
            </div>
            <div className="space-y-1">
              {uploadData.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-700">{warning}</p>
              ))}
            </div>
          </div>
        )}

        {/* Products Table */}
        {editedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Productos a Crear ({editedProducts.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Revisa y edita los productos antes de crearlos
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Fila</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Marca</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Precio VES</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Imágenes</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{product.row_number}</td>
                      <td className="px-4 py-3">
                        {editingProduct === index ? (
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductEdit(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{product.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingProduct === index ? (
                          <input
                            type="text"
                            value={product.brand}
                            onChange={(e) => handleProductEdit(index, 'brand', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">{product.brand}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingProduct === index ? (
                          <input
                            type="text"
                            value={product.category}
                            onChange={(e) => handleProductEdit(index, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">{product.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingProduct === index ? (
                          <input
                            type="number"
                            value={product.price_ves}
                            onChange={(e) => handleProductEdit(index, 'price_ves', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            step="0.01"
                          />
                        ) : (
                          <span className="text-gray-700">{product.price_ves.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingProduct === index ? (
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => handleProductEdit(index, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">{product.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ProductImageManager
                          productName={product.name}
                          images={product.images}
                          onImagesChange={(images) => handleProductImages(index, images)}
                          maxImages={3}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingProduct === index ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingProduct(index)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep('upload')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || editedProducts.length === 0}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Creando Productos...' : `Crear ${editedProducts.length} Productos`}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProcessingStep = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
        />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Creando Productos...
        </h3>
        <p className="text-gray-600">
          Por favor espera mientras procesamos tus productos
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'preview' && renderProductPreview()}
          {currentStep === 'processing' && renderProcessingStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BulkProductUpload;

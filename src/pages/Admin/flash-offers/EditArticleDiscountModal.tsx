import React, { useState } from 'react';
import {
  Edit,
  RefreshCw,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface EditArticleDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (code: string, payload: any) => Promise<void>;
  submitting?: boolean;
}

export const EditArticleDiscountModal: React.FC<EditArticleDiscountModalProps> = ({
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

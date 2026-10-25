import React from 'react';
import { Filter } from 'lucide-react';
import { FlashOfferFilters } from '../../../services/FlashOfferService';

interface FlashOffersFiltersProps {
  filters: FlashOfferFilters;
  onChange: React.Dispatch<React.SetStateAction<FlashOfferFilters>>;
}

export const FlashOffersFiltersBar: React.FC<FlashOffersFiltersProps> = ({
  filters,
  onChange,
}) => {
  return (
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
            onChange={(e) => onChange((prev) => ({ ...prev, active_only: e.target.checked }))}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-xs lg:text-sm text-gray-700">Solo activas</span>
        </label>

        <select
          value={filters.sort_by}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              sort_by: e.target.value as FlashOfferFilters['sort_by'],
            }))
          }
          className="text-xs lg:text-sm border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="created_at">Fecha de creación</option>
          <option value="end_time">Fecha de vencimiento</option>
          <option value="discount_value">Descuento</option>
        </select>

        <select
          value={filters.sort_order}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              sort_order: e.target.value as FlashOfferFilters['sort_order'],
            }))
          }
          className="text-xs lg:text-sm border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>
    </div>
  );
};

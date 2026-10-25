import React from 'react';
import { Flame, Plus, RefreshCw } from 'lucide-react';

interface FlashOffersHeaderProps {
  loading: boolean;
  isRefreshing: boolean;
  activeCount: number;
  totalCount: number;
  onRefresh: () => void;
  onCreate: () => void;
}

export const FlashOffersHeader: React.FC<FlashOffersHeaderProps> = ({
  loading,
  isRefreshing,
  activeCount,
  totalCount,
  onRefresh,
  onCreate,
}) => {
  return (
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
        <p className="mt-1 text-sm lg:text-base text-gray-600">Gestiona las ofertas flash de GRUPO DROZAINKA C.A</p>

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
        <button
          onClick={onRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </span>
        </button>

        <button
          onClick={onCreate}
          className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">Nueva Oferta Flash</span>
          <span className="sm:hidden">Nueva Oferta</span>
        </button>
      </div>
    </div>
  );
};

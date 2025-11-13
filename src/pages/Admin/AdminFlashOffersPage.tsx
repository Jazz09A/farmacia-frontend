// 🔥 Admin Flash Offers Management Page
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  Package, 
  TrendingDown,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  useAdminFlashOffersQuery, 
  useCreateFlashOfferMutation,
  useUpdateFlashOfferMutation,
  useDeleteFlashOfferMutation,
  useToggleFlashOfferStatusMutation
} from '../../hooks/queries/useFlashOffersQueries';
import { FlashOfferFilters, flashOfferService } from '../../services/FlashOfferService';
import { FlashOfferWithProduct, CreateFlashOfferPayload } from '../../types';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';
import SmartPriceDisplay from '../../components/Admin/SmartPriceDisplay';

const AdminFlashOffersPage: React.FC = () => {
  const [filters, setFilters] = useState<FlashOfferFilters>({
    active_only: false,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FlashOfferWithProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: flashOffersResponse, isLoading: loading, error, refetch } = useAdminFlashOffersQuery(filters);
  const createMutation = useCreateFlashOfferMutation();
  const updateMutation = useUpdateFlashOfferMutation();
  const deleteMutation = useDeleteFlashOfferMutation();
  const toggleStatusMutation = useToggleFlashOfferStatusMutation();

  const offers = flashOffersResponse?.flash_offers || [];
  const totalCount = flashOffersResponse?.total_count || 0;
  const activeCount = flashOffersResponse?.active_count || 0;

  const actions = {
    refresh: () => refetch(),
    create: async (payload: CreateFlashOfferPayload) => {
      await createMutation.mutateAsync(payload);
    },
    update: async (id: string, payload: Partial<CreateFlashOfferPayload>) => {
      await updateMutation.mutateAsync({ id, payload });
    },
    delete: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    toggleStatus: async (id: string, is_active: boolean) => {
      await toggleStatusMutation.mutateAsync({ id, is_active });
    },
  };

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      await actions.toggleStatus(offerId, !currentStatus);
    } catch (error) {
      console.error('Error toggling offer status:', error);
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
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-3 lg:px-6 py-3">Producto</th>
                <th scope="col" className="px-3 lg:px-6 py-3 hidden sm:table-cell">Descuento</th>
                <th scope="col" className="px-3 lg:px-6 py-3 hidden md:table-cell">Precio Original</th>
                <th scope="col" className="px-3 lg:px-6 py-3">Precio Oferta</th>
                <th scope="col" className="px-3 lg:px-6 py-3 hidden lg:table-cell">Vencimiento</th>
                <th scope="col" className="px-3 lg:px-6 py-3 hidden sm:table-cell">Estado</th>
                <th scope="col" className="px-3 lg:px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-24 h-2 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : offers.length > 0 ? (
                offers.map((offer) => {
                  const statusColor = getStatusColor(offer.is_active, offer.end_time);
                  const statusText = getStatusText(offer.is_active, offer.end_time);
                  const originalPrice = offer.product.price_ves; // Usando VES como default
                  const discountedPrice = flashOfferService.calculateDiscountedPrice(
                    originalPrice,
                    offer.discount_type,
                    offer.discount_value
                  );

                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <img
                            src={offer.product.images && offer.product.images.length > 1 ? offer.product.images[1] : offer.product.image}
                            alt={offer.product.name}
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm lg:text-base truncate max-w-32 lg:max-w-xs">
                              {offer.product.name}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500 truncate">{offer.product.brand}</div>
                            {/* Mobile info */}
                            <div className="sm:hidden mt-1">
                              <div className="flex items-center text-xs text-red-600 font-semibold">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                {offer.discount_type === 'percentage' 
                                  ? `${offer.discount_value}%` 
                                  : `Bs ${offer.discount_value}`}
                              </div>
                              <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-${statusColor}-100 text-${statusColor}-800`}>
                                <span className={`w-1.5 h-1.5 mr-1 bg-${statusColor}-500 rounded-full`}></span>
                                {statusText}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center">
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          <span className="font-semibold text-red-600 text-sm">
                            {offer.discount_type === 'percentage' 
                              ? `${offer.discount_value}%` 
                              : `Bs ${offer.discount_value}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                        <SmartPriceDisplay amount={originalPrice} className="text-sm" />
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="font-bold text-green-600">
                          <SmartPriceDisplay amount={discountedPrice} className="text-sm lg:text-base" />
                        </div>
                        {/* Mobile original price */}
                        <div className="md:hidden text-xs text-gray-500 line-through">
                          <SmartPriceDisplay amount={originalPrice} className="text-xs" />
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-900">
                          {new Date(offer.end_time).toLocaleDateString('es-VE')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(offer.end_time).toLocaleTimeString('es-VE')}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-800`}>
                          <span className={`w-1.5 h-1.5 mr-1.5 bg-${statusColor}-500 rounded-full`}></span>
                          {statusText}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                          <button
                            onClick={() => handleToggleStatus(offer.id!, offer.is_active)}
                            className="text-gray-400 hover:text-blue-600 active:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title={offer.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {offer.is_active ? <EyeOff className="w-3 h-3 lg:w-4 lg:h-4" /> : <Eye className="w-3 h-3 lg:w-4 lg:h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowEditModal(true);
                            }}
                            className="text-gray-400 hover:text-yellow-600 active:text-yellow-800 transition-colors p-1 rounded hover:bg-yellow-50"
                            title="Editar"
                          >
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id!)}
                            className="text-gray-400 hover:text-red-600 active:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 lg:px-6 py-8 text-center">
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
    </div>
  );
};

export default AdminFlashOffersPage;


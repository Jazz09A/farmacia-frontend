import React from 'react';
import { Flame, Plus, TrendingDown } from 'lucide-react';
import { FlashOfferWithProduct } from '../../../types';
import { getStatusColor, getStatusText } from './flashOfferFormUtils';

interface FlashOffersTableProps {
  loading: boolean;
  offers: FlashOfferWithProduct[];
  onRowClick: (offer: FlashOfferWithProduct) => void;
  onRowKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>, offer: FlashOfferWithProduct) => void;
  onCreate: () => void;
}

export const FlashOffersTable: React.FC<FlashOffersTableProps> = ({
  loading,
  offers,
  onRowClick,
  onRowKeyDown,
  onCreate,
}) => {
  return (
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

                const productName = offer.product?.name || 'Producto sin nombre';
                const discountCode = offer.co_desc || '-';
                const promoName = offer.des_des || 'Promoción';
                const discountValue = offer.discount_value || 0;
                const discountType = offer.discount_type || 'percentage';

                return (
                  <tr
                    key={offer.id || offer.product_id || `offer-${index}`}
                    className="group hover:bg-gray-50 focus-within:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                    onClick={() => onRowClick(offer)}
                    onKeyDown={(event) => onRowKeyDown(event, offer)}
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
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(offer.end_time).toLocaleTimeString('es-VE', {
                          hour: '2-digit',
                          minute: '2-digit',
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
                      onClick={onCreate}
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
  );
};

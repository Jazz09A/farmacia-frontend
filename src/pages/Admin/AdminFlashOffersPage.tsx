// 🔥 Admin Flash Offers Management Page
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FlashOfferFormModal } from './flash-offers/FlashOfferFormModal';
import { ArticleDiscountModal } from './flash-offers/ArticleDiscountModal';
import { EditArticleDiscountModal } from './flash-offers/EditArticleDiscountModal';
import { FlashOffersHeader } from './flash-offers/FlashOffersHeader';
import { FlashOffersFiltersBar } from './flash-offers/FlashOffersFilters';
import { FlashOffersTable } from './flash-offers/FlashOffersTable';
import { FlashOffersNotification } from './flash-offers/FlashOffersNotification';
import { defaultFormValues } from './flash-offers/flashOfferFormUtils';
import { useAdminFlashOffersPage } from './flash-offers/useAdminFlashOffersPage';

const AdminFlashOffersPage: React.FC = () => {
  const {
    filters,
    setFilters,
    showCreateModal,
    setShowCreateModal,
    selectedOffer,
    showEditModal,
    showDiscountModal,
    setShowDiscountModal,
    showEditDiscountModal,
    setShowEditDiscountModal,
    discountData,
    updatingDiscount,
    isRefreshing,
    notification,
    notificationVisible,
    loading,
    error,
    offers,
    totalCount,
    activeCount,
    createMutation,
    updateMutation,
    actions,
    handleCloseNotification,
    handleOfferRowClick,
    handleOfferRowKeyDown,
    handleEditArticleDiscount,
    handleSaveArticleDiscount,
    handleDeleteOffer,
    editInitialValues,
    handleCreateSubmit,
    handleEditSubmit,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    fetchProfitData,
  } = useAdminFlashOffersPage();

  return (
    <div className="space-y-8">
      <FlashOffersHeader
        loading={loading}
        isRefreshing={isRefreshing}
        activeCount={activeCount}
        totalCount={totalCount}
        onRefresh={() => actions.refresh()}
        onCreate={() => setShowCreateModal(true)}
      />

      <FlashOffersFiltersBar filters={filters} onChange={setFilters} />

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

      <FlashOffersTable
        loading={loading}
        offers={offers}
        onRowClick={handleOfferRowClick}
        onRowKeyDown={handleOfferRowKeyDown}
        onCreate={() => setShowCreateModal(true)}
      />

      <FlashOfferFormModal
        title="Nueva oferta flash"
        isOpen={showCreateModal}
        initialValues={defaultFormValues}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        submitting={createMutation.isPending}
        submitLabel="Crear oferta"
        errorMessage={createMutation.error?.message || null}
        onFetchProfitData={fetchProfitData}
      />

      <FlashOfferFormModal
        title="Editar oferta flash"
        isOpen={showEditModal}
        initialValues={editInitialValues}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        submitting={updateMutation.isPending}
        submitLabel="Guardar cambios"
        errorMessage={updateMutation.error?.message || null}
        onFetchProfitData={fetchProfitData}
      />

      <ArticleDiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        data={discountData}
        onEdit={handleEditArticleDiscount}
        onEditFlashOffer={selectedOffer ? () => openEditModal(selectedOffer) : undefined}
        onDeleteFlashOffer={selectedOffer?.id ? () => handleDeleteOffer(selectedOffer.id!) : undefined}
      />

      <EditArticleDiscountModal
        isOpen={showEditDiscountModal}
        onClose={() => setShowEditDiscountModal(false)}
        data={discountData}
        onSave={handleSaveArticleDiscount}
        submitting={updatingDiscount}
      />

      <FlashOffersNotification
        notification={notification}
        visible={notificationVisible}
        onClose={handleCloseNotification}
      />
    </div>
  );
};

export default AdminFlashOffersPage;

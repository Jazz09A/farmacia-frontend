import React, { useState } from 'react';
import { AdminCreditDashboard } from '../../components/Credit/AdminCreditDashboard';
import { AdminPaymentApproval } from '../../components/Credit/AdminPaymentApproval';
import { SimpleCreditAssignmentModal } from '../../components/Credit/SimpleCreditAssignmentModal';
import AdminCreditAssignmentPage from './AdminCreditAssignmentPage';
import { PageLayout } from '../../components/Layout/PageLayout';

const AdminCreditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'assignment'>('dashboard');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'assignment', name: 'Asignar Crédito', icon: '💳' },
    { id: 'payments', name: 'Aprobar Pagos', icon: '⏳' },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              👑 Administración de Créditos
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona el sistema de créditos y aprueba pagos de los usuarios
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'dashboard' | 'payments' | 'assignment')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedClientId(''); // Esto debería venir de una selección previa
                      setSelectedClientName('Cliente Seleccionado');
                      setShowAssignmentModal(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    💳 Asignar Crédito
                  </button>
                </div>
                <AdminCreditDashboard />
              </div>
            )}

            {activeTab === 'assignment' && (
              <AdminCreditAssignmentPage />
            )}

            {activeTab === 'payments' && (
              <AdminPaymentApproval />
            )}
          </div>

          {/* Modal de asignación de crédito */}
          <SimpleCreditAssignmentModal
            isOpen={showAssignmentModal}
            onClose={() => {
              setShowAssignmentModal(false);
              setSelectedClientId('');
              setSelectedClientName('');
            }}
            clientId={selectedClientId}
            clientName={selectedClientName}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminCreditPage;


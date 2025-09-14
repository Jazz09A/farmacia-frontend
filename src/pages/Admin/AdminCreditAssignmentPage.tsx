import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { Client } from '../../types/credit';
import CreditService from '../../services/CreditService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SimpleCreditAssignmentModal } from '../../components/Credit/SimpleCreditAssignmentModal';
import { CreditDebugInfo } from '../../components/Credit/CreditDebugInfo';

const AdminCreditAssignmentPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadRecentAssignments();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const allClients = await CreditService.getAllClients();
      setClients(allClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAssignments = async () => {
    // Mock data for recent assignments - replace with actual API call
    setRecentAssignments([
      {
        id: '1',
        client_name: 'Farmacia San Rafael',
        amount: 5000,
        date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        client_name: 'Distribuidora Médica',
        amount: 3000,
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      }
    ]);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowAssignmentModal(true);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
                Asignación de Créditos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona y asigna créditos a los clientes del sistema
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Selecciona un cliente de la lista para asignar crédito
            </div>
          </div>
        </div>

        {/* Debug Info - Temporal */}
        <CreditDebugInfo />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Asignado Hoy</p>
                <p className="text-2xl font-bold text-gray-900">$8,000</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio por Asignación</p>
                <p className="text-2xl font-bold text-gray-900">$4,200</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Clientes
            </h3>
            <div className="text-sm text-gray-600">
              {loading ? 'Cargando...' : `${clients.length} clientes`}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadClients}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {client.company_name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{client.email}</p>
                      {client.rif && (
                        <p className="text-xs text-gray-500 mt-1">{client.rif}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {client.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {client.credit_info && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            client.credit_info.credit_status === 'active' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            Crédito {client.credit_info.credit_status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No hay clientes disponibles</p>
              <p className="text-gray-500 text-sm mt-1">
                Los clientes aparecerán aquí cuando estén disponibles
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Acciones Rápidas
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Asignar Crédito</h4>
                    <p className="text-sm text-blue-700">
                      Haz clic en cualquier cliente de la lista para asignar crédito
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Buscar Cliente</span>
                  </div>
                  <p className="text-xs text-gray-500">Ver historial de créditos</p>
                </button>

                <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Reportes</span>
                  </div>
                  <p className="text-xs text-gray-500">Análisis de asignaciones</p>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent Assignments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Asignaciones Recientes
            </h3>

            <div className="space-y-3">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {assignment.client_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(assignment.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatAmount(assignment.amount)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {assignment.status}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay asignaciones recientes</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Las asignaciones de crédito aparecerán aquí
                  </p>
                </div>
              )}
            </div>

            {recentAssignments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Ver todas las asignaciones →
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Instrucciones para Asignar Crédito
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h5 className="font-medium mb-2">1. Buscar Cliente</h5>
              <p>Utiliza la búsqueda para encontrar el cliente por nombre de empresa, email o RIF.</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">2. Verificar Información</h5>
              <p>Revisa los datos del cliente y su estado de crédito actual antes de asignar.</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">3. Especificar Monto</h5>
              <p>Ingresa el monto a asignar dentro del rango permitido ($1 - $100,000).</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">4. Confirmar Asignación</h5>
              <p>Revisa todos los detalles y confirma la asignación de crédito.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedClient && (
        <SimpleCreditAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedClient(null);
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.company_name}
        />
      )}
    </div>
  );
};

export default AdminCreditAssignmentPage;

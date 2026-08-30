import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';
import type { SupportTicket } from '../../types/profile';

// Sección de Soporte
export const SupportTicketsSection: React.FC<{ 
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
}> = ({ tickets, setTickets }) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el ticket
    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      user_id: '', // Se asignará cuando se implemente la lógica real
      subject: newTicket.subject,
      message: newTicket.message,
      status: 'open',
      priority: newTicket.priority as 'low' | 'medium' | 'high' | 'urgent',
      category: newTicket.category as 'technical' | 'billing' | 'order' | 'general',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responses: []
    };
    setTickets((prev: SupportTicket[]) => [...prev, ticket]);
    setShowNewTicketForm(false);
    setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Nuevo ticket */}
      {!showNewTicketForm ? (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Centro de Soporte
            </h2>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="btn-medical-primary flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo ticket</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Contacto rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="p-3 lg:p-4 bg-medical-blue-50 rounded-xl text-center border border-medical-blue-100">
              <Phone className="w-6 h-6 lg:w-8 lg:h-8 text-medical-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">Teléfono</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">+58 212-800-FARMA</p>
              <p className="text-xs text-medical-gray-500">Lun-Vie 8AM-6PM</p>
            </div>
            <div className="p-3 lg:p-4 bg-green-50 rounded-xl text-center border border-green-100">
              <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">WhatsApp</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">+58 414-FARMA-VE</p>
              <p className="text-xs text-medical-gray-500">24/7 Disponible</p>
            </div>
            <div className="p-3 lg:p-4 bg-purple-50 rounded-xl text-center border border-purple-100 sm:col-span-2 lg:col-span-1">
              <Mail className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">Email</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">soporte@grupodrozainka.com</p>
              <p className="text-xs text-medical-gray-500">Respuesta en 24h</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900">Crear Nuevo Ticket</h2>
            <button
              onClick={() => setShowNewTicketForm(false)}
              className="btn-medical-secondary self-start sm:self-auto"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente tu problema"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                >
                  <option value="general">Consulta General</option>
                  <option value="technical">Problema Técnico</option>
                  <option value="billing">Facturación</option>
                  <option value="order">Pedidos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe detalladamente tu problema o consulta"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button type="submit" className="btn-medical-primary flex-1">
                Enviar ticket
              </button>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="btn-medical-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de tickets */}
      {!showNewTicketForm && (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <h3 className="text-lg font-bold text-medical-gray-900 mb-6">Mis Tickets</h3>
          
          <div className="space-y-3 lg:space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 lg:p-4 border border-medical-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                      <h4 className="font-semibold text-medical-gray-900 text-sm lg:text-base truncate">
                        {ticket.subject}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' : 
                         ticket.status === 'in_progress' ? 'En progreso' : 
                         ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'low' ? 'Baja' : 
                         ticket.priority === 'medium' ? 'Media' : 
                         ticket.priority === 'high' ? 'Alta' : 'Urgente'}
                      </span>
                    </div>
                    <p className="text-sm text-medical-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-medical-gray-500">
                      <span>Creado: {new Date(ticket.created_at).toLocaleDateString('es-VE')}</span>
                      <span>#{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <button className="btn-medical-secondary text-sm self-start sm:self-auto">
                    Ver detalles
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-medical-gray-300 mx-auto mb-4" />
              <h3 className="text-base lg:text-lg font-semibold text-medical-gray-500 mb-2">
                No hay tickets de soporte
              </h3>
              <p className="text-sm lg:text-base text-medical-gray-400">
                Crea tu primer ticket para contactar a nuestro equipo de soporte
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



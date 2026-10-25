import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface FlashOffersNotificationProps {
  notification: { type: 'success' | 'error'; message: string } | null;
  visible: boolean;
  onClose: () => void;
}

export const FlashOffersNotification: React.FC<FlashOffersNotificationProps> = ({
  notification,
  visible,
  onClose,
}) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3 bg-white/95 backdrop-blur border border-gray-200 shadow-2xl rounded-2xl min-w-[260px]">
        <div
          className={`p-2 rounded-full ${
            notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar notificación"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

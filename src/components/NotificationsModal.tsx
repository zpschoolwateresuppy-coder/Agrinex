import React from 'react';
import { X, Bell, CheckCircle2, Clock, Star, CalendarCheck, AlertTriangle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onNavigateToBookings: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onNavigateToBookings,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    if (type.includes('accepted')) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (type.includes('review')) return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
    if (type.includes('rejected') || type.includes('cancelled'))
      return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (type.includes('request')) return <CalendarCheck className="w-5 h-5 text-blue-600" />;
    return <Clock className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-base font-bold">गावातील सूचना व संदेश ({notifications.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-zinc-100">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">सध्या कोणतीही नवीन सूचना नाही.</p>
              <p className="text-xs text-zinc-400">
                बुकिंग विनंती किंवा कामाचे अपडेट आल्यावर येथे दिसेल.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) onMarkRead(n.id);
                  if (n.bookingId) {
                    onClose();
                    onNavigateToBookings();
                  }
                }}
                className={`pt-2.5 first:pt-0 p-3 rounded-xl transition-colors cursor-pointer ${
                  n.read ? 'bg-white hover:bg-zinc-50' : 'bg-emerald-50/70 border border-emerald-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                      <span>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('mr-IN') : 'आताच'}
                      </span>
                      {n.bookingId && (
                        <span className="text-emerald-700 font-medium hover:underline">
                          बुकिंग पहा →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};

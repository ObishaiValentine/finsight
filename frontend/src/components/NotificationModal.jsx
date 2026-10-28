import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, BellOff, Check } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

export default function NotificationModal({ isOpen, onClose }) {
  const { notifications, markAllAsRead, clearAll } = useNotification();

  const formatDate = (date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-app rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-app bg-elevated/30">
              <div>
                <h2 className="text-xl font-bold text-primary">Notifications</h2>
                <p className="text-xs text-secondary mt-1">Stay updated with your account activity</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
                  <Check size={14} /> Mark all read
                </button>
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 font-medium">
                  Clear all
                </button>
                <button onClick={onClose} className="text-muted hover:text-primary transition-colors bg-elevated p-2 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted">
                  <BellOff size={40} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                  <p className="text-xs mt-1">No new notifications right now.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      notif.read ? 'bg-transparent border-transparent' : 'bg-elevated border-app'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-0.5 shrink-0 ${
                        notif.type === 'error' ? 'text-red-500' :
                        notif.type === 'success' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {notif.type === 'error' ? <AlertCircle size={20} /> :
                         notif.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-bold ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-medium text-muted bg-app px-2 py-1 rounded-md">
                            {formatDate(notif.timestamp)} • {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${notif.read ? 'text-muted' : 'text-secondary'}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
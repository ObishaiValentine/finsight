import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, BellOff, Check, Bell } from 'lucide-react';
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-app rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Glowing Header */}
            <div className="relative p-6 pb-4 overflow-hidden shrink-0 border-b border-app">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-full blur-3xl" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Bell size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Notifications</h2>
                    <p className="text-xs text-secondary mt-0.5">Your recent alerts and updates</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-primary transition-colors bg-app p-2 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-4 px-6 py-3 bg-elevated/30 border-b border-app shrink-0">
              <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1 transition-colors">
                <Check size={14} /> Mark all read
              </button>
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">
                Clear all
              </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted">
                  <BellOff size={40} className="mb-4 opacity-30" />
                  <p className="text-sm font-medium text-secondary">You're all caught up!</p>
                  <p className="text-xs mt-1 text-muted">No new notifications right now.</p>
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
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <p className={`text-sm font-bold ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-medium text-muted bg-app px-2 py-1 rounded-md shrink-0">
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

            {/* Footer */}
            <div className="p-4 border-t border-app shrink-0 bg-card">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-app border border-app text-primary text-sm font-medium hover:bg-elevated transition-colors"
              >
                Close Mailbox
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
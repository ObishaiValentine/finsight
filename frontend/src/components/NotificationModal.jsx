import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, BellOff, Check, Bell } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

export default function NotificationModal({ isOpen, onClose }) {
  const { notifications, markAllAsRead, clearAll } = useNotification();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 100 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-app rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Clean Header */}
            <div className="flex items-center justify-between p-5 border-b border-app bg-card shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Bell size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">Notification</h2>
                  <p className="text-xs text-muted">Your recent alerts and updates</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1 transition-colors">
                  <Check size={14} /> Mark all read
                </button>
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">
                  Clear all
                </button>
                <button onClick={onClose} className="text-muted hover:text-primary transition-colors bg-elevated p-2 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1f1f2e]/50 hide-scrollbar">
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
                    className={`p-5 flex gap-4 transition-colors ${
                      notif.read ? 'bg-transparent' : 'bg-elevated/30'
                    }`}
                  >
                    {/* Carbon-style Soft Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'error' ? 'bg-red-500/10 text-red-500' :
                      notif.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {notif.type === 'error' ? <AlertCircle size={20} /> :
                       notif.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold mb-1 ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                        {notif.title}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-2 ${notif.read ? 'text-muted' : 'text-secondary'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-medium text-muted">
                        {formatDate(notif.timestamp)} • {formatTime(notif.timestamp)}
                      </p>
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
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
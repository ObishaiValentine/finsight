import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, BellOff } from 'lucide-react';
import { useNotification } from '../context/NotificationProvider';

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markAllAsRead, clearAll } = useNotification();

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible overlay to close when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 sm:w-96 bg-card border border-app rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-app bg-elevated/50">
              <h3 className="font-semibold text-primary">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-400">Mark all read</button>
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400">Clear</button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted">
                  <BellOff size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      notif.read ? 'bg-transparent border-transparent' : 'bg-elevated border-app'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 shrink-0 ${
                        notif.type === 'error' ? 'text-red-500' :
                        notif.type === 'success' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {notif.type === 'error' ? <AlertCircle size={18} /> :
                         notif.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-muted">{formatTime(notif.timestamp)}</span>
                        </div>
                        <p className={`text-xs mt-1 wrap-break-word ${notif.read ? 'text-muted' : 'text-secondary'}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
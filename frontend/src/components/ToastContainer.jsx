import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-card border border-app rounded-xl shadow-2xl p-4 w-80 flex items-start gap-3"
          >
            <div className={`mt-0.5 shrink-0 ${
              toast.type === 'error' ? 'text-red-500' :
              toast.type === 'success' ? 'text-green-500' : 'text-blue-500'
            }`}>
              {toast.type === 'error' ? <AlertCircle size={20} /> :
               toast.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary">{toast.title}</p>
              <p className="text-xs text-secondary mt-1">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-muted hover:text-primary transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
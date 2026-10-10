import { motion } from 'framer-motion';
import { Mail, Zap, Loader2 } from 'lucide-react';
import { useSync } from '../hooks/useSync';

export default function ConnectEmailButton({ size = 'md' }) {
  const { isConnected, isSyncing, statusLoading, connect, syncNow } = useSync();

  const handleClick = async () => {
    if (isConnected) {
      await syncNow(30, false);
    } else {
      try {
        await connect();
      } catch (err) {
        console.error('Connect Gmail failed:', err);
      }
    }
  };

  const padding = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm';
  const iconSize = size === 'sm' ? 14 : 16;

  if (statusLoading) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 ${padding} bg-card border border-app rounded-lg text-muted font-medium opacity-60 cursor-not-allowed`}
      >
        <Loader2 size={iconSize} className="animate-spin" />
        Loading...
      </button>
    );
  }

  if (isConnected) {
    return (
      <motion.button
        whileHover={{ scale: isSyncing ? 1 : 1.02 }}
        whileTap={{ scale: isSyncing ? 1 : 0.98 }}
        onClick={handleClick}
        disabled={isSyncing}
        className={`flex items-center gap-2 ${padding} bg-linear-to-r from-green-600 to-emerald-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-green-500/20`}
      >
        {isSyncing ? (
          <>
            <Loader2 size={iconSize} className="animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <Zap size={iconSize} />
            Sync Now
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex items-center gap-2 ${padding} bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20`}
    >
      <Mail size={iconSize} />
      Connect Email
    </motion.button>
  );
}
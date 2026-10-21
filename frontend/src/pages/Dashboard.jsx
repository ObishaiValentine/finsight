import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, Plus,
  ArrowUpRight, ArrowDownLeft, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { useSync } from '../hooks/useSync'; // FIXED IMPORT PATH
import { transactionService } from '../services/transactionService';
import AuroraBackground from '../components/AuroraBackground';
import ConnectEmailButton from '../components/ConnectEmailButton';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17) return 'Good evening';
  return 'Good morning';
}

function getFirstName(user) {
  if (!user) return 'there';
  const name = user.full_name || user.name || user.email?.split('@')[0] || 'there';
  return name.split(' ')[0];
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function Dashboard({ onReady }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { setActivePage } = useNavigation();
  const { subscribe } = useSync();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const greeting = getGreeting();
  const firstName = getFirstName(user);
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const [statsData, transactionsData] = await Promise.all([
        transactionService.getStats(),
        transactionService.getTransactions({ page: 1, pageSize: 5 }),
      ]);
      setStats(statsData);
      setRecentTransactions(transactionsData.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      if (showLoader) setLoading(false);
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    const init = async () => {
      await fetchData(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      fetchData(false);
    });
    return unsubscribe;
  }, [subscribe, fetchData]);

  const todayIncome = stats?.today_income || 0;
  const todayExpenses = stats?.today_expenses || 0;
  const todayNet = todayIncome - todayExpenses;
  const hasTodayActivity = todayIncome > 0 || todayExpenses > 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
          {greeting}, {displayName}
        </h1>
        <p className="text-secondary text-sm md:text-base">
          Here's your financial overview for today
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <ConnectEmailButton />
        <button
          onClick={() => setActivePage('parser')}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-app rounded-lg text-secondary text-sm font-medium hover:border-blue-500 transition-colors"
        >
          <Plus size={16} /> Parse Alert
        </button>
      </motion.div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <span className="text-red-500 text-xs">{error}</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative rounded-2xl p-6 md:p-8 overflow-hidden border transition-colors ${
          isDark ? 'bg-[#07070c] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <AuroraBackground intensity="subtle" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet size={22} className="text-white" />
              </div>
              <div>
                <p className={`text-[10px] md:text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Cash Flow
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  Income − Expenses
                </p>
              </div>
            </div>
            {loading ? (
              <Loader2 size={16} className="animate-spin text-blue-500" />
            ) : (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                (stats?.net_balance || 0) >= 0
                  ? isDark ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-200'
                  : isDark ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {(stats?.net_balance || 0) >= 0 ? 'Positive' : 'Negative'}
              </span>
            )}
          </div>
          <p className={`text-4xl md:text-5xl font-extrabold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {loading ? '...' : formatAmount(stats?.net_balance || 0)}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats?.total_transactions || 0} transactions
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-slate-400'}>this period</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -4 }}
          className={`rounded-xl p-5 cursor-pointer relative overflow-hidden border transition-colors ${
            isDark ? 'bg-[#13131a] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              
              {/* ONLY SHOW BADGE IF THERE IS ACTIVITY TODAY */}
              {hasTodayActivity && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  todayNet >= 0 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {todayNet >= 0 ? 'Positive' : 'Negative'}
                </span>
              )}
            </div>
            <p className="text-muted text-xs mb-1 font-medium">Today Cash Flow</p>
            <p className={`text-xl md:text-2xl font-bold mb-2 ${
              todayNet > 0 
                ? 'text-green-500' 
                : todayNet < 0 
                  ? 'text-red-500' 
                  : isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {loading ? '...' : (
                <>
                  {todayNet > 0 ? '+' : todayNet < 0 ? '-' : ''}
                  {formatAmount(Math.abs(todayNet))}
                </>
              )}
            </p>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-app">
              <span className="text-green-500 font-medium">+{formatAmount(todayIncome)}</span>
              <span className="text-red-500 font-medium">-{formatAmount(todayExpenses)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -4 }}
          className={`rounded-xl p-5 cursor-pointer border transition-colors ${
            isDark ? 'bg-[#13131a] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-green-500/10 text-green-500">
              All Time
            </span>
          </div>
          <p className="text-muted text-xs mb-1 font-medium">Total Income</p>
          <p className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {loading ? '...' : formatAmount(stats?.total_income || 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -4 }}
          className={`rounded-xl p-5 cursor-pointer border transition-colors ${
            isDark ? 'bg-[#13131a] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/20">
              <TrendingDown size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-red-500/10 text-red-500">
              All Time
            </span>
          </div>
          <p className="text-muted text-xs mb-1 font-medium">Total Expenses</p>
          <p className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {loading ? '...' : formatAmount(stats?.total_expenses || 0)}
          </p>
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Recent Transactions</h2>
          <button
            onClick={() => setActivePage('transactions')}
            className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-secondary mb-2">No transactions yet</p>
            <button
              onClick={() => setActivePage('parser')}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Parse your first bank alert →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                onClick={() => setActivePage('transactions')}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-hover transition-colors cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  tx.transaction_type === 'credit'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {tx.transaction_type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {tx.merchant || 'Transaction'}
                  </p>
                  <p className="text-xs text-muted">
                    {formatRelativeDate(tx.transaction_date)} • {tx.bank_name || 'Unknown'}
                  </p>
                </div>
                <p className={`text-sm font-semibold shrink-0 ${
                  tx.transaction_type === 'credit'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.transaction_type === 'credit' ? '+' : '-'}
                  {formatAmount(tx.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
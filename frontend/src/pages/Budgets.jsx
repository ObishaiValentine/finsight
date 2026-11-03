import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Target, Utensils, Car, ShoppingBag, Film,
  Receipt, ArrowRightLeft, MoreHorizontal, X, Loader2, Trash2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { useSync } from '../hooks/useSync';
import AuroraBackground from '../components/AuroraBackground';

const CATEGORY_ICONS = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Bills: Receipt,
  Transfer: ArrowRightLeft,
  Other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  Food: 'from-orange-400 to-red-500',
  Transport: 'from-blue-400 to-indigo-500',
  Shopping: 'from-pink-400 to-purple-500',
  Entertainment: 'from-purple-400 to-indigo-500',
  Bills: 'from-yellow-400 to-orange-500',
  Transfer: 'from-cyan-400 to-blue-500',
  Other: 'from-gray-400 to-slate-500',
};

export default function Budgets({ onReady }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { broadcastRefresh } = useSync();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    // Wrap in microtask to prevent synchronous setState warnings in React 19
    Promise.resolve().then(() => {
      fetchBudgets();
    });
  }, [fetchBudgets]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limitAmount || isNaN(limitAmount)) return;
    setSaving(true);
    try {
      await budgetService.setBudget(selectedCategory, parseFloat(limitAmount));
      await fetchBudgets();
      broadcastRefresh(); // Update Dashboard Safe-to-Spend
      setIsModalOpen(false);
      setLimitAmount('');
    } catch (err) {
      alert(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await budgetService.deleteBudget(id);
      fetchBudgets();
      broadcastRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent_this_month, 0);
  const totalPercent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1 flex items-center gap-2">
            Smart Budgets <ShieldCheck className="text-blue-500" size={24} />
          </h1>
          <p className="text-secondary text-sm md:text-base">Take total control of your spending this month.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Create Budget
        </button>
      </motion.div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* OVERALL SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 bg-[#07070c] shadow-2xl"
      >
        <AuroraBackground intensity="subtle" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Monthly Budget</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              ₦{totalLimit.toLocaleString()}
            </h2>
            <p className="text-sm text-gray-400">
              You have spent <span className="text-white font-semibold">₦{totalSpent.toLocaleString()}</span> so far.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mt-2">
              <div className={`w-2 h-2 rounded-full ${totalPercent > 90 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs text-gray-300 font-medium">
                {totalPercent > 90 ? 'Near Limit' : 'On Track'}
              </span>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none" 
                stroke={totalPercent > 90 ? '#ef4444' : 'url(#blueGradient)'} 
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(totalPercent / 100) * 251.2} 251.2`}
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(totalPercent / 100) * 251.2} 251.2` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-white">{Math.round(totalPercent)}%</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Used</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BUDGET CARDS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : budgets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-elevated/30 border border-app border-dashed rounded-2xl">
          <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Target size={32} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">No budgets yet</h3>
          <p className="text-sm text-secondary mb-6 max-w-sm mx-auto">
            Set a monthly limit for your favorite categories and we'll track it for you automatically.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="text-blue-500 font-medium hover:text-blue-400">
            Create your first budget →
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b, i) => {
            const Icon = CATEGORY_ICONS[b.category] || Target;
            const colorClass = CATEGORY_COLORS[b.category] || 'from-gray-500 to-slate-600';
            const isOver = b.percent_used > 100;
            const isWarning = b.percent_used > 80 && !isOver;

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative bg-card border border-app rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Background Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br ${colorClass}`} />

                <div className="relative flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-primary">{b.category}</h3>
                      <p className="text-xs text-muted">Monthly Limit</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="relative space-y-3">
                  <div className="flex items-end justify-between">
                    <span className={`text-xl font-bold ${isOver ? 'text-red-500' : 'text-primary'}`}>
                      ₦{b.spent_this_month.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted">/ ₦{b.monthly_limit.toLocaleString()}</span>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="h-2.5 w-full bg-app rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${Math.min(b.percent_used, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + (i * 0.1) }}
                      className={`h-full rounded-full ${
                        isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : `bg-linear-to-r ${colorClass}`
                      }`}
                    />
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <span className={`font-semibold ${isOver ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                      {b.percent_used}% Used
                    </span>
                    <span className="text-muted">
                      {b.remaining > 0 ? `₦${b.remaining.toLocaleString()} left` : `₦${Math.abs(b.remaining).toLocaleString()} over`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE BUDGET MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-app flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-primary">Create Budget</h2>
                  <p className="text-xs text-secondary">Set a monthly limit for a category.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-primary bg-elevated p-2 rounded-lg"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveBudget} className="p-6 space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">Select Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(CATEGORY_ICONS).map((cat) => {
                      const Icon = CATEGORY_ICONS[cat];
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            isSelected ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-elevated border-app text-muted hover:border-blue-500/50'
                          }`}
                        >
                          <Icon size={20} className="mb-1" />
                          <span className="text-[10px] font-medium">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Monthly Limit (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted">₦</span>
                    <input
                      type="number" required min="1" step="0.01" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)}
                      placeholder="50,000"
                      className="w-full bg-elevated border border-app rounded-2xl pl-10 pr-4 py-4 text-2xl font-bold text-primary placeholder:text-muted/50 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />} Save Budget
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
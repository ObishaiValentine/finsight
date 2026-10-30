import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Trash2,
  Copy,
  Check,
  EyeOff,
  Eye,
  Tag,
  Calendar,
  Building2,
  Wallet,
  Hash,
  Sparkles,
  RefreshCw,
  Pencil,
  Save
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useSync } from '../hooks/useSync';
import { transactionService } from '../services/transactionService';

const banks = ['All Banks', 'GTB', 'Zenith', 'Access', 'UBA', 'First Bank'];
const types = ['All Types', 'credit', 'debit'];

const CATEGORIES = [
  'Income',
  'Bills',
  'Shopping',
  'Transport',
  'Entertainment',
  'Food',
  'Transfer',
  'Refund',
  'Other',
  'Uncategorized',
];

const ITEMS_PER_PAGE = 8;
const HIDDEN_KEY = 'finsight-hidden-transactions';

function getHiddenIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHiddenIds(ids) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export default function Transactions({ onReady }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const { subscribe, broadcastRefresh } = useSync();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBank, setSelectedBank] = useState('All Banks');
  const [selectedType, setSelectedType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Hidden transactions (client-side)
  const [hiddenIds, setHiddenIds] = useState(() => getHiddenIds());
  const [showHidden, setShowHidden] = useState(false);

  // Detail modal
  const [detailTx, setDetailTx] = useState(null);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    transaction_type: 'debit',
    merchant: '',
    transaction_date: '',
    balance_after: '',
    category: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete
  const [deleteTx, setDeleteTx] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [reparsing, setReparsing] = useState(false);

  // ============ DATA FETCHING ============
  const fetchTransactions = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      };

      if (selectedType !== 'All Types') params.transactionType = selectedType;
      if (selectedBank !== 'All Banks') params.bankName = selectedBank;

      const data = await transactionService.getTransactions(params);
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      if (showLoader) setLoading(false);
      onReady?.();
    }
  }, [currentPage, selectedType, selectedBank, onReady]);

  // Initial + on filter change
  useEffect(() => {
    const init = async () => {
      await fetchTransactions(true);
    };
    init();
  }, [fetchTransactions]);

  // Subscribe to global sync events — silent refresh
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      fetchTransactions(false);
    });
    return unsubscribe;
  }, [subscribe, fetchTransactions]);

  // ============ FILTER + SORT ============
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Hide hidden ones unless showHidden is on
    if (!showHidden) {
      result = result.filter((tx) => !hiddenIds.includes(tx.id));
    }

    // Client-side search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.merchant?.toLowerCase().includes(q) ||
          tx.bank_name?.toLowerCase().includes(q) ||
          tx.category?.toLowerCase().includes(q) ||
          tx.amount?.toString().includes(q)
      );
    }

    return result;
  }, [transactions, searchQuery, hiddenIds, showHidden]);

  const hiddenCount = useMemo(
    () => transactions.filter((tx) => hiddenIds.includes(tx.id)).length,
    [transactions, hiddenIds]
  );

  // ============ ACTIONS ============
  const clearFilters = () => {
    setSelectedBank('All Banks');
    setSelectedType('All Types');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCopyDetails = async (tx) => {
    const text = `
    Transaction Details
    ====================
    Merchant: ${tx.merchant || 'N/A'}
    Bank: ${tx.bank_name || 'N/A'}
    Type: ${tx.transaction_type?.toUpperCase() || 'N/A'}
    Amount: ${formatAmount(tx.amount)}
    Date: ${formatFullDate(tx.transaction_date)}
    Account: ${tx.account_number || 'N/A'}
    Category: ${tx.category || 'Uncategorized'}
    Balance After: ${formatAmount(tx.balance_after)}
    Confidence: ${tx.confidence ? (tx.confidence * 100).toFixed(1) + '%' : 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleHide = (tx) => {
    const updated = [...hiddenIds, tx.id];
    setHiddenIds(updated);
    saveHiddenIds(updated);
    setDetailTx(null);
  };

  const handleUnhide = (tx) => {
    const updated = hiddenIds.filter((id) => id !== tx.id);
    setHiddenIds(updated);
    saveHiddenIds(updated);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTx) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await transactionService.deleteTransaction(deleteTx.id);
      setDeleteTx(null);
      setDetailTx(null);
      await fetchTransactions(false);
      broadcastRefresh();   // 👈 notify other pages
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        amount: parseFloat(editForm.amount),
        transaction_type: editForm.transaction_type,
        merchant: editForm.merchant,
        balance_after: editForm.balance_after ? parseFloat(editForm.balance_after) : null,
        category: editForm.category,
      };
      
      if (editForm.transaction_date) {
        payload.transaction_date = new Date(editForm.transaction_date).toISOString();
      }

      const updated = await transactionService.updateTransaction(detailTx.id, payload);
      
      // Update local state so UI reflects changes immediately
      setTransactions((prev) => prev.map(tx => tx.id === detailTx.id ? { ...tx, ...updated } : tx));
      setDetailTx({ ...detailTx, ...updated });
      setIsEditing(false);
      broadcastRefresh(); // Update Dashboard stats
    } catch (err) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setSavingEdit(false);
    }
  };

  const openDetail = (tx) => {
    setDetailTx(tx);
    setCopied(false);
    setIsEditing(false); // Reset edit mode
  };

  // ============ HELPERS ============
  const hasActiveFilters =
    selectedBank !== 'All Banks' || selectedType !== 'All Types';

    const handleReparse = async () => {
    setReparsing(true);
    try {
      const result = await transactionService.reparseTransactions();
      alert(result.message || 'Transactions re-parsed successfully!');
      await fetchTransactions(false);
      broadcastRefresh();
    } catch (err) {
      alert(err.message || 'Failed to reparse transactions');
    } finally {
      setReparsing(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
            Transactions
          </h1>
          <p className="text-secondary text-sm md:text-base">
            {loading ? 'Loading...' : `${total} transaction${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
                <div className="flex gap-2 w-full sm:w-auto">
        <button
            onClick={handleReparse}
            disabled={reparsing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-card border border-app rounded-lg text-secondary text-sm font-medium hover:border-blue-500 transition-colors disabled:opacity-60"
            title="Fix old transactions with the latest parser"
          >
            {reparsing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {reparsing ? 'Reparsing...' : 'Reparse Data'}
          </button>
          
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* SEARCH & FILTER BAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-xl p-4 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-app rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowHidden(!showHidden)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  showHidden
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'bg-card border-app text-secondary hover:border-amber-500'
                }`}
              >
                {showHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="hidden sm:inline">
                  {showHidden ? 'Visible' : `Hidden (${hiddenCount})`}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                  : 'bg-card border-app text-secondary hover:border-blue-500'
              }`}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-app">
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-card border border-app rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-card border border-app rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === 'All Types'
                        ? type
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* TRANSACTIONS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        {/* DESKTOP TABLE HEADER */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-app text-xs font-semibold text-muted uppercase tracking-wider">
          <div className="col-span-4">Merchant</div>
          <div className="col-span-2">Bank</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={() => fetchTransactions(true)}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-secondary text-sm mb-3">
              {searchQuery || hasActiveFilters
                ? 'No transactions match your search'
                : 'No transactions yet'}
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-500 text-sm hover:text-blue-400 transition-colors"
            >
              {searchQuery || hasActiveFilters ? 'Clear filters' : 'Go to Parser'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            {filteredTransactions.map((tx, i) => {
              const isHidden = hiddenIds.includes(tx.id);
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => openDetail(tx)}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-hover transition-colors cursor-pointer ${
                    isHidden ? 'opacity-40' : ''
                  }`}
                >
                  {/* Merchant + mobile */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        tx.transaction_type === 'credit'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.transaction_type === 'credit' ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary truncate">
                          {tx.merchant || 'Transaction'}
                        </p>
                        {isHidden && <EyeOff size={12} className="text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted md:hidden">
                        {formatFullDate(tx.transaction_date)} • {tx.bank_name || 'Unknown'}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold shrink-0 md:hidden ${
                        tx.transaction_type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.transaction_type === 'credit' ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </p>
                  </div>

                  {/* Bank */}
                  <div className="hidden md:flex col-span-2 items-center">
                    <span className="text-sm text-secondary">{tx.bank_name || '—'}</span>
                  </div>

                  {/* Type badge */}
                  <div className="hidden md:flex col-span-2 items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        tx.transaction_type === 'credit'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.transaction_type?.toUpperCase() || '—'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex col-span-2 items-center">
                    <span className="text-sm text-secondary">
                      {formatFullDate(tx.transaction_date)}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="hidden md:flex col-span-2 items-center justify-end">
                    <span
                      className={`text-sm font-semibold ${
                        tx.transaction_type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.transaction_type === 'credit' ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-app">
            <p className="text-xs text-secondary">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-card border border-app text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Smart Pagination Window */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  
                  let start = Math.max(2, currentPage - 1);
                  let end = Math.min(totalPages - 1, currentPage + 1);
                  
                  if (currentPage <= 3) {
                    start = 2; end = 4;
                  } else if (currentPage >= totalPages - 2) {
                    start = totalPages - 3; end = totalPages - 1;
                  }
                  
                  if (start > 2) pages.push('...');
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < totalPages - 1) pages.push('...');
                  
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-xs text-muted">
                        ...
                      </span>
                    );
                  }
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'bg-card border border-app text-secondary hover:text-primary'
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                });
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-card border border-app text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ===================== DETAIL MODAL ===================== */}
      <AnimatePresence>
        {detailTx && !deleteTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailTx(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header with amount */}
              <div className="relative p-6 pb-4 overflow-hidden shrink-0">
                <div
                  className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl ${
                    detailTx.transaction_type === 'credit'
                      ? 'bg-linear-to-br from-green-500/20 to-emerald-400/10'
                      : 'bg-linear-to-br from-red-500/20 to-orange-400/10'
                  }`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        detailTx.transaction_type === 'credit'
                          ? 'bg-linear-to-br from-green-500 to-emerald-400'
                          : 'bg-linear-to-br from-red-500 to-orange-400'
                      }`}
                    >
                      {detailTx.transaction_type === 'credit' ? (
                        <ArrowDownLeft size={22} className="text-white" />
                      ) : (
                        <ArrowUpRight size={22} className="text-white" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditForm({
                              amount: detailTx.amount,
                              transaction_type: detailTx.transaction_type,
                              merchant: detailTx.merchant || '',
                              transaction_date: detailTx.transaction_date ? new Date(detailTx.transaction_date).toISOString().slice(0, 16) : '',
                              balance_after: detailTx.balance_after || '',
                              category: detailTx.category || 'Uncategorized',
                            });
                            setIsEditing(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => setDetailTx(null)}
                        className="text-muted hover:text-primary transition-colors bg-elevated p-2 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-4">
                       <div>
                         <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Amount</label>
                         <input type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Type</label>
                           <select value={editForm.transaction_type} onChange={(e) => setEditForm({...editForm, transaction_type: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none">
                             <option value="credit">Credit</option>
                             <option value="debit">Debit</option>
                           </select>
                         </div>
                         <div>
                           <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Date</label>
                           <input type="datetime-local" value={editForm.transaction_date} onChange={(e) => setEditForm({...editForm, transaction_date: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none" />
                         </div>
                       </div>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`text-3xl font-bold mb-1 ${
                          detailTx.transaction_type === 'credit'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {detailTx.transaction_type === 'credit' ? '+' : '-'}
                        {formatAmount(detailTx.amount)}
                      </p>
                      <p className="text-xs text-muted">
                        {formatFullDate(detailTx.transaction_date)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 hide-scrollbar">
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Merchant</label>
                      <input type="text" value={editForm.merchant} onChange={(e) => setEditForm({...editForm, merchant: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Category</label>
                      <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1 block">Balance After</label>
                      <input type="number" value={editForm.balance_after} onChange={(e) => setEditForm({...editForm, balance_after: e.target.value})} className="w-full bg-elevated border border-app rounded-lg px-3 py-2 text-sm text-primary focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                ) : (
                  <>
                    <DetailRow icon={Building2} label="Merchant" value={detailTx.merchant || 'Unknown'} />
                    <DetailRow icon={Wallet} label="Bank" value={detailTx.bank_name || 'Unknown'} />
                    {detailTx.account_number && (
                      <DetailRow icon={Hash} label="Account" value={`•••• ${String(detailTx.account_number).slice(-4)}`} mono />
                    )}
                    <DetailRow icon={Calendar} label="Type" value={detailTx.transaction_type?.toUpperCase() || '—'} capitalize />
                    {detailTx.balance_after !== null && detailTx.balance_after !== undefined && (
                      <DetailRow icon={Wallet} label="Balance After" value={formatAmount(detailTx.balance_after)} />
                    )}
                    {detailTx.confidence !== null && detailTx.confidence !== undefined && (
                      <DetailRow icon={Sparkles} label="Parser Confidence" value={`${(detailTx.confidence * 100).toFixed(1)}%`} valueColor={ detailTx.confidence >= 0.9 ? 'text-green-500' : detailTx.confidence >= 0.7 ? 'text-yellow-500' : 'text-red-500' } />
                    )}
                    <DetailRow icon={Tag} label="Category" value={detailTx.category || 'Uncategorized'} />
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t border-app shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-lg bg-elevated border border-app text-sm font-medium text-primary hover:border-blue-500 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                      {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleCopyDetails(detailTx)} className="flex-1 min-w-25 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-elevated border border-app text-sm font-medium text-primary hover:border-blue-500 transition-colors">
                      {copied ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                    {hiddenIds.includes(detailTx.id) ? (
                      <button onClick={() => { handleUnhide(detailTx); setDetailTx(null); }} className="flex-1 min-w-25 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-500 hover:bg-amber-500/20 transition-colors">
                        <Eye size={14} /> Unhide
                      </button>
                    ) : (
                      <button onClick={() => handleHide(detailTx)} className="flex-1 min-w-25 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-elevated border border-app text-sm font-medium text-primary hover:border-amber-500 transition-colors">
                        <EyeOff size={14} /> Hide
                      </button>
                    )}
                    <button onClick={() => setDeleteTx(detailTx)} className="flex-1 min-w-25 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== DELETE CONFIRMATION ===================== */}
      <AnimatePresence>
        {deleteTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTx(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-primary mb-2">
                  Delete this transaction?
                </h2>
                <p className="text-sm text-secondary mb-2">
                  <span className="font-medium text-primary">
                    {deleteTx.merchant || 'Transaction'}
                  </span>
                </p>
                <p className="text-xs text-muted mb-6">
                  This action cannot be undone. The transaction will be permanently removed.
                </p>

                {deleteError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500">{deleteError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setDeleteTx(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Yes, delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== Helper components =====
function DetailRow({ icon: Icon, label, value, mono = false, capitalize = false, valueColor = 'text-primary' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-app last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-blue-500" />
        </div>
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span
        className={`text-xs font-medium ${valueColor} ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} text-right max-w-[60%] truncate`}
      >
        {value}
      </span>
    </div>
  );
}

// ===== Formatting helpers =====
function formatAmount(amount) {
  if (amount === null || amount === undefined) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 2 });
}

function formatFullDate(dateString) {
  if (!dateString) return '—';
  
  let cleanStr = String(dateString).replace(/\s*(am|pm|AM|PM)/gi, '').trim();
  const date = new Date(cleanStr);
  
  if (isNaN(date.getTime())) return 'Unknown Date'; 

  // Format: Oct 29, 2026 at 11:40 pm
  const formattedTime = date.toLocaleTimeString('en-NG', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true, 
    timeZone: 'Africa/Lagos' 
  }).toLowerCase();

  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Lagos'
  }) + ` at ${formattedTime}`;
}
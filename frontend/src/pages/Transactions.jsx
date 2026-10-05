import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { transactionService } from '../services/transactionService';

const banks = ['All Banks', 'GTB', 'Zenith', 'Access', 'UBA', 'First Bank'];
const types = ['All Types', 'credit', 'debit'];

const ITEMS_PER_PAGE = 8;

export default function Transactions({ onReady }) {
  const { searchQuery, setSearchQuery } = useSearch();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBank, setSelectedBank] = useState('All Banks');
  const [selectedType, setSelectedType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
        };

        if (selectedType !== 'All Types') {
          params.transactionType = selectedType;
        }
        if (selectedBank !== 'All Banks') {
          params.bankName = selectedBank;
        }

        const data = await transactionService.getTransactions(params);
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load transactions');
            } finally {
        setLoading(false);
        onReady?.();
      }
    };

    fetchTransactions();
   }, [currentPage, selectedType, selectedBank, onReady]);

  // Client-side search filter on top of server data
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.merchant?.toLowerCase().includes(q) ||
        tx.bank_name?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q) ||
        tx.amount?.toString().includes(q)
    );
  }, [transactions, searchQuery]);

  const clearFilters = () => {
    setSelectedBank('All Banks');
    setSelectedType('All Types');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedBank !== 'All Banks' || selectedType !== 'All Types';

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₦0';
    return '₦' + Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Download size={16} />
          Export CSV
        </button>
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

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
            {filteredTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-hover transition-colors"
              >
                {/* Merchant + mobile info */}
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
                    <p className="text-sm font-medium text-primary truncate">
                      {tx.merchant || 'Transaction'}
                    </p>
                    <p className="text-xs text-muted md:hidden">
                      {formatDate(tx.transaction_date)} • {tx.bank_name || 'Unknown'}
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

                {/* Bank (desktop) */}
                <div className="hidden md:flex col-span-2 items-center">
                  <span className="text-sm text-secondary">{tx.bank_name || '—'}</span>
                </div>

                {/* Type badge (desktop) */}
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

                {/* Date (desktop) */}
                <div className="hidden md:flex col-span-2 items-center">
                  <span className="text-sm text-secondary">
                    {formatDate(tx.transaction_date)}
                  </span>
                </div>

                {/* Amount (desktop) */}
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
            ))}
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

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-card border border-app text-secondary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}

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

    </div>
  );
}
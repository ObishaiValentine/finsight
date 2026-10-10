import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Settings,
  Building2,
  SearchX,
  CornerDownLeft
} from 'lucide-react';

const pageIcons = {
  dashboard: LayoutDashboard,
  transactions: ArrowLeftRight,
  analytics: PieChart,
  accounts: Wallet,
  settings: Settings,
};

export default function SearchDropdown({
  results,
  query,
  isOpen,
  onSelectTransaction,
  onSelectPage,
  onSelectBank,
  onViewAll,
  highlightedIndex,
}) {
  const totalResults =
    results.transactions.length + results.pages.length + results.banks.length;

  if (!isOpen) return null;

  const formatAmount = (amount) => '₦' + amount.toLocaleString();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-app bg-card shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          style={{ minWidth: '320px', maxWidth: '500px' }}
        >
          {totalResults === 0 ? (
            <div className="p-6 text-center">
              <SearchX size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-primary font-medium">No results for "{query}"</p>
              <p className="text-xs text-secondary mt-1">
                Try searching for: Olamide, GTB, Salary
              </p>
            </div>
          ) : (
            <>
              {/* TRANSACTIONS */}
              {results.transactions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1.5 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                      Transactions
                    </p>
                    <p className="text-[10px] text-muted">
                      {results.transactions.length} result{results.transactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {results.transactions.map((tx, i) => {
                    const globalIdx = i;
                    const isHighlighted = highlightedIndex === globalIdx;
                    return (
                      <button
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        onMouseEnter={() => {}}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isHighlighted ? 'bg-blue-500/10' : 'hover:bg-hover'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'credit'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {tx.type === 'credit' ? (
                            <ArrowDownLeft size={14} />
                          ) : (
                            <ArrowUpRight size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">
                            {tx.merchant}
                          </p>
                          <p className="text-xs text-muted">
                            {tx.date} • {tx.bank}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold shrink-0 ${
                            tx.type === 'credit'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatAmount(tx.amount)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PAGES */}
              {results.pages.length > 0 && (
                <div className="py-2 border-t border-app">
                  <div className="px-4 py-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                      Pages
                    </p>
                  </div>
                  {results.pages.map((page, i) => {
                    const globalIdx = results.transactions.length + i;
                    const isHighlighted = highlightedIndex === globalIdx;
                    const Icon = pageIcons[page.id] || LayoutDashboard;
                    return (
                      <button
                        key={page.id}
                        onClick={() => onSelectPage(page)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isHighlighted ? 'bg-blue-500/10' : 'hover:bg-hover'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary">
                            {page.label}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {page.description}
                          </p>
                        </div>
                        <CornerDownLeft size={12} className="text-muted shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* BANKS */}
              {results.banks.length > 0 && (
                <div className="py-2 border-t border-app">
                  <div className="px-4 py-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">
                      Banks
                    </p>
                  </div>
                  {results.banks.map((bank, i) => {
                    const globalIdx =
                      results.transactions.length + results.pages.length + i;
                    const isHighlighted = highlightedIndex === globalIdx;
                    return (
                      <button
                        key={bank.id}
                        onClick={() => onSelectBank(bank)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isHighlighted ? 'bg-blue-500/10' : 'hover:bg-hover'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary">
                            {bank.name}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {bank.fullName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* VIEW ALL */}
              <button
                onClick={onViewAll}
                className="w-full border-t border-app px-4 py-3 text-center text-xs font-medium text-blue-500 hover:bg-hover transition-colors"
              >
                Press Enter to view all transactions →
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Settings,
  LogOut, Menu, X, Bell, Search, Wallet, ChevronRight, Sparkles,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SearchDropdown from './SearchDropdown';
import { useNavigation } from '../hooks/useNavigation';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services/transactionService';
import { SUPPORTED_BANKS } from '../utils/banks';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: ArrowLeftRight, label: 'Transactions', page: 'transactions' },
  { icon: PieChart, label: 'Analytics', page: 'analytics' },
  { icon: Wallet, label: 'Accounts', page: 'accounts' },
  { icon: Sparkles, label: 'Parser', page: 'parser' },
  { icon: Settings, label: 'Settings', page: 'settings' },
];

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', page: 'dashboard' },
  { icon: ArrowLeftRight, label: 'Txns', page: 'transactions' },
  { icon: PieChart, label: 'Charts', page: 'analytics' },
  { icon: Wallet, label: 'Accounts', page: 'accounts' },
  { icon: Sparkles, label: 'Parser', page: 'parser' },
];

const pages = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview of your finances', keywords: ['home', 'overview', 'summary'] },
  { id: 'transactions', label: 'Transactions', description: 'View all your transactions', keywords: ['history', 'records', 'payments'] },
  { id: 'analytics', label: 'Analytics', description: 'Insights and charts', keywords: ['charts', 'reports', 'graphs', 'insights'] },
  { id: 'accounts', label: 'Accounts', description: 'Manage your bank accounts', keywords: ['banks', 'balance'] },
  { id: 'parser', label: 'Parser', description: 'Parse bank alerts', keywords: ['extract', 'alert', 'email'] },
  { id: 'settings', label: 'Settings', description: 'App preferences', keywords: ['profile', 'preferences', 'config'] },
];

function formatDateShort(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function Layout({ children }) {
  // Initialize based on current window size (no flash)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [instantClose, setInstantClose] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { activePage, setActivePage } = useNavigation();
  const { setSearchQuery } = useSearch();
  const { user, logout } = useAuth();

  const [localSearch, setLocalSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);

  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await transactionService.getTransactions({ page: 1, pageSize: 100 });
        setAllTransactions(data.transactions || []);
      } catch {
        // Silent
      }
    };
    loadTransactions();
  }, []);

  const getSearchResults = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return { transactions: [], pages: [], banks: [] };

    const matchedTransactions = allTransactions
      .filter((tx) =>
        tx.merchant?.toLowerCase().includes(q) ||
        tx.bank_name?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q) ||
        tx.transaction_type?.toLowerCase().includes(q) ||
        tx.amount?.toString().includes(q)
      )
      .slice(0, 5)
      .map((tx) => ({
        id: tx.id,
        type: tx.transaction_type,
        merchant: tx.merchant || 'Transaction',
        amount: tx.amount,
        date: formatDateShort(tx.transaction_date),
        bank: tx.bank_name || 'Unknown',
        category: tx.category,
      }));

    const matchedPages = pages
      .filter((page) =>
        page.label.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q) ||
        page.keywords.some((k) => k.toLowerCase().includes(q))
      )
      .slice(0, 3);

    const matchedBanks = SUPPORTED_BANKS
      .filter((bank) =>
        bank.name.toLowerCase().includes(q) ||
        bank.displayName.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .map((bank) => ({
        id: bank.name.toLowerCase(),
        name: bank.name,
        fullName: bank.displayName,
      }));

    return { transactions: matchedTransactions, pages: matchedPages, banks: matchedBanks };
  };

  const results = getSearchResults(localSearch);
  const totalResults = results.transactions.length + results.pages.length + results.banks.length;

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setHighlightedIndex(-1);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page) => {
    if (isMobile) {
      // INSTANT close — no animation, sidebar vanishes immediately
      setInstantClose(true);
      setSidebarOpen(false);
      setActivePage(page);
      // Reset flag on next frame so future opens animate normally
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setInstantClose(false));
      });
    } else {
      setActivePage(page);
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setHighlightedIndex(-1);
    setLocalSearch('');
  };

  const handleSelectTransaction = (tx) => {
    setSearchQuery(tx.merchant);
    setActivePage('transactions');
    closeDropdown();
  };

  const handleSelectPage = (page) => {
    setActivePage(page.id);
    closeDropdown();
  };

  const handleSelectBank = (bank) => {
    setSearchQuery(bank.name);
    setActivePage('accounts');
    closeDropdown();
  };

  const handleViewAll = () => {
    if (localSearch.trim()) {
      setSearchQuery(localSearch);
      setActivePage('transactions');
      closeDropdown();
    }
  };

  const handleKeyDown = (e) => {
    const total = totalResults;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (total > 0) setHighlightedIndex((prev) => (prev + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (total > 0) setHighlightedIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < totalResults) {
        if (highlightedIndex < results.transactions.length) {
          handleSelectTransaction(results.transactions[highlightedIndex]);
        } else if (highlightedIndex < results.transactions.length + results.pages.length) {
          const pageIdx = highlightedIndex - results.transactions.length;
          handleSelectPage(results.pages[pageIdx]);
        } else {
          const bankIdx = highlightedIndex - results.transactions.length - results.pages.length;
          handleSelectBank(results.banks[bankIdx]);
        }
      } else {
        handleViewAll();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      e.target.blur();
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // Sidebar classes — CSS transform based
  const sidebarClasses = `
    bg-elevated border-r border-app flex flex-col w-64 shrink-0 h-dvh
    ${isMobile
      ? `fixed top-0 left-0 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      : 'sticky top-0 z-20'
    }
    ${isMobile && !instantClose ? 'transition-transform duration-300 ease-out' : ''}
  `;

  const sidebarStyle = isMobile && instantClose ? { transition: 'none' } : undefined;

  // Sidebar content (shared)
  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 border-b border-app shrink-0">
        <h1 className="text-2xl font-bold gradient-text">FinSight</h1>
        <p className="text-xs text-muted mt-1">Smart Finance Tracking</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
        {navItems.map((item, i) => {
          const isActive = activePage === item.page;
          return (
            <motion.button
              key={item.label}
              onClick={() => handleNavClick(item.page)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  : 'text-secondary hover:text-primary hover:bg-hover border border-transparent'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="shrink-0 p-3 md:p-4 border-t border-app" ref={userMenuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-hover transition-colors cursor-pointer"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white shrink-0 text-sm md:text-base">
                {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate text-primary">
                {user?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted capitalize">{user?.plan || 'Free'}</p>
            </div>
            <ChevronRight
              size={14}
              className={`text-muted transition-transform shrink-0 ${userMenuOpen ? 'rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-app rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-app">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="text-sm font-medium text-primary truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setUserMenuOpen(false);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-primary hover:bg-hover transition-colors text-sm"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-app text-primary flex">

      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR — conditional render on desktop, CSS transform on mobile */}
      {(!isMobile && !sidebarOpen) ? null : (
        <aside className={sidebarClasses} style={sidebarStyle}>
          {sidebarContent}
        </aside>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-app bg-app/80 backdrop-blur-lg flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-secondary hover:text-primary transition-colors shrink-0"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="relative hidden sm:block flex-1 max-w-md" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" size={16} />
              <input
                type="text"
                placeholder="Search transactions, pages, banks..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setDropdownOpen(e.target.value.trim().length > 0);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => {
                  if (localSearch.trim().length > 0) setDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-card border border-app rounded-lg pl-10 pr-4 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
              />
              <SearchDropdown
                results={results}
                query={localSearch}
                isOpen={dropdownOpen}
                onSelectTransaction={handleSelectTransaction}
                onSelectPage={handleSelectPage}
                onSelectBank={handleSelectBank}
                onViewAll={handleViewAll}
                highlightedIndex={highlightedIndex}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative text-secondary hover:text-primary transition-colors"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-elevated/95 backdrop-blur-xl border-t border-app">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mobileNavItems.map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors relative"
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-blue-500' : 'text-muted'}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-blue-500' : 'text-muted'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-1.5 w-8 h-0.5 rounded-full bg-blue-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
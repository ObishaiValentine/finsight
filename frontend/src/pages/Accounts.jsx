import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  Mail,
  CheckCircle2,
  Building2,
  TrendingUp,
  X,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  StickyNote,
  ArrowUpDown,
  Eye,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { accountService } from '../services/accountService';
import BankLogo from '../components/BankLogo';
import { SUPPORTED_BANKS } from '../utils/banks';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'balance_desc', label: 'Highest balance' },
  { value: 'balance_asc', label: 'Lowest balance' },
  { value: 'bank_asc', label: 'Bank name (A-Z)' },
];

export default function Accounts({ onReady }) {
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showArchived, setShowArchived] = useState(false);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [restoring, setRestoring] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Detail / edit / delete states
  const [detailAccount, setDetailAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);

  // Sort + filter
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBank, setFilterBank] = useState('All');

  // Bank picker state
  const [bankSearch, setBankSearch] = useState('');
  const [manualEntry, setManualEntry] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_type: 'savings',
    balance: '',
    currency: 'NGN',
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    bank_name: '',
    account_type: '',
    balance: '',
    currency: '',
    notes: '',
  });
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

      const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const activeData = await accountService.getAccounts();
      setAccounts(activeData.accounts || []);
      setTotalBalance(activeData.total_balance || 0);

      const archivedData = await accountService.getArchivedAccounts();
      setArchivedAccounts(archivedData.accounts || []);
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
      onReady?.();
    }
  };

  useEffect(() => {
    const loadAccounts = async () => {
      await fetchAccounts();
    };
    loadAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('alerts@finsight.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter + sort logic
  const processedAccounts = useMemo(() => {
    let result = [...accounts];

    // Filter by bank
    if (filterBank !== 'All') {
      result = result.filter((a) => a.bank_name === filterBank);
    }

    // Sort
    switch (sortBy) {
      case 'date_desc':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'balance_desc':
        result.sort((a, b) => b.balance - a.balance);
        break;
      case 'balance_asc':
        result.sort((a, b) => a.balance - b.balance);
        break;
      case 'bank_asc':
        result.sort((a, b) => a.bank_name.localeCompare(b.bank_name));
        break;
      default:
        break;
    }

    return result;
  }, [accounts, sortBy, filterBank]);

  // Unique banks for filter dropdown
  const availableBanks = useMemo(() => {
    const banks = new Set(accounts.map((a) => a.bank_name));
    return ['All', ...Array.from(banks)];
  }, [accounts]);

  // CREATE account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    try {
      await accountService.createAccount({
        bank_name: formData.bank_name.trim(),
        account_number: formData.account_number.trim(),
        account_type: formData.account_type,
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        notes: formData.notes.trim() || null,
      });

      setFormData({
        bank_name: '',
        account_number: '',
        account_type: 'savings',
        balance: '',
        currency: 'NGN',
        notes: '',
      });
      setBankSearch('');
      setManualEntry(false);
      setCreateModalOpen(false);
      await fetchAccounts();
    } catch (err) {
      setFormError(err.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  // EDIT account
  const openEditModal = (account) => {
    setEditAccount(account);
    setEditForm({
      bank_name: account.bank_name,
      account_type: account.account_type,
      balance: account.balance?.toString() || '',
      currency: account.currency,
      notes: account.notes || '',
    });
    setEditError('');
    setDetailAccount(null);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditing(true);

    try {
      await accountService.updateAccount(editAccount.id, {
        bank_name: editForm.bank_name.trim(),
        account_type: editForm.account_type,
        balance: parseFloat(editForm.balance) || 0,
        currency: editForm.currency,
        notes: editForm.notes.trim() || null,
      });

      setEditAccount(null);
      await fetchAccounts();
    } catch (err) {
      setEditError(err.message || 'Failed to update account');
    } finally {
      setEditing(false);
    }
  };

  // DELETE account
  const confirmDelete = async () => {
    setDeleteError('');
    setDeleting(true);

    try {
      await accountService.deleteAccount(deleteAccount.id);
      setDeleteAccount(null);
      setDetailAccount(null);
      await fetchAccounts();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

    // RESTORE account
  const handleRestore = async (account) => {
    setRestoring(account.id);
    try {
      await accountService.restoreAccount(account.id);
      await fetchAccounts();
    } catch (err) {
      setError(err.message || 'Failed to restore account');
    } finally {
      setRestoring(null);
    }
  };

  // Bank picker handlers
  const handleSelectBank = (bank) => {
    setFormData({ ...formData, bank_name: bank.name });
    setFormError('');
  };

  const handleResetBankSelection = () => {
    setFormData({ ...formData, bank_name: '' });
    setBankSearch('');
    setManualEntry(false);
    setFormError('');
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setBankSearch('');
    setManualEntry(false);
    setFormError('');
    setFormData({
      bank_name: '',
      account_number: '',
      account_type: 'savings',
      balance: '',
      currency: 'NGN',
      notes: '',
    });
  };

  const filteredBanks = SUPPORTED_BANKS.filter((bank) =>
    bank.displayName.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₦0';
    return '₦' + Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 2 });
  };

  const isBankSelected = !!formData.bank_name;

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
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Accounts</h1>
          <p className="text-secondary text-sm md:text-base">
            {loading
              ? 'Loading...'
              : `${accounts.length} connected bank account${accounts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-card border border-app rounded-lg text-secondary text-sm font-medium hover:border-blue-500 transition-colors"
          >
            <Mail size={16} />
            Connect Email
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
      </motion.div>

      {/* ERROR */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* TOTAL BALANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Total Balance</p>
              <p className="text-xs text-secondary">Sum of all bank accounts</p>
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {loading ? '...' : formatAmount(totalBalance)}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-blue-500 font-medium">
              <TrendingUp size={12} />
              {accounts.length} connected account{accounts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* TOOLBAR — sort + filter */}
      {!loading && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          {/* Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-card border border-app rounded-lg pl-9 pr-8 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {availableBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank === 'All' ? 'All banks' : bank}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative flex-1 sm:flex-initial">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-card border border-app rounded-lg pl-9 pr-8 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

                   {/* Archived toggle */}
          {archivedAccounts.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                showArchived
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-card border-app text-secondary hover:border-blue-500'
              }`}
            >
              <Archive size={12} />
              Archived ({archivedAccounts.length})
            </button>
          )}

          {/* Count */}
          <p className="text-xs text-muted sm:ml-auto">
            Showing {processedAccounts.length} of {accounts.length}
          </p>
        </motion.div>
      )}

      {/* BANK CARDS */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-blue-500" />
          </div>
          <h3 className="text-base font-semibold text-primary mb-1">No accounts yet</h3>
          <p className="text-xs text-secondary mb-5 max-w-sm mx-auto">
            Add your first bank account to start tracking transactions across all your banks.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Your First Account
          </button>
        </motion.div>
      ) : processedAccounts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-sm text-secondary mb-2">No accounts match your filter</p>
          <button
            onClick={() => setFilterBank('All')}
            className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedAccounts.map((account, i) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass rounded-xl p-5 cursor-pointer relative overflow-hidden group"
              onClick={() => setDetailAccount(account)}
            >
              <motion.div
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl pointer-events-none"
                initial={{ opacity: 0.08 }}
                whileHover={{ opacity: 0.25, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.6))',
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <BankLogo bankName={account.bank_name} size="md" />
                  {account.notes && (
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center" title="Has note">
                      <StickyNote size={12} className="text-amber-500" />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-base font-bold text-primary mb-0.5">
                    {account.bank_name}
                  </h3>
                  <p className="text-xs text-muted">{account.currency} Account</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xs font-mono text-secondary tracking-wider">
                    •••• {account.account_number.slice(-4)}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium capitalize">
                    {account.account_type}
                  </span>
                </div>

                <div className="pt-4 border-t border-app">
                  <p className="text-xs text-muted mb-1">Available Balance</p>
                  <p className="text-xl font-bold text-primary mb-3">
                    {formatAmount(account.balance)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-green-500">
                      <CheckCircle2 size={12} />
                      <span>{account.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={12} />
                      <span>View</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

            {/* ARCHIVED ACCOUNTS SECTION */}
      {showArchived && archivedAccounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-amber-500" />
            <h2 className="text-sm font-bold text-primary">
              Archived Accounts ({archivedAccounts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 border border-dashed border-app bg-elevated/50 relative overflow-hidden"
              >
                <div className="relative opacity-60">
                  <div className="flex items-start justify-between mb-4">
                    <div className="grayscale">
                      <BankLogo bankName={account.bank_name} size="md" animated={false} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                      Archived
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-primary mb-0.5">
                      {account.bank_name}
                    </h3>
                    <p className="text-xs text-muted">{account.currency} Account</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs font-mono text-secondary tracking-wider">
                      •••• {account.account_number.slice(-4)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-app">
                    <p className="text-xs text-muted mb-1">Last Balance</p>
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatAmount(account.balance)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(account)}
                  disabled={restoring === account.id}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-60"
                >
                  {restoring === account.id ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <ArchiveRestore size={12} />
                      Restore Account
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}


      {/* ===================== ACCOUNT DETAIL MODAL ===================== */}
      <AnimatePresence>
        {detailAccount && !editAccount && !deleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailAccount(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-full blur-3xl" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <BankLogo bankName={detailAccount.bank_name} size="lg" animated={false} />
                    <div>
                      <h2 className="text-lg font-bold text-primary">{detailAccount.bank_name}</h2>
                      <p className="text-xs text-muted capitalize">{detailAccount.account_type} · {detailAccount.currency}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailAccount(null)}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="px-6 pb-4">
                <p className="text-xs text-muted mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-primary">
                  {formatAmount(detailAccount.balance)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="px-6 pb-4 space-y-3">
                <DetailRow label="Account Number" value={detailAccount.account_number} mono />
                <DetailRow label="Bank" value={detailAccount.bank_name} />
                <DetailRow label="Type" value={detailAccount.account_type} capitalize />
                <DetailRow label="Currency" value={detailAccount.currency} />
                <DetailRow label="Status" value={detailAccount.is_active ? 'Active' : 'Inactive'} />
              </div>

              {/* Notes */}
              {detailAccount.notes && (
                <div className="px-6 pb-4">
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <StickyNote size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 mb-1">
                          Note
                        </p>
                        <p className="text-xs text-secondary whitespace-pre-line">
                          {detailAccount.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t border-app">
                <button
                  onClick={() => openEditModal(detailAccount)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-elevated border border-app text-sm font-medium text-primary hover:border-blue-500 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteAccount(detailAccount)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== EDIT ACCOUNT MODAL ===================== */}
      <AnimatePresence>
        {editAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditAccount(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Pencil size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Edit Account</h2>
                    <p className="text-xs text-muted">Update your bank account details</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditAccount(null)}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="mx-6 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-500">{editError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateAccount} className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={editForm.bank_name}
                    onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                    required
                    className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">Account Type</label>
                    <select
                      value={editForm.account_type}
                      onChange={(e) => setEditForm({ ...editForm, account_type: e.target.value })}
                      className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="domiciliary">Domiciliary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">Currency</label>
                    <select
                      value={editForm.currency}
                      onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                      className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">Balance</label>
                  <input
                    type="number"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">
                    Notes <span className="text-muted">(optional)</span>
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="e.g., Main salary account"
                    rows={2}
                    className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditAccount(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {editing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== DELETE CONFIRMATION ===================== */}
      <AnimatePresence>
        {deleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteAccount(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70 flex items-center justify-center p-4"
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
                  Delete this account?
                </h2>
                <p className="text-sm text-secondary mb-5">
                  <span className="font-medium text-primary">{deleteAccount.bank_name}</span> · •••• {deleteAccount.account_number.slice(-4)}
                </p>
                <p className="text-xs text-muted mb-6">
                  This action go remove the account from your dashboard. Transactions go remain for your history.
                </p>

                {deleteError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500">{deleteError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setDeleteAccount(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
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

      {/* ===================== CREATE ACCOUNT MODAL (unchanged logic) ===================== */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCreateModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-start justify-between p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  {isBankSelected ? (
                    <button
                      onClick={handleResetBankSelection}
                      className="w-11 h-11 rounded-xl bg-elevated border border-app flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      <ArrowLeft size={18} className="text-secondary" />
                    </button>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Plus size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-primary">
                      {isBankSelected ? 'Account Details' : 'Add Bank Account'}
                    </h2>
                    <p className="text-xs text-muted">
                      {isBankSelected
                        ? `${formData.bank_name} selected`
                        : 'Choose your bank to get started'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCreateModal}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mx-6 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 shrink-0">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-500">{formError}</p>
                </div>
              )}

              {/* VIEW 1: Bank Picker */}
              {!isBankSelected && (
                <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
                  <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="Search banks..."
                      className="w-full bg-elevated border border-app rounded-xl pl-10 pr-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto -mx-1 px-1">
                    {filteredBanks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-sm text-secondary mb-2">No banks match "{bankSearch}"</p>
                        <button
                          onClick={() => setManualEntry(true)}
                          className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Add manually instead →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {filteredBanks.map((bank, i) => (
                          <motion.button
                            key={bank.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                            whileHover={{ y: -3, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelectBank(bank)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-elevated border border-app hover:border-blue-500/50 transition-colors group"
                          >
                            <BankLogo bankName={bank.name} size="md" animated={false} />
                            <span className="text-[11px] font-medium text-secondary group-hover:text-primary transition-colors text-center leading-tight">
                              {bank.displayName}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!manualEntry && filteredBanks.length > 0 && (
                    <div className="shrink-0 pt-4 mt-2 border-t border-app">
                      <button
                        onClick={() => setManualEntry(true)}
                        className="w-full text-xs text-blue-500 hover:text-blue-400 transition-colors py-2"
                      >
                        Can't find your bank? Add manually →
                      </button>
                    </div>
                  )}

                  {manualEntry && (
                    <div className="shrink-0 pt-4 mt-2 border-t border-app space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="Enter bank name"
                          autoFocus
                          className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => setManualEntry(false)}
                        className="text-xs text-muted hover:text-primary transition-colors"
                      >
                        ← Back to bank list
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: Account Details */}
              {isBankSelected && (
                <form onSubmit={handleCreateAccount} className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto px-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-elevated border border-blue-500/20">
                      <BankLogo bankName={formData.bank_name} size="md" animated={false} />
                      <div className="flex-1">
                        <p className="text-xs text-muted">Selected bank</p>
                        <p className="text-sm font-semibold text-primary">{formData.bank_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetBankSelection}
                        className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-secondary mb-2">Account Number</label>
                      <input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            account_number: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        placeholder="0123456789"
                        required
                        minLength={10}
                        maxLength={10}
                        autoFocus
                        className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">Account Type</label>
                        <select
                          value={formData.account_type}
                          onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                          className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="domiciliary">Domiciliary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-2">Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="NGN">NGN</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-secondary mb-2">
                        Current Balance <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-secondary mb-2">
                        Notes <span className="text-muted">(optional)</span>
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="e.g., Main salary account"
                        rows={2}
                        className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-app shrink-0">
                    <button
                      type="button"
                      onClick={handleCloseCreateModal}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !formData.account_number || formData.account_number.length < 10}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {creating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Account'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONNECT EMAIL MODAL */}
      <AnimatePresence>
        {connectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConnectModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Connect Bank Alerts</h2>
                    <p className="text-xs text-muted">Auto-import transactions</p>
                  </div>
                </div>
                <button
                  onClick={() => setConnectModalOpen(false)}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-secondary leading-relaxed">
                  Forward your bank alert emails to the FinSight address below. Our parser go automatically extract every transaction.
                </p>

                <div className="p-4 rounded-xl bg-elevated border border-app">
                  <p className="text-xs text-muted mb-2">Forward bank alerts to:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-primary flex-1 truncate">alerts@finsight.app</p>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium hover:bg-blue-500/20 transition-colors shrink-0"
                    >
                      {copied ? (<><Check size={12} /> Copied</>) : (<><Copy size={12} /> Copy</>)}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setConnectModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                >
                  Maybe Later
                </button>
                <button className="flex-1 px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Connect Gmail
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ===== Helper component =====
function DetailRow({ label, value, mono = false, capitalize = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-app last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={`text-xs font-medium text-primary ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
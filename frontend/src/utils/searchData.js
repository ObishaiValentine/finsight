export const allTransactions = [
  { id: 1, type: 'debit', merchant: 'Transfer to Olamide', amount: 50000, date: '2026-09-15', time: '2:30 PM', bank: 'GTB', category: 'Transfer' },
  { id: 2, type: 'credit', merchant: 'Salary - Tech Corp', amount: 450000, date: '2026-09-15', time: '9:00 AM', bank: 'Zenith', category: 'Income' },
  { id: 3, type: 'debit', merchant: 'POS Purchase - Shoprite', amount: 12500, date: '2026-09-14', time: '6:15 PM', bank: 'Access', category: 'Shopping' },
  { id: 4, type: 'debit', merchant: 'Transfer to Chidi', amount: 25000, date: '2026-09-14', time: '11:30 AM', bank: 'UBA', category: 'Transfer' },
  { id: 5, type: 'credit', merchant: 'Refund - Jumia', amount: 8500, date: '2026-09-13', time: '4:45 PM', bank: 'First Bank', category: 'Refund' },
  { id: 6, type: 'debit', merchant: 'MTN Airtime', amount: 2000, date: '2026-09-13', time: '10:20 AM', bank: 'GTB', category: 'Bills' },
  { id: 7, type: 'debit', merchant: 'Transfer to Mama Ngozi', amount: 15000, date: '2026-09-12', time: '3:00 PM', bank: 'Access', category: 'Transfer' },
  { id: 8, type: 'credit', merchant: 'Freelance Payment', amount: 120000, date: '2026-09-12', time: '11:00 AM', bank: 'Zenith', category: 'Income' },
  { id: 9, type: 'debit', merchant: 'Netflix Subscription', amount: 5500, date: '2026-09-11', time: '8:00 AM', bank: 'UBA', category: 'Entertainment' },
  { id: 10, type: 'debit', merchant: 'Transfer to Tunde', amount: 30000, date: '2026-09-11', time: '5:30 PM', bank: 'GTB', category: 'Transfer' },
  { id: 11, type: 'debit', merchant: 'Uber Ride', amount: 3500, date: '2026-09-10', time: '7:15 AM', bank: 'First Bank', category: 'Transport' },
  { id: 12, type: 'credit', merchant: 'Dividend Payment', amount: 25000, date: '2026-09-10', time: '2:00 PM', bank: 'Zenith', category: 'Investment' },
  { id: 13, type: 'debit', merchant: 'DSTV Subscription', amount: 12000, date: '2026-09-09', time: '9:30 AM', bank: 'Access', category: 'Entertainment' },
  { id: 14, type: 'debit', merchant: 'Transfer to Blessing', amount: 45000, date: '2026-09-09', time: '1:45 PM', bank: 'UBA', category: 'Transfer' },
  { id: 15, type: 'credit', merchant: 'Business Payment', amount: 200000, date: '2026-09-08', time: '10:00 AM', bank: 'GTB', category: 'Income' },
];

export const pages = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview of your finances', keywords: ['home', 'overview', 'summary'] },
  { id: 'transactions', label: 'Transactions', description: 'View all your transactions', keywords: ['history', 'records', 'payments'] },
  { id: 'analytics', label: 'Analytics', description: 'Insights and charts', keywords: ['charts', 'reports', 'graphs', 'insights'] },
  { id: 'accounts', label: 'Accounts', description: 'Manage your bank accounts', keywords: ['banks', 'balance'] },
  { id: 'settings', label: 'Settings', description: 'App preferences', keywords: ['profile', 'preferences', 'config'] },
];

export const banks = [
  { id: 'gtb', name: 'GTB', fullName: 'Guaranty Trust Bank' },
  { id: 'zenith', name: 'Zenith', fullName: 'Zenith Bank' },
  { id: 'access', name: 'Access', fullName: 'Access Bank' },
  { id: 'uba', name: 'UBA', fullName: 'United Bank for Africa' },
  { id: 'firstbank', name: 'First Bank', fullName: 'First Bank of Nigeria' },
];

export function performSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return { transactions: [], pages: [], banks: [] };

  // Search transactions
  const matchedTransactions = allTransactions
    .filter((tx) => {
      return (
        tx.merchant.toLowerCase().includes(q) ||
        tx.bank.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  // Search pages
  const matchedPages = pages
    .filter((page) => {
      return (
        page.label.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q) ||
        page.keywords.some((k) => k.toLowerCase().includes(q))
      );
    })
    .slice(0, 3);

  // Search banks
  const matchedBanks = banks
    .filter((bank) => {
      return (
        bank.name.toLowerCase().includes(q) ||
        bank.fullName.toLowerCase().includes(q)
      );
    })
    .slice(0, 2);

  return {
    transactions: matchedTransactions,
    pages: matchedPages,
    banks: matchedBanks,
  };
}
export const accounts = [
  {
    id: 1,
    bank: 'GTB',
    fullName: 'Guaranty Trust Bank',
    accountNumber: '0123456789',
    accountType: 'Savings',
    balance: 1250000,
    color: 'from-orange-500 to-red-500',
    lastSync: '2 mins ago',
    status: 'connected',
  },
  {
    id: 2,
    bank: 'Zenith',
    fullName: 'Zenith Bank',
    accountNumber: '1234567890',
    accountType: 'Current',
    balance: 680000,
    color: 'from-red-500 to-pink-500',
    lastSync: '5 mins ago',
    status: 'connected',
  },
  {
    id: 3,
    bank: 'Access',
    fullName: 'Access Bank',
    accountNumber: '2345678901',
    accountType: 'Savings',
    balance: 320000,
    color: 'from-blue-500 to-indigo-500',
    lastSync: '1 hour ago',
    status: 'connected',
  },
  {
    id: 4,
    bank: 'UBA',
    fullName: 'United Bank for Africa',
    accountNumber: '3456789012',
    accountType: 'Savings',
    balance: 145000,
    color: 'from-red-600 to-red-400',
    lastSync: '3 hours ago',
    status: 'connected',
  },
  {
    id: 5,
    bank: 'First Bank',
    fullName: 'First Bank of Nigeria',
    accountNumber: '4567890123',
    accountType: 'Current',
    balance: 55000,
    color: 'from-blue-700 to-blue-500',
    lastSync: 'Yesterday',
    status: 'connected',
  },
];
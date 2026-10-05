import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Store, Zap, Loader2, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { transactionService } from '../services/transactionService';

// ===== CUSTOM TOOLTIP =====
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`px-4 py-3 rounded-xl border backdrop-blur-lg shadow-xl ${
      isDark
        ? 'bg-[#13131a]/95 border-[#1f1f2e] text-white'
        : 'bg-white/95 border-gray-200 text-gray-900'
    }`}>
      <p className="text-xs font-semibold mb-2 opacity-70">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span className="capitalize opacity-70">{entry.name}:</span>
          <span className="font-semibold">
            ₦{entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics({ onReady }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, analyticsData] = await Promise.all([
          transactionService.getStats(),
          transactionService.getAnalytics(),
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
        onReady?.();
      }
    };
    fetchData();
  }, [onReady]);

  // Theme-aware chart colors
  const axisColor = isDark ? '#6b7280' : '#94a3b8';
  const gridColor = isDark ? '#1f1f2e' : '#e2e8f0';

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 max-w-lg mx-auto mt-12">
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-500 mb-1">Failed to load analytics</p>
          <p className="text-xs text-red-500/80">{error}</p>
        </div>
      </div>
    );
  }

  // ===== EMPTY STATE =====
  const hasData = analytics?.monthly_trend?.length > 0;
  if (!hasData) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Analytics</h1>
          <p className="text-secondary text-sm md:text-base">Insights into your spending behaviour</p>
        </motion.div>

        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-blue-500" />
          </div>
          <h3 className="text-base font-semibold text-primary mb-1">No analytics yet</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            Parse some bank alerts to see your spending insights, cash flow trends, and top merchants.
          </p>
        </div>
      </div>
    );
  }

  const totalIncome = stats?.total_income || 0;
  const totalExpenses = stats?.total_expenses || 0;
  const netBalance = stats?.net_balance || 0;
  const totalCategorySpent = analytics.category_breakdown.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Analytics</h1>
        <p className="text-secondary text-sm md:text-base">Insights into your spending behaviour</p>
      </motion.div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted uppercase tracking-wider">Total Income</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">₦{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">Credits received</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">₦{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-red-500 mt-1">Debits made</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap size={16} className="text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {netBalance >= 0 ? '+' : '-'}₦{Math.abs(netBalance).toLocaleString()}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}% savings rate
          </p>
        </motion.div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* CASH FLOW TREND — spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-5 lg:col-span-2"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Income vs Expenses</h2>
            <p className="text-xs text-secondary">Monthly trend</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthly_trend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CATEGORY BREAKDOWN — donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Categories</h2>
            <p className="text-xs text-secondary">Spending breakdown</p>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveCategory(index)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {analytics.category_breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeCategory === null || activeCategory === index ? 1 : 0.4}
                      style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-muted">Total Spent</p>
              <p className="text-lg font-bold text-primary">
                ₦{(totalCategorySpent / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics.category_breakdown.slice(0, 6).map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                <span className="text-secondary truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* MONTHLY BARS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-5 lg:col-span-2"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">Monthly Comparison</h2>
            <p className="text-xs text-secondary">Income vs expenses side by side</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthly_trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  content={<CustomTooltip isDark={isDark} />}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* TOP MERCHANTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Top Merchants</h2>
              <p className="text-xs text-secondary">Where you spent the most</p>
            </div>
            <Store size={18} className="text-muted" />
          </div>

          {analytics.top_merchants.length === 0 ? (
            <p className="text-sm text-secondary text-center py-8">No merchant data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.top_merchants.map((merchant, i) => (
                <motion.div
                  key={merchant.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-primary truncate pr-2">{merchant.name}</p>
                    <p className="text-xs font-semibold text-primary shrink-0">
                      ₦{merchant.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${merchant.percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
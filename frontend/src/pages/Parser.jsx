import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Check,
  Copy,
  AlertCircle,
  Banknote,
  Calendar,
  Hash,
  Wallet,
  User,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  FlaskConical,
} from 'lucide-react';
import { parserService } from '../services/parserService';



const SAMPLE_ALERT = `Dear Customer,
A debit transaction of NGN 50,000.00 occurred on your account.
Account: 0123456789
Date: 15-09-2026 14:30
Description: Transfer to OLAMIDE JOHNSON
Balance: NGN 250,000.00
Thank you for banking with GTB.`;

export default function Parser({ onReady }) {
  // ... state
  
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  // ... rest
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) {
      setError('Please paste a bank alert first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await parserService.parseAlert(input);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to parse alert');
    } finally {
      setLoading(false);
    }
  };

  const handleParseAndSave = async () => {
    if (!input.trim()) {
      setError('Please paste a bank alert first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/transactions/parse-and-save', {
        text: input,
      });
      setResult({
  ...response.data,
  date: response.data.transaction_date || response.data.date,
  balance: response.data.balance_after || response.data.balance,
});;
    } catch (err) {
      setError(err.message || 'Failed to parse and save alert');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_ALERT);
    setError('');
    setResult(null);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  const handleCopyJSON = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAmount = (amount) =>
    amount !== null && amount !== undefined
      ? '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })
      : '—';

  const confidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Parser Playground
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Test the Hybrid Regex-NER engine
            </p>
          </div>
        </div>
        <p className="text-secondary text-sm md:text-base">
          Paste any bank alert email and watch the parser extract structured data in real-time.
        </p>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* INPUT PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Bank Alert Input
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                <FlaskConical size={12} />
                Load Sample
              </button>
              {input && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted hover:bg-hover transition-colors"
                >
                  <RotateCcw size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your bank alert email here..."
            rows={14}
            className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono leading-relaxed"
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-500">{error}</p>
            </motion.div>
          )}

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <button
    onClick={handleParse}
    disabled={loading || !input.trim()}
    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-app bg-elevated text-primary text-sm font-semibold hover:bg-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <>
        <Loader2 size={16} className="animate-spin" />
        Parsing...
      </>
    ) : (
      <>
        <Sparkles size={16} />
        Parse Only
      </>
    )}
  </button>

  <button
    onClick={handleParseAndSave}
    disabled={loading || !input.trim()}
    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <>
        <Loader2 size={16} className="animate-spin" />
        Saving...
      </>
    ) : (
      <>
        <Sparkles size={16} />
        Parse & Save
      </>
    )}
  </button>
</div>
        </motion.div>

        {/* RESULTS PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Extracted Data
            </h2>
            {result && (
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={12} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy JSON
                  </>
                )}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <Sparkles size={24} className="text-blue-500" />
                </div>
                <p className="text-sm text-secondary">No data yet</p>
                <p className="text-xs text-muted mt-1">
                  Paste an alert and click Parse
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 size={28} className="text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-secondary">Extracting entities...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Confidence badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-app">
                  <span className="text-xs font-medium text-secondary">
                    Confidence Score
                  </span>
                  <span className={`text-sm font-bold ${confidenceColor(result.confidence)}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Field cards */}
                <FieldCard
                  icon={Banknote}
                  label="Amount"
                  value={formatAmount(result.amount)}
                  color="from-green-500 to-emerald-400"
                />
                <FieldCard
                  icon={result.transaction_type === 'credit' ? TrendingUp : TrendingDown}
                  label="Transaction Type"
                  value={result.transaction_type?.toUpperCase() || '—'}
                  color={result.transaction_type === 'credit' ? 'from-green-500 to-emerald-400' : 'from-red-500 to-orange-400'}
                />
               <FieldCard
  icon={Calendar}
  label="Date"
  value={
    result.date
      ? new Date(result.date).toLocaleString('en-NG')
      : result.transaction_date
      ? new Date(result.transaction_date).toLocaleString('en-NG')
      : '—'
  }
  color="from-purple-500 to-pink-400"
/>
                <FieldCard
                  icon={Hash}
                  label="Account Number"
                  value={result.account_number || '—'}
                  color="from-blue-500 to-cyan-400"
                />
               <FieldCard
  icon={Wallet}
  label="Balance"
  value={formatAmount(result.balance ?? result.balance_after)}
  color="from-cyan-500 to-blue-400"
/>
                <FieldCard
                  icon={User}
                  label="Merchant"
                  value={result.merchant || '—'}
                  color="from-orange-500 to-red-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ===== FIELD CARD COMPONENT =====
function FieldCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-app hover:border-blue-500/30 transition-colors"
    >
      <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${color} flex items-center justify-center shrink-0`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-sm font-semibold text-primary truncate">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
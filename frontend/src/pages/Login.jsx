import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Shield, TrendingUp, Zap, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthInput from '../components/AuthInput';

const features = [
  { icon: Zap, title: 'Automatic parsing', desc: 'Hybrid Regex-NER engine reads your bank alerts' },
  { icon: TrendingUp, title: 'Real-time insights', desc: 'See spending patterns as they happen' },
  { icon: Shield, title: 'Bank-grade security', desc: 'Your data stays encrypted and private' },
];

const headlineWords = ['Take', 'control', 'of', 'your'];
const accentWord = 'finances';

const wordReveal = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (i) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const featureCard = {
  hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { delay: 0.9 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Mobile form override
const mobileFormOverride = "[&_label]:text-gray-400 lg:[&_label]:text-(--text-secondary) [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-gray-500 lg:[&_input]:bg-(--bg-card) lg:[&_input]:border-(--border) lg:[&_input]:text-(--text-primary) lg:[&_input]:placeholder:text-(--text-muted)";

export default function Login({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-app relative overflow-hidden">

      {/* MOBILE AURORA */}
      <div className="lg:hidden absolute inset-0 bg-[#07070c] overflow-hidden">
        <motion.div
          className="absolute w-125 h-125 rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.55) 0%, rgba(37, 99, 235, 0.15) 35%, transparent 70%)', filter: 'blur(60px)', top: '-15%', left: '-30%' }}
          animate={{ x: [0, 120, 60, 0], y: [0, 100, 200, 0], scale: [1, 1.3, 1.1, 1], opacity: [0.8, 1, 0.9, 0.8] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-137.5 h-137.5 rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.45) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)', filter: 'blur(70px)', top: '30%', right: '-35%' }}
          animate={{ x: [0, -100, -50, 0], y: [0, -80, 120, 0], scale: [1, 1.2, 0.95, 1], opacity: [0.7, 1, 0.8, 0.7] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute w-100 h-100 rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.45) 0%, transparent 65%)', filter: 'blur(70px)', top: '50%', left: '20%' }}
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 60, 0], scale: [1, 1.35, 1, 1], opacity: [0.5, 0.85, 0.6, 0.5] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-112.5 h-112.5 rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.35) 0%, transparent 70%)', filter: 'blur(80px)', bottom: '-20%', right: '10%' }}
          animate={{ x: [0, -80, 40, 0], y: [0, -60, -80, 0], scale: [1, 1.25, 1.1, 1], opacity: [0.6, 0.9, 0.7, 0.6] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, transparent 20%, rgba(0,0,0,0.55) 100%)' }} />
      </div>

      <div className="relative z-10 flex min-h-dvh">

        {/* LEFT PANEL (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#07070c]">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-125 h-125 rounded-full"
              style={{ background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.6) 0%, rgba(37, 99, 235, 0.2) 35%, transparent 70%)', filter: 'blur(60px)', top: '-15%', left: '-20%' }}
              animate={{ x: [0, 200, 100, 0], y: [0, 150, 300, 0], scale: [1, 1.3, 1.1, 1], opacity: [0.8, 1, 0.9, 0.8] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-150 h-150 rounded-full"
              style={{ background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.5) 0%, rgba(6, 182, 212, 0.15) 40%, transparent 70%)', filter: 'blur(70px)', top: '30%', right: '-25%' }}
              animate={{ x: [0, -180, -80, 0], y: [0, -120, 150, 0], scale: [1, 1.2, 0.9, 1], opacity: [0.7, 1, 0.8, 0.7] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.div
              className="absolute w-100 h-100 rounded-full"
              style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.5) 0%, transparent 65%)', filter: 'blur(80px)', top: '25%', left: '30%' }}
              animate={{ x: [0, 120, -60, 0], y: [0, -100, 80, 0], scale: [1, 1.4, 1, 1], opacity: [0.5, 0.9, 0.6, 0.5] }}
              transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute w-112.5 h-112.5 rounded-full"
              style={{ background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.4) 0%, transparent 70%)', filter: 'blur(90px)', bottom: '-20%', right: '15%' }}
              animate={{ x: [0, -120, 60, 0], y: [0, -80, -120, 0], scale: [1, 1.25, 1.1, 1], opacity: [0.6, 0.9, 0.7, 0.6] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%)' }} />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(59, 130, 246, 0.08) 45%, rgba(6, 182, 212, 0.18) 50%, rgba(59, 130, 246, 0.08) 55%, transparent 60%)', width: '60%' }}
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-3xl font-bold gradient-text">FinSight</h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-xs text-gray-400 mt-1">
                Smart Finance Tracking
              </motion.p>
            </motion.div>

            <div className="space-y-10">
              <div>
                <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                  {headlineWords.map((word, i) => (
                    <motion.span key={i} custom={i} variants={wordReveal} initial="hidden" animate="visible" className="inline-block mr-3">
                      {word}
                    </motion.span>
                  ))}
                  <motion.span custom={headlineWords.length} variants={wordReveal} initial="hidden" animate="visible" className="inline-block gradient-text">
                    {accentWord}
                  </motion.span>
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="text-gray-300 text-base leading-relaxed max-w-md"
                >
                  Automatically track every transaction from your bank alerts.
                  No more manual entry. Just connect and let FinSight do the work.
                </motion.p>
              </div>

              <div className="space-y-5">
                {features.map((feature, i) => (
                  <motion.div key={feature.title} custom={i} variants={featureCard} initial="hidden" animate="visible" className="flex items-start gap-3 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-9 h-9 rounded-lg bg-blue-500/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors border border-blue-500/20"
                    >
                      <feature.icon size={16} className="text-blue-400" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-white">{feature.title}</p>
                      <p className="text-xs text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.6 }} className="flex items-center gap-6 text-xs text-gray-500">
              <span>© 2026 FinSight</span>
              <span>•</span>
              <span>Admiralty University Project</span>
            </motion.div>
          </div>
        </div>

        {/* RIGHT PANEL (form) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 min-h-dvh">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:hidden mb-10">
              <h1 className="text-3xl font-bold gradient-text">FinSight</h1>
              <p className="text-xs text-gray-500 mt-1">Smart Finance Tracking</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white lg:text-(--text-primary) mb-2">
                Access your account
              </h2>
              <p className="text-sm text-gray-400 lg:text-(--text-secondary)">
                Sign in to continue tracking your finances
              </p>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-500">{error}</p>
              </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="space-y-5">
              <div className={mobileFormOverride}>
                <AuthInput label="Email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} autoComplete="email" />
              </div>

              <div className={mobileFormOverride}>
                <AuthInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" icon={Lock} autoComplete="current-password" />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-app bg-elevated accent-blue-500 cursor-pointer" />
                  <span className="text-xs text-gray-400 lg:text-(--text-secondary)">Remember me</span>
                </label>
                <button type="button" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</button>
              </div>

              <motion.button
                type="submit" disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (<><Loader2 size={16} className="animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight size={16} /></>)}
              </motion.button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10 lg:border-(--border)" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#07070c] lg:bg-(--bg) px-3 text-gray-500 lg:text-(--text-muted)">or continue with</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 lg:border-(--border) lg:bg-(--bg-elevated) lg:hover:bg-(--bg-hover) transition-colors text-sm text-white lg:text-(--text-primary) font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 lg:border-(--border) lg:bg-(--bg-elevated) lg:hover:bg-(--bg-hover) transition-colors text-sm text-white lg:text-(--text-primary) font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </motion.button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="text-center text-sm text-gray-400 lg:text-(--text-secondary) mt-8">
              Don't have an account?{' '}
              <button type="button" onClick={onSwitchToSignup} className="text-blue-500 font-medium hover:text-blue-400 transition-colors">
                Sign up
              </button>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
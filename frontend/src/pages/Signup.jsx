import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Shield, Zap, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthInput from '../components/AuthInput';

const features = [
  { icon: Check, title: 'Free forever', desc: 'No credit card required to start' },
  { icon: Zap, title: 'Setup in 2 minutes', desc: 'Connect your email and you\'re done' },
  { icon: Shield, title: 'Your data, secured', desc: 'We never store your email password' },
];

const headlineWords = ['Start', 'tracking'];
const accentWord = 'smarter';

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

const mobileFormOverride = "[&_label]:text-gray-400 lg:[&_label]:text-(--text-secondary) [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-gray-500 lg:[&_input]:bg-(--bg-card) lg:[&_input]:border-(--border) lg:[&_input]:text-(--text-primary) lg:[&_input]:placeholder:text-(--text-muted)";

export default function Signup({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { color: 'red', text: 'Too short' };
    if (password.length < 10) return { color: 'yellow', text: 'Fair' };
    return { color: 'green', text: 'Strong' };
  };

  const strength = getPasswordStrength();

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

        {/* LEFT PANEL */}
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
                  Join thousands of Nigerians using FinSight to understand their spending without stress.
                </motion.p>
              </div>

              <div className="space-y-5">
                {features.map((feature, i) => (
                  <motion.div key={feature.title} custom={i} variants={featureCard} initial="hidden" animate="visible" className="flex items-start gap-3 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-9 h-9 rounded-lg bg-green-500/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-green-500/25 transition-colors border border-green-500/20"
                    >
                      <feature.icon size={16} className="text-green-400" />
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

        {/* RIGHT PANEL */}
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
                Create your account
              </h2>
              <p className="text-sm text-gray-400 lg:text-(--text-secondary)">
                Start tracking your finances in minutes
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
                <AuthInput label="Full name" name="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Valentine Obishai" icon={User} autoComplete="name" />
              </div>

              <div className={mobileFormOverride}>
                <AuthInput label="Email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} autoComplete="email" />
              </div>

              <div className={mobileFormOverride}>
                <AuthInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" icon={Lock} autoComplete="new-password" />
                {strength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/10 lg:bg-(--bg-hover) overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.color === 'red' ? 'bg-red-500 w-1/3' :
                          strength.color === 'yellow' ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${
                      strength.color === 'red' ? 'text-red-500' :
                      strength.color === 'yellow' ? 'text-yellow-500' : 'text-green-500'
                    }`}>{strength.text}</span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-app bg-elevated accent-blue-500 cursor-pointer" />
                <span className="text-xs text-gray-400 lg:text-(--text-secondary)">
                  I agree to the{' '}
                  <span className="text-blue-500 hover:text-blue-400 cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-blue-500 hover:text-blue-400 cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              <motion.button
                type="submit" disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (<><Loader2 size={16} className="animate-spin" />Creating account...</>) : (<>Create Account<ArrowRight size={16} /></>)}
              </motion.button>
            </motion.form>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="text-center text-sm text-gray-400 lg:text-(--text-secondary) mt-8">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-blue-500 font-medium hover:text-blue-400 transition-colors">
                Sign in
              </button>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
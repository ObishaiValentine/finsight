import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const previews = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    desktop: '/landing/dashboard-preview.png',
  },
];

const trustIndicators = [
  { icon: Zap, label: 'Auto-parse alerts' },
  { icon: Shield, label: 'Bank-grade security' },
  { icon: TrendingUp, label: 'Real-time insights' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero({ onNavigateToAuth, onGoToApp }) {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasMultiple = previews.length > 1;
  const current = previews[activeIndex];

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasMultiple, isPaused]);

  return (
    <section className={`relative min-h-screen flex items-center pt-24 md:pt-32 pb-16 overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
    }`}>
      {/* Background Accent (Reduced for Mobile Performance) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-150 h-150 rounded-full opacity-50 md:opacity-100"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)', top: '-10%', left: '-15%',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.div variants={itemVariants} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <Sparkles size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Built for Nigerian bank customers</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Automated Personal <span className="gradient-text">Finance Tracking.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              FinSight reads your bank alert emails, extracts every transaction, and gives you one clean dashboard across all your banks. No manual entry. No open banking. No stress.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              {isAuthenticated ? (
                <button onClick={onGoToApp} className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
                  Go to Dashboard <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button onClick={() => onNavigateToAuth('signup')} className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
                    Get Started Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button onClick={() => onNavigateToAuth('login')} className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm border ${isDark ? 'border-white/12 bg-white/3 text-white hover:bg-white/6' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'}`}>
                    Start Tracking
                  </button>
                </>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              {trustIndicators.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                    <item.icon size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Desktop Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-3xl blur-3xl -z-10" />
            <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${isDark ? 'glass border-white/8 shadow-blue-500/10' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-white/6 bg-white/2' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className={`flex-1 mx-4 h-6 rounded-md flex items-center justify-center ${isDark ? 'bg-white/4' : 'bg-slate-200/60'}`}>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>finsight-ng.vercel.app</span>
                </div>
              </div>
              <div className="aspect-video bg-linear-to-br from-blue-500/10 to-cyan-400/5 relative overflow-hidden">
                <img src={current.desktop} alt="FinSight Dashboard" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Scroll Indicator (Now visible on all screens) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-px h-8 bg-linear-to-b to-transparent ${isDark ? 'from-gray-600' : 'from-slate-400'}`}
          />
        </motion.div>
      </div>
    </section>
  );
}
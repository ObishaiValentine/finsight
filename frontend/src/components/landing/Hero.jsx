import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp,} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

// ============================================================
// PREVIEWS — Add more screenshots here as they become available
// These become the stacked cards behind the main desktop view
// ============================================================
const previews = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    desktop: '/landing/dashboard-preview.png',
  },
  // Add more like:
  { id: 'analytics', label: 'Analytics', desktop: '/landing/Analytics.png' },
  { id: 'account', label: 'Account', desktop: '/landing/Account.png' },
  // { id: 'parser', label: 'Parser', desktop: '/landing/parser-preview.png' },
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

  // Auto-rotate every 5s if multiple previews exist
  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasMultiple, isPaused]);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % previews.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + previews.length) % previews.length);

  return (
    <section className={`relative min-h-screen flex items-center pt-24 md:pt-32 pb-16 overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
    }`}>

      {/* AURORA BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0.1) 35%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 35%, transparent 70%)',
            filter: 'blur(60px)', top: '-10%', left: '-15%',
          }}
          animate={{ x: [0, 100, 50, 0], y: [0, 80, 150, 0], scale: [1, 1.2, 1.05, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-175 h-175 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 65%)'
              : 'radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, transparent 65%)',
            filter: 'blur(70px)', top: '20%', right: '-20%',
          }}
          animate={{ x: [0, -120, -60, 0], y: [0, -80, 100, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute w-125 h-125 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, transparent 65%)'
              : 'radial-gradient(circle at center, rgba(139, 92, 246, 0.12) 0%, transparent 65%)',
            filter: 'blur(80px)', bottom: '-10%', left: '30%',
          }}
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 60, 0], scale: [1, 1.3, 1, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className={`absolute inset-0 ${isDark ? 'opacity-30' : 'opacity-20'}`}
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
          animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div
              variants={itemVariants}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 ${
                isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <Sparkles size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Built for Nigerian bank customers
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Automated Personal{' '}
              <span className="gradient-text">Finance Tracking.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}
            >
              FinSight reads your bank alert emails, extracts every transaction, and gives you one clean dashboard across all your banks. No manual entry. No open banking. No stress.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10"
            >
              {isAuthenticated ? (
                <button
                  onClick={onGoToApp}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                >
                  Go to Dashboard
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigateToAuth('signup')}
                    className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                  >
                    Get Started Free
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => onNavigateToAuth('login')}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm border ${
                      isDark
                        ? 'border-white/12 bg-white/3 text-white hover:bg-white/6'
                        : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Start Tracking
                  </button>
                </>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3"
            >
              {trustIndicators.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    isDark ? 'bg-blue-500/10' : 'bg-blue-100'
                  }`}>
                    <item.icon size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Stacked preview showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block pt-14 pl-14 pb-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-3xl blur-3xl -z-10" />

            {/* STACKED CARDS LAYER — render in reverse so active is on top */}
            <div className="relative" style={{ perspective: '1200px' }}>
              {previews.map((preview, i) => {
                const pos = (i - activeIndex + previews.length) % previews.length;
                const isActive = pos === 0;
                const isSecond = pos === 1;
                const isThird = pos === 2;
                const isHidden = pos >= 3 && previews.length > 3;

                return (
                  <motion.div
                    key={preview.id}
                    onClick={() => !isActive && setActiveIndex(i)}
                    initial={false}
                    animate={{
                      x: isActive ? 0 : isSecond ? -28 : isThird ? -56 : -84,
                      y: isActive ? 0 : isSecond ? -28 : isThird ? -56 : -84,
                      rotate: isActive ? 0 : isSecond ? -2.5 : isThird ? -5 : -7.5,
                      scale: isActive ? 1 : isSecond ? 0.96 : isThird ? 0.92 : 0.88,
                      opacity: isHidden ? 0 : isActive ? 1 : isSecond ? 1 : isThird ? 1 : 1,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ zIndex: 30 - pos * 10, cursor: isActive ? 'default' : 'pointer' }}
                    className={isActive ? '' : 'absolute top-0 left-0 w-full'}
                  >
                    {/* Browser mockup */}
                    <div className={`rounded-2xl overflow-hidden border shadow-2xl ${
                      isDark
                        ? 'glass border-white/8 shadow-blue-500/10'
                        : 'bg-white border-slate-200 shadow-slate-400/30'
                    }`}>
                      {/* Browser chrome */}
                      <div className={`flex items-center gap-2 px-4 py-3 border-b ${
                        isDark ? 'border-white/6 bg-white/2' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                        <div className="flex-1 mx-4">
                          <div className={`h-6 rounded-md flex items-center justify-center ${
                            isDark ? 'bg-white/4' : 'bg-slate-200/60'
                          }`}>
                            <span className={`text-[10px] font-mono ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                              finsight-ng.vercel.app/{preview.id === 'dashboard' ? '' : preview.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Preview image */}
                      <div className="aspect-video bg-linear-to-br from-blue-500/10 to-cyan-400/5 relative overflow-hidden">
                        <img
                          src={preview.desktop}
                          alt={`FinSight ${preview.label}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Hover controls — only show if multiple previews */}
                        {hasMultiple && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-0 top-0 bottom-0 w-1/4 z-40 cursor-w-resize opacity-0"
                  aria-label="Previous preview"
                />
                <button
                  onClick={goNext}
                  className="absolute right-0 top-0 bottom-0 w-1/4 z-40 cursor-e-resize opacity-0"
                  aria-label="Next preview"
                />
              </>
            )}

            {/* Dot indicators — only if multiple previews */}
            {hasMultiple && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
                {previews.map((preview, i) => (
                  <button
                    key={preview.id}
                    onClick={() => setActiveIndex(i)}
                    className={`transition-all rounded-full ${
                      i === activeIndex
                        ? 'w-6 h-2 bg-linear-to-r from-blue-500 to-cyan-400'
                        : `w-2 h-2 ${isDark ? 'bg-white/20 hover:bg-white/40' : 'bg-slate-300 hover:bg-slate-400'}`
                    }`}
                    aria-label={`Go to ${preview.label}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${
            isDark ? 'text-gray-600' : 'text-slate-400'
          }`}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-px h-8 bg-linear-to-b to-transparent ${
              isDark ? 'from-gray-600' : 'from-slate-400'
            }`}
          />
        </motion.div>
      </div>
    </section>
  );
}
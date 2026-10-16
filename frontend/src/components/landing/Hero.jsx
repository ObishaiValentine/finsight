import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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

  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-32 pb-16 overflow-hidden bg-[#0a0a0f]">

      {/* AURORA BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0.1) 35%, transparent 70%)',
            filter: 'blur(60px)', top: '-10%', left: '-15%',
          }}
          animate={{ x: [0, 100, 50, 0], y: [0, 80, 150, 0], scale: [1, 1.2, 1.05, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-175 h-175 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 65%)',
            filter: 'blur(70px)', top: '20%', right: '-20%',
          }}
          animate={{ x: [0, -120, -60, 0], y: [0, -80, 100, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute w-125 h-125 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, transparent 65%)',
            filter: 'blur(80px)', bottom: '-10%', left: '30%',
          }}
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 60, 0], scale: [1, 1.3, 1, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
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
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-xs font-medium text-blue-300">
                Built for Nigerian bank customers
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Automated Personal{' '}
              <span className="gradient-text">Finance Tracking.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
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
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/12 bg-white/3 text-white text-sm font-semibold hover:bg-white/6 transition-colors backdrop-blur-sm"
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
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                    <item.icon size={12} className="text-blue-400" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-400/10 rounded-3xl blur-3xl -z-10" />

            <div className="relative glass rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-blue-500/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-white/2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-md bg-white/4 flex items-center justify-center">
                    <span className="text-[10px] text-gray-500 font-mono">finsight-ng.vercel.app</span>
                  </div>
                </div>
              </div>

              <div className="aspect-video bg-linear-to-br from-blue-500/10 to-cyan-400/5 flex items-center justify-center">
                <img
                  src="/landing/dashboard-preview.png"
                  alt="FinSight Dashboard"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-8 -left-8 w-40 xl:w-48 rounded-3xl overflow-hidden border-4 border-[#1a1a24] shadow-2xl bg-linear-to-br from-blue-500/20 to-cyan-400/10 aspect-9/19"
            >
              <img
                src="/landing/mobile-mockup.png"
                alt="FinSight Mobile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-linear-to-b from-gray-600 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
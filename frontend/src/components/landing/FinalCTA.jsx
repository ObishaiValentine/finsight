import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function FinalCTA({ onNavigateToAuth }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      ref={sectionRef}
      className={`relative py-24 md:py-32 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      }`}
    >
      {/* Background Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-200 h-200 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 60%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, transparent 60%)',
            filter: 'blur(100px)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 shadow-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
          }`}>
            <Sparkles size={28} className="text-blue-500" />
          </div>

          <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Ready to take control of <br className="hidden sm:block" />
            <span className="gradient-text">your finances?</span>
          </h2>
          
          <p className={`text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            Join thousands of Nigerians who have ditched the spreadsheets and manual entry. 
            Let FinSight do the heavy lifting for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-base font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold transition-colors backdrop-blur-sm border flex items-center justify-center ${
                isDark
                  ? 'border-white/12 bg-white/3 text-white hover:bg-white/6'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              Log in to your account
            </button>
          </div>
          
          <p className={`text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
            Free forever plan available. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
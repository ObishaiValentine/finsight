import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingNav({ onGoToApp, onNavigateToAuth }) {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/6'
            : 'bg-white/80 backdrop-blur-xl border-b border-slate-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 shrink-0"
          >
            <h1 className="text-xl md:text-2xl font-bold gradient-text">FinSight</h1>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/4'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <button
                onClick={onGoToApp}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
              >
                Dashboard
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToAuth('login')}
                  className={`hidden sm:block px-4 py-2 text-sm font-medium transition-colors ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log in
                </button>
                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                >
                  Get Started Free
                </button>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 transition-colors ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden overflow-hidden border-t ${
              isDark
                ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-white/6'
                : 'bg-white/95 backdrop-blur-xl border-slate-200'
            }`}
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-white hover:bg-white/4'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-white/6' : 'border-slate-200'}`}>
                <div className="flex justify-end">
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileOpen(false); onGoToApp(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold"
                  >
                    Dashboard
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); onNavigateToAuth('login'); }}
                      className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        isDark
                          ? 'border-white/10 text-white hover:bg-white/4'
                          : 'border-slate-300 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); onNavigateToAuth('signup'); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold"
                    >
                      Get Started Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
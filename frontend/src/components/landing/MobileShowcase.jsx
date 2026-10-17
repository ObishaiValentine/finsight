import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Bell, Zap, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const bullets = [
  { icon: Zap, title: 'Real-time sync', desc: 'Transactions land on your phone the moment they happen.' },
  { icon: Bell, title: 'Smart alerts', desc: 'Get notified when a new transaction is parsed.' },
  { icon: CheckCircle2, title: 'Full dashboard', desc: 'Every feature — accounts, analytics, transactions — on mobile.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MobileShowcase() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      ref={sectionRef}
      className={`relative py-20 md:py-28 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      }`}
    >
      {/* Soft accent background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-125 h-125 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)', top: '20%', right: '10%',
          }}
          animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="order-2 lg:order-1"
          >
            <motion.span
              variants={itemVariants}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 ${
                isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <Smartphone size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Works everywhere
              </span>
            </motion.span>

            <motion.h2
              variants={itemVariants}
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Your money, in your pocket.{' '}
              <span className="gradient-text">Anywhere.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className={`text-base md:text-lg leading-relaxed mb-8 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}
            >
              FinSight is fully responsive. Whether you're on your laptop reviewing monthly
              trends or on your phone checking a recent transaction — everything is designed
              to feel fast, clean, and beautiful.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-4">
              {bullets.map((bullet, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <bullet.icon size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {bullet.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>
                      {bullet.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Phone mockup in full display — NO backgrounds, masks, or blend modes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 relative flex justify-center"
          >
            {/* Glow behind phones (subtle backdrop) */}
            <div className={`absolute inset-0 rounded-full blur-3xl ${
              isDark ? 'bg-blue-500/15' : 'bg-blue-500/10'
            }`} />

            {/* Phone mockup image — full display */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-md lg:max-w-lg"
            >
              <img
                src="/landing/Phone-mockup.png"
                alt="FinSight on mobile — Dashboard, Analytics, and Accounts views"
                className="w-full h-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
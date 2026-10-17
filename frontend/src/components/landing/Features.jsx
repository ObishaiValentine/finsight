import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Building2, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ============================================================
// CONTENT DATA
// ============================================================

const features = [
  {
    id: 'parse',
    icon: Mail,
    tag: 'Auto-Parse Alerts',
    title: 'Every bank alert, read automatically.',
    description: [
      'FinSight uses a Hybrid Regex-NER engine to extract transaction details from your bank alert emails — amount, merchant, date, balance, and account number. The structured fields are captured by deterministic regex patterns; the variable narrative fields are handled by a Named Entity Recognition model.',
      'No more copying transactions into spreadsheets. Connect your Gmail once, and FinSight does the rest — parsing every alert as it lands, with a confidence score for transparency.',
    ],
    image: '/landing/feature-parse.jpg',
    imageAlt: 'Bank alert parsing illustration',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'banks',
    icon: Building2,
    tag: 'Multi-Bank Aggregation',
    title: 'One dashboard. All your banks.',
    description: [
      'GTB, Zenith, Access, UBA, First Bank, Carbon, OPay, PalmPay, Kuda, and more — FinSight reads alerts from every major Nigerian bank and fintech and unifies them into a single, clean dashboard.',
      'See your total balance across all accounts, track money moving between banks, and understand your complete financial picture without logging into a dozen apps.',
    ],
    image: '/landing/feature-banks.jpg',
    imageAlt: 'Multi-bank aggregation illustration',
    accent: 'from-purple-500 to-blue-400',
  },
  {
    id: 'insights',
    icon: TrendingUp,
    tag: 'Real-Time Insights',
    title: 'Understand your money as it moves.',
    description: [
      'Watch your income, expenses, and net cash flow update in real time. FinSight categorizes every transaction automatically and surfaces spending patterns, top merchants, and monthly trends through beautiful, interactive charts.',
      'Auto-sync runs quietly in the background, so the moment a transaction lands, your dashboard, analytics, and transaction history all update together — no refresh needed.',
    ],
    image: '/landing/feature-insights.jpg',
    imageAlt: 'Real-time insights illustration',
    accent: 'from-cyan-500 to-blue-400',
  },
  {
    id: 'security',
    icon: ShieldCheck,
    tag: 'Bank-Grade Security',
    title: 'Your data stays yours. Always.',
    description: [
      'FinSight uses Google OAuth 2.0 — we never see your password. Every database table is protected by Row-Level Security, ensuring your financial data is invisible to every other user, at the database level.',
      'Your bank alert emails are read-only. We never modify, delete, or forward anything. And because everything runs over HTTPS with encrypted tokens, your financial information stays private and secure.',
    ],
    image: '/landing/feature-security.jpg',
    imageAlt: 'Security illustration',
    accent: 'from-blue-600 to-cyan-500',
  },
];

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const headerVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants = (reverse) => ({
  hidden: { opacity: 0, x: reverse ? 60 : -60, scale: 0.95 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
});

const textVariants = (reverse) => ({
  hidden: { opacity: 0, x: reverse ? -40 : 40 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
});

// ============================================================
// COMPONENT
// ============================================================

export default function Features() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="features"
      className={`relative py-20 md:py-32 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      }`}
    >
      {/* BACKGROUND ACCENT */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)', top: '20%', left: '-20%',
          }}
          animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-125 h-125 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(6, 182, 212, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)', bottom: '10%', right: '-15%',
          }}
          animate={{ x: [0, -60, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          className="text-center max-w-3xl mx-auto mb-20 md:mb-28"
        >
          <span className={`inline-block text-xs uppercase tracking-[0.2em] font-semibold mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Features
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Everything you need to{' '}
            <span className="gradient-text">see your money clearly.</span>
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            FinSight combines a powerful hybrid parser, multi-bank aggregation, real-time analytics,
            and bank-grade security into one clean, zero-cost platform — built for how Nigerians actually bank.
          </p>
        </motion.div>

        {/* FEATURE ROWS */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, i) => {
            const reverse = i % 2 === 1;
            return (
              <FeatureRow key={feature.id} feature={feature} reverse={reverse} isDark={isDark} />
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// SINGLE FEATURE ROW
// ============================================================

function FeatureRow({ feature, reverse, isDark }) {
  const rowRef = useRef(null);
  const rowInView = useInView(rowRef, { once: true, margin: '-100px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={rowRef}
      variants={rowVariants}
      initial="hidden"
      animate={rowInView ? 'visible' : 'hidden'}
      className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
    >
      {/* IMAGE */}
      <motion.div
        variants={imageVariants(reverse)}
        initial="hidden"
        animate={rowInView ? 'visible' : 'hidden'}
        className={`relative order-1 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}
      >
        <div className={`absolute inset-0 bg-linear-to-br ${feature.accent} opacity-15 rounded-3xl blur-3xl -z-10`} />
        <div className={`relative rounded-2xl overflow-hidden border backdrop-blur-sm ${
          isDark ? 'border-white/8 bg-white/2' : 'border-slate-200 bg-white shadow-lg shadow-slate-200/40'
        }`}>
          <img
            src={feature.image}
            alt={feature.imageAlt}
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </motion.div>

      {/* TEXT */}
      <motion.div
        variants={textVariants(reverse)}
        initial="hidden"
        animate={rowInView ? 'visible' : 'hidden'}
        className={`order-2 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${feature.accent} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {feature.tag}
          </span>
        </div>

        <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-5 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {feature.title}
        </h3>

        <div className="space-y-4">
          {feature.description.map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-sm md:text-base leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={rowInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={`mt-7 flex items-center gap-2 text-sm font-medium ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          <span>Learn more</span>
          <ArrowRight size={14} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
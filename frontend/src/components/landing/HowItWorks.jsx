import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Cpu, LineChart, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const steps = [
  {
    number: '01',
    icon: Mail,
    title: 'Connect your Gmail',
    description: 'Securely link your email using Google OAuth 2.0. We never see your password, and we only request read-only access to your bank alerts.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Auto-parse alerts',
    description: 'Our Hybrid Regex-NER engine instantly reads incoming bank alerts, extracting the amount, date, merchant, and balance with high precision.',
    color: 'from-purple-500 to-blue-400',
  },
  {
    number: '03',
    icon: LineChart,
    title: 'Track & analyze',
    description: 'Watch your dashboard update in real-time. Every transaction is categorized automatically, giving you clear insights into your spending habits.',
    color: 'from-cyan-500 to-emerald-400',
  },
];

const headerVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`relative py-20 md:py-32 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-white'
      }`}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            filter: 'blur(90px)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <span className={`inline-block text-xs uppercase tracking-[0.2em] font-semibold mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            How It Works
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            From inbox to insight <br className="hidden sm:block" />
            <span className="gradient-text">in three simple steps.</span>
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            FinSight removes the friction of manual data entry. Once you connect your email, 
            the system works quietly in the background to keep your financial data up to date.
          </p>
        </motion.div>

        {/* STEPS GRID */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-12 relative">
          
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 -z-10">
            <div className={`w-full h-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            {inView && (
              <motion.div 
                className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
              />
            )}
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Number Badge */}
              <div className={`absolute top-0 right-1/2 translate-x-17.5 -translate-y-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-colors ${
                isDark 
                  ? 'bg-[#0a0a0f] border-white/10 text-gray-400 group-hover:border-blue-500 group-hover:text-blue-400' 
                  : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600'
              }`}>
                {step.number}
              </div>

              {/* Icon Circle */}
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-transform duration-300 group-hover:-translate-y-2 ${
                isDark 
                  ? 'bg-[#13131a] border border-white/5 shadow-black/50' 
                  : 'bg-white border border-slate-100 shadow-slate-200/50'
              }`}>
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-inner`}>
                  <step.icon size={26} className="text-white" />
                </div>
              </div>

              {/* Copy */}
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed max-w-xs ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            Ready to try it? Get started free
            <ArrowRight size={16} />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
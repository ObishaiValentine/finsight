import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const faqs = [
  {
    question: 'How does FinSight read my bank alerts?',
    answer: 'FinSight uses a Hybrid Regex-NER engine that we built specifically for Nigerian banks. It connects to your Gmail via Google OAuth, securely fetches your bank alert emails, and extracts the transaction details (amount, date, merchant, balance) automatically.'
  },
  {
    question: 'Is my financial data safe?',
    answer: 'Yes. We take security seriously. We use Google OAuth 2.0, meaning we never see or store your email password. Your data is stored in a secure database with Row-Level Security (RLS), meaning only you can see your transactions. We also never modify or delete your emails.'
  },
  {
    question: 'Which banks are supported?',
    answer: 'FinSight currently supports alerts from GTB, Zenith, Access, UBA, First Bank, Carbon, OPay, PalmPay, Kuda, Moniepoint, Fidelity, and Stanbic IBTC. We are constantly adding support for more banks and fintechs.'
  },
  {
    question: 'Do I need to manually enter my transactions?',
    answer: 'No. Once you connect your Gmail and add your bank accounts on FinSight, the system does the rest. It syncs automatically in the background every couple of minutes while you are active, so your dashboard stays up to date without manual entry.'
  },
  {
    question: 'Do I need an Open Banking API to use this?',
    answer: 'No. FinSight was built specifically to work around the limitations of open banking in Nigeria. By using the email alerts your bank already sends you, we can give you a unified dashboard without needing direct API access from the banks.'
  },
  {
    question: 'Is FinSight free?',
    answer: 'Yes, the Starter tier is completely free forever. It includes 1 Gmail account, up to 5 bank connections, and basic analytics. You can upgrade to Premium later if you need advanced features like unlimited banks and PDF exports.'
  }
];

const headerVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FAQ() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className={`relative py-20 md:py-32 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-white'
      }`}
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <span className={`inline-block text-xs uppercase tracking-[0.2em] font-semibold mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            FAQ
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Frequently asked <span className="gradient-text">questions.</span>
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            Everything you need to know about FinSight and how it handles your data.
          </p>
        </motion.div>

        {/* FAQ LIST */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isOpen
                    ? isDark
                      ? 'bg-white/4 border-white/15'
                      : 'bg-slate-50 border-slate-300'
                    : isDark
                      ? 'bg-transparent border-white/8 hover:border-white/20'
                      : 'bg-transparent border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-4 pr-4">
                    <MessageCircleQuestion size={20} className={isOpen ? 'text-blue-500' : isDark ? 'text-gray-500' : 'text-slate-400'} />
                    <span className={`text-base font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={`shrink-0 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className={`px-6 pb-6 pt-0 pl-15 text-sm leading-relaxed ${
                        isDark ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
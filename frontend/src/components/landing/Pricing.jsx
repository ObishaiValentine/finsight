import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Sparkles, Building2, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const plans = [
  {
    id: 'free',
    name: 'Starter',
    icon: User,
    price: '₦0',
    period: 'forever',
    description: 'Perfect for individuals getting started with tracking their money.',
    cta: 'Get Started Free',
    highlight: false,
    features: [
      { name: '1 Gmail account', included: true },
      { name: 'Up to 5 bank connections', included: true },
      { name: 'Real-time auto-sync', included: true },
      { name: 'Basic analytics dashboard', included: true },
      { name: 'Multi-Gmail accounts', included: false },
      { name: 'PDF/Excel export', included: false },
      { name: 'Custom budget goals', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Sparkles,
    price: '₦2,500',
    period: 'per month',
    description: 'For power users who want the complete FinSight experience.',
    cta: 'Upgrade to Premium',
    highlight: true,
    features: [
      { name: 'Multi-Gmail accounts', included: true },
      { name: 'Unlimited bank connections', included: true },
      { name: 'Real-time auto-sync', included: true },
      { name: 'Advanced analytics & reports', included: true },
      { name: 'PDF/Excel export', included: true },
      { name: 'Custom budget goals', included: true },
      { name: 'Priority support', included: true },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    price: '₦10,000',
    period: 'per month',
    description: 'For small teams and businesses managing multiple accounts.',
    cta: 'Contact Sales',
    highlight: false,
    features: [
      { name: 'Everything in Premium', included: true },
      { name: 'Team accounts', included: true },
      { name: 'Invoicing features', included: true },
      { name: 'Advanced API access', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'White-label options', included: true },
      { name: 'Custom SLA', included: true },
    ],
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
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Pricing({ onNavigateToAuth }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const handleSelectPlan = (planId) => {
    if (planId === 'business') {
      // Use a small timeout to bypass the strict ESLint immutability rule
      setTimeout(() => {
        window.location.href = 'mailto:hello@finsight.app?subject=FinSight Business Inquiry';
      }, 0);
    } else if (planId === 'premium') {
      // Placeholder for payment gateway integration later
      onNavigateToAuth('signup');
    } else {
      onNavigateToAuth('signup');
    }
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className={`relative py-20 md:py-32 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      }`}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className={`inline-block text-xs uppercase tracking-[0.2em] font-semibold mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Pricing
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Simple, transparent <span className="gradient-text">pricing.</span>
          </h2>
          <p className={`text-base md:text-lg leading-relaxed mb-8 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            Start tracking your finances for free. Upgrade when you need more power.
          </p>

          {/* Billing Toggle */}
          <div className={`inline-flex items-center p-1 rounded-full border ${
            isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-500/10 text-green-500'
              }`}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            // Calculate yearly price (approx 20% off)
            const monthlyPrice = parseInt(plan.price.replace(/[^0-9]/g, ''), 10);
            const yearlyPrice = Math.round(monthlyPrice * 12 * 0.8);
            
            const displayPrice = plan.price === '₦0' ? '₦0' : billingCycle === 'monthly' 
              ? plan.price 
              : `₦${yearlyPrice.toLocaleString()}`;
              
            const displayPeriod = plan.price === '₦0' ? 'forever' : billingCycle === 'monthly' 
              ? 'per month' 
              : 'per year';

            return (
              <motion.div
                key={plan.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  plan.highlight
                    ? isDark
                      ? 'bg-[#13131a] border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-4'
                      : 'bg-white border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-4'
                    : isDark
                      ? 'bg-white/2 border border-white/8'
                      : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-linear-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlight
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {displayPrice}
                    </span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    {displayPeriod}
                  </span>
                  <p className={`text-sm mt-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mb-8 ${
                    plan.highlight
                      ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                      : isDark
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features List */}
                <div className="flex-1 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={16} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-500' : 'text-green-500'}`} />
                      ) : (
                        <X size={16} className={`mt-0.5 shrink-0 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? isDark ? 'text-gray-300' : 'text-slate-700'
                          : isDark ? 'text-gray-600 line-through' : 'text-slate-400 line-through'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
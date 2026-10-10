import { motion } from 'framer-motion';

// Bank brand configurations — logos + fallback colors
import gtbLogo from '../assets/bank-logos/gtb.svg';
import zenithLogo from '../assets/bank-logos/zenith.svg';
import accessLogo from '../assets/bank-logos/access.svg';
import ubaLogo from '../assets/bank-logos/uba.svg';
import firstbankLogo from '../assets/bank-logos/firstbank.svg';
import fidelityLogo from '../assets/bank-logos/fidelity.svg';
import stanbicLogo from '../assets/bank-logos/stanbic.svg';
import sterlingLogo from '../assets/bank-logos/sterling.png';
import wemaLogo from '../assets/bank-logos/wema.svg';
import carbonLogo from '../assets/bank-logos/carbon.png';
import opayLogo from '../assets/bank-logos/opay.svg';
import kudaLogo from '../assets/bank-logos/kuda.png';
import moniepointLogo from '../assets/bank-logos/moniepoint.png';
import palmpayLogo from '../assets/bank-logos/palmpay.png';

const BANK_CONFIG = {
  GTB: {
    logo: gtbLogo,
    initials: 'GT',
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    ringColor: 'ring-orange-400/40',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    isPng: false,
  },
  Zenith: {
    logo: zenithLogo,
    initials: 'Z',
    gradient: 'from-red-500 via-red-600 to-red-700',
    ringColor: 'ring-red-500/40',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    isPng: false,
  },
  Access: {
    logo: accessLogo,
    initials: 'A',
    gradient: 'from-orange-500 via-orange-600 to-amber-600',
    ringColor: 'ring-orange-500/40',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    isPng: false,
  },
  UBA: {
    logo: ubaLogo,
    initials: 'UBA',
    gradient: 'from-red-500 via-red-600 to-red-800',
    ringColor: 'ring-red-600/40',
    glowColor: 'rgba(185, 28, 28, 0.4)',
    isPng: false,
  },
  'First Bank': {
    logo: firstbankLogo,
    initials: 'FB',
    gradient: 'from-blue-700 via-blue-800 to-indigo-900',
    ringColor: 'ring-blue-700/40',
    glowColor: 'rgba(29, 78, 216, 0.4)',
    isPng: false,
  },
  Fidelity: {
    logo: fidelityLogo,
    initials: 'FD',
    gradient: 'from-green-500 via-green-600 to-blue-700',
    ringColor: 'ring-green-500/40',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    isPng: false,
  },
  'Stanbic IBTC': {
    logo: stanbicLogo,
    initials: 'SI',
    gradient: 'from-blue-800 via-blue-900 to-slate-900',
    ringColor: 'ring-blue-800/40',
    glowColor: 'rgba(30, 64, 175, 0.4)',
    isPng: false,
  },
  Sterling: {
    logo: sterlingLogo,
    initials: 'ST',
    gradient: 'from-red-500 via-red-600 to-red-700',
    ringColor: 'ring-red-500/40',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    isPng: true,
  },
  Wema: {
    logo: wemaLogo,
    initials: 'WM',
    gradient: 'from-purple-500 via-purple-600 to-fuchsia-700',
    ringColor: 'ring-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    isPng: false,
  },
  Carbon: {
    logo: carbonLogo,
    initials: 'CB',
    gradient: 'from-purple-500 via-violet-600 to-indigo-700',
    ringColor: 'ring-purple-500/40',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    isPng: true,
  },
  OPay: {
    logo: opayLogo,
    initials: 'OP',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    ringColor: 'ring-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    isPng: false,
  },
  Kuda: {
    logo: kudaLogo,
    initials: 'KD',
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    ringColor: 'ring-violet-600/40',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    isPng: true,
  },
  Moniepoint: {
    logo: moniepointLogo,
    initials: 'MP',
    gradient: 'from-blue-500 via-blue-600 to-indigo-700',
    ringColor: 'ring-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    isPng: true,
  },
  PalmPay: {
    logo: palmpayLogo,
    initials: 'PP',
    gradient: 'from-purple-500 via-purple-600 to-violet-700',
    ringColor: 'ring-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    isPng: true,
  },
  default: {
    logo: null,
    initials: 'BK',
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    ringColor: 'ring-slate-500/40',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    isPng: false,
  },
};

// Normalize bank name to match config keys
function normalizeBankName(bankName) {
  if (!bankName) return 'default';

  const normalized = bankName.trim();

  // Direct match
  if (BANK_CONFIG[normalized]) return normalized;

  // Fuzzy matches
  const lower = normalized.toLowerCase();

  if (lower.includes('gtb') || lower.includes('guaranty')) return 'GTB';
  if (lower.includes('zenith')) return 'Zenith';
  if (lower.includes('access')) return 'Access';
  if (lower.includes('uba') || lower.includes('united bank for africa')) return 'UBA';
  if (lower.includes('first bank') || lower.includes('firstbank')) return 'First Bank';
  if (lower.includes('fidelity')) return 'Fidelity';
  if (lower.includes('stanbic') || lower.includes('ibtc')) return 'Stanbic IBTC';
  if (lower.includes('sterling')) return 'Sterling';
  if (lower.includes('wema') || lower.includes('alat')) return 'Wema';
  if (lower.includes('carbon')) return 'Carbon';
  if (lower.includes('opay')) return 'OPay';
  if (lower.includes('kuda')) return 'Kuda';
  if (lower.includes('moniepoint') || lower.includes('monie point')) return 'Moniepoint';
  if (lower.includes('palmpay') || lower.includes('palm pay')) return 'PalmPay';

  return 'default';
}

export default function BankLogo({ bankName, size = 'md', animated = true }) {
  const configKey = normalizeBankName(bankName);
  const config = BANK_CONFIG[configKey];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const LogoWrapper = animated ? motion.div : 'div';

  const animationProps = animated
    ? {
        initial: { scale: 0.5, opacity: 0, rotate: -15 },
        animate: { scale: 1, opacity: 1, rotate: 0 },
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.05,
        },
        whileHover: {
          scale: 1.1,
          rotate: 3,
          transition: { type: 'spring', stiffness: 400, damping: 15 },
        },
        whileTap: { scale: 0.95 },
      }
    : {};

  return (
    <LogoWrapper
      {...animationProps}
      className={`relative ${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}
      style={{
        boxShadow: `0 8px 20px -8px ${config.glowColor}`,
      }}
    >
      {/* Outer breathing glow ring */}
      {animated && (
        <motion.div
          className={`absolute inset-0 rounded-xl ring-2 ${config.ringColor} pointer-events-none`}
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Logo image */}
      {config.logo ? (
        <div
          className={`w-full h-full flex items-center justify-center p-1 ${
            config.isPng ? 'bg-white mix-blend-multiply dark:mix-blend-normal dark:bg-transparent' : ''
          }`}
        >
          <img
            src={config.logo}
            alt={`${bankName} logo`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ) : (
        // Fallback — initials with brand gradient
        <div
          className={`w-full h-full bg-linear-to-br ${config.gradient} flex items-center justify-center`}
        >
          <span className="font-bold text-white text-sm tracking-tight">
            {config.initials}
          </span>
        </div>
      )}

      {/* Shine effect on hover */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-linear-to-tr from-transparent via-white/25 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </LogoWrapper>
  );
}
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function AuroraBackground({ intensity = 'normal' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const opacity = intensity === 'subtle' ? 0.85 : 1;

  // Different palettes for light and dark
  const palette = isDark
    ? {
        blob1: 'rgba(37, 99, 235, 0.7)',
        blob2: 'rgba(6, 182, 212, 0.6)',
        blob3: 'rgba(139, 92, 246, 0.5)',
        blob4: 'rgba(236, 72, 153, 0.35)',
        dotColor: 'rgba(255,255,255,0.15)',
        vignette: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.2) 100%)',
      }
    : {
    blob1: 'rgba(147, 197, 253, 0.5)',
    blob2: 'rgba(165, 243, 252, 0.45)',
    blob3: 'rgba(196, 181, 253, 0.4)',
    blob4: 'rgba(251, 207, 232, 0.4)',
    dotColor: 'rgba(15, 23, 42, 0.06)',
    vignette: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(255,255,255,0.5) 100%)',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Aurora blob 1 — Deep blue */}
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${palette.blob1} 0%, transparent 70%)`,
          filter: 'blur(45px)',
          top: '-25%',
          left: '-10%',
          opacity,
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 80, 140, 0],
          scale: [1, 1.4, 1.15, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Aurora blob 2 — Cyan */}
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${palette.blob2} 0%, transparent 70%)`,
          filter: 'blur(55px)',
          top: '10%',
          right: '-20%',
          opacity,
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -50, 80, 0],
          scale: [1, 1.3, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Aurora blob 3 — Purple accent */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${palette.blob3} 0%, transparent 65%)`,
          filter: 'blur(65px)',
          bottom: '-20%',
          left: '25%',
          opacity,
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.4, 1, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Aurora blob 4 — Pink accent (extra for richness) */}
      <motion.div
        className="absolute w-60 h-60 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${palette.blob4} 0%, transparent 70%)`,
          filter: 'blur(70px)',
          bottom: '-10%',
          right: '15%',
          opacity,
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, -60, -40, 0],
          scale: [1, 1.3, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Dot grid pattern */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${palette.dotColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.5,
        }}
        animate={{
          backgroundPosition: ['0px 0px', '20px 20px'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: palette.vignette }}
      />
    </div>
  );
}
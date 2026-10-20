import { useEffect } from 'react';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import MobileShowcase from '../components/landing/MobileShowcase';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing({ onNavigateToAuth, onGoToApp }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <LandingNav onNavigateToAuth={onNavigateToAuth} onGoToApp={onGoToApp} />
      <Hero onNavigateToAuth={onNavigateToAuth} onGoToApp={onGoToApp} />
      <MobileShowcase />
      <Features />
      <HowItWorks />
      <Pricing onNavigateToAuth={onNavigateToAuth} />
      <FAQ />
      <FinalCTA onNavigateToAuth={onNavigateToAuth} />
      <Footer />

      {/* Future sections will go here:
        <HowItWorks />, <Screenshots />, <Security />,
        <Pricing />, <FAQ />, <FinalCTA />, <Footer />
      */}
    </div>
  );
}
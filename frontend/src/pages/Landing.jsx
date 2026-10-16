 import { useEffect } from 'react';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';

export default function Landing({ onNavigateToAuth, onGoToApp }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <LandingNav onNavigateToAuth={onNavigateToAuth} onGoToApp={onGoToApp} />
      <Hero onNavigateToAuth={onNavigateToAuth} onGoToApp={onGoToApp} />

      {/* Future sections will go here:
        <Features />, <HowItWorks />, <Screenshots />, <Security />,
        <Pricing />, <FAQ />, <FinalCTA />, <Footer />
      */}
    </div>
  );
}
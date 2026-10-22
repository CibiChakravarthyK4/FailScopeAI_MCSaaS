import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MarketingHeader } from '../components/marketing/MarketingHeader';
import { Hero } from '../components/marketing/Hero';
import { TrustStrip } from '../components/marketing/TrustStrip';
import { FeaturesSection } from '../components/marketing/FeaturesSection';
import { HowItWorksSection } from '../components/marketing/HowItWorksSection';
import { SecuritySection } from '../components/marketing/SecuritySection';
import { FinalCta } from '../components/marketing/FinalCta';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

export function HomePage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <Hero />
        <TrustStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}

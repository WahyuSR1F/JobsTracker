import { CtaFooter } from '@/components/landing/cta-footer';
import { FeaturesSection } from '@/components/landing/features-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingHeader } from '@/components/landing/landing-header';
import { StatusFlowSection } from '@/components/landing/status-flow-section';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatusFlowSection />
      </main>
      <CtaFooter />
    </>
  );
}

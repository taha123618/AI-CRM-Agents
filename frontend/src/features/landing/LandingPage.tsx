import { useEffect } from 'react';
import { SmoothScrollProvider, useSmoothScroll } from './context/SmoothScrollContext';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { BackToTopPill } from './components/BackToTopPill';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { TrustedByMarquee } from './components/TrustedByMarquee';
import { FeaturesGrid } from './components/FeaturesGrid';
import { ProductShowcase } from './components/ProductShowcase';
import { ArchitectureSpecs } from './components/ArchitectureSpecs';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialsSection } from './components/TestimonialsSection';
import { RoiCalculator } from './components/RoiCalculator';
// import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { InteractiveCta } from './components/InteractiveCta';
import { LandingFooter } from './components/LandingFooter';

function InitialHashScroller() {
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      const timer = setTimeout(() => {
        scrollTo(hash, { duration: 1 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scrollTo]);

  return null;
}

export function LandingPage() {
  return (
    <SmoothScrollProvider enabled={true}>
      <InitialHashScroller />
      <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground flex flex-col justify-between overflow-x-hidden relative">
        {/* Top Scroll Progress Indicator */}
        <ScrollProgressBar />

        <div>
          {/* Sticky Header Navigation */}
          <LandingNavbar />

          {/* Hero Section */}
          <HeroSection />

          {/* Social Proof Marquee */}
          <TrustedByMarquee />

          {/* Feature Cards Grid */}
          <FeaturesGrid />

          {/* Interactive Fleet Command Showcase */}
          <ProductShowcase />

          {/* Enterprise Technical Blueprint & Event Specs */}
          <ArchitectureSpecs />

          {/* 4-Step Autonomous Workflow Loop */}
          <HowItWorks />

          {/* Executive Testimonials & Verified ROI */}
          <TestimonialsSection />

          {/* Interactive ROI & Revenue Modeller */}
          <RoiCalculator />

          {/* Pricing Tiers & Billing Switcher */}
          {/* <PricingSection /> */}

          {/* Architecture & Deployment FAQ */}
          <FaqSection />

          {/* Command Terminal Launch Banner */}
          <InteractiveCta />
        </div>

        {/* Floating Back to Top Pill */}
        <BackToTopPill />

        {/* Footer */}
        <LandingFooter />
      </div>
    </SmoothScrollProvider>
  );
}

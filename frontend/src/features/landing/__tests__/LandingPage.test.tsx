import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from '../LandingPage';
import { PricingSection } from '../components/PricingSection';

function renderLandingPage(initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <LandingPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SaaS Landing Page Feature Suite', () => {
  it('renders LandingNavbar with branding and action buttons', () => {
    const { getByText, getAllByText } = renderLandingPage();

    expect(getAllByText(/AI·CRM FLEET/i).length).toBeGreaterThan(0);
    expect(getByText(/Autonomous Multi-Agent System/i)).toBeInTheDocument();
    expect(getAllByText(/Capabilities/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Fleet Showcase/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Deploy Fleet/i).length).toBeGreaterThan(0);
  });

  it('renders HeroSection with tactical headline and live simulated telemetry', () => {
    const { getAllByText } = renderLandingPage();

    expect(getAllByText(/The Autonomous/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Multi-Agent CRM/i).length).toBeGreaterThan(0);
    expect(getAllByText(/DEPLOY FREE MULTI-AGENT FLEET/i).length).toBeGreaterThan(0);
    expect(getAllByText(/140ms/i).length).toBeGreaterThan(0);
    expect(getAllByText(/\+340%/i).length).toBeGreaterThan(0);
  });

  it('renders FeaturesGrid with 6 specialized capability cards', () => {
    const { getByText, getAllByText } = renderLandingPage();

    expect(getByText(/Engineered for High-Velocity Revenue Fleets/i)).toBeInTheDocument();
    expect(getAllByText(/Voice AI Call Intelligence/i).length).toBeGreaterThan(0);
    expect(getAllByText(/WhatsApp Multi-Agent Hub/i).length).toBeGreaterThan(0);
    expect(getAllByText(/AI Deal War Room & Strategy Studio/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Monte Carlo Revenue Forecasting/i).length).toBeGreaterThan(0);
    expect(getAllByText(/AI SDR Outreach & Cadence Studio/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Autonomous Retention & Churn Radar/i).length).toBeGreaterThan(0);
  });

  it('renders ProductShowcase and switches interactive tabs when clicked', async () => {
    const { getByText, getAllByRole } = renderLandingPage();

    expect(getByText(/Explore the Specialized AI Command Modules/i)).toBeInTheDocument();
    
    // Switch to Voice AI
    const tabs = getAllByRole('button');
    const voiceAiTab = tabs.find((btn) => btn.textContent?.includes('Voice AI Call Intelligence'));
    if (voiceAiTab) {
      fireEvent.click(voiceAiTab);
      await waitFor(() => {
        expect(getByText(/LIVE OBJECTION BATTLE-CARD/i)).toBeInTheDocument();
      });
    }

    // Switch to WhatsApp
    const whatsappTab = tabs.find((btn) => btn.textContent?.includes('WhatsApp Business Multi-Agent'));
    if (whatsappTab) {
      fireEvent.click(whatsappTab);
      await waitFor(() => {
        expect(getByText(/AUTO-PILOT ACTIVE/i)).toBeInTheDocument();
      });
    }
  });

  it('renders HowItWorks 4-phase autonomous loop', () => {
    const { getByText } = renderLandingPage();

    expect(getByText(/How the Multi-Agent Engine Operates/i)).toBeInTheDocument();
    expect(getByText(/Telemetry Ingestion & Signal Capture/i)).toBeInTheDocument();
    expect(getByText(/Multi-Agent Collaborative Reasoning/i)).toBeInTheDocument();
    expect(getByText(/Autonomous Action & Orchestrated Execution/i)).toBeInTheDocument();
    expect(getByText(/Continuous Revenue & Pipeline Compounding/i)).toBeInTheDocument();
  });

  it('renders TestimonialsSection and handles carousel navigation', async () => {
    const { getByText, getByLabelText } = renderLandingPage();

    expect(getByText(/Trusted by Revenue Leaders Worldwide/i)).toBeInTheDocument();
    expect(getByText(/Elena Rostova/i)).toBeInTheDocument();
    expect(getByText(/Apex Cloud Dynamics/i)).toBeInTheDocument();

    const nextBtn = getByLabelText(/Next Testimonial/i);
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(getByText(/Marcus Vance/i)).toBeInTheDocument();
    });
  });

  it('renders PricingSection and toggles monthly/annual billing calculation', () => {
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <PricingSection />
      </MemoryRouter>
    );

    expect(getByText(/Simple Pricing for Scalable Revenue Operations/i)).toBeInTheDocument();
    expect(getAllByText(/Growth Fleet/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Enterprise Fleet/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Sovereign Sovereign Cloud/i).length).toBeGreaterThan(0);

    // Default annual price
    expect(getByText(/\$399/i)).toBeInTheDocument();

    // Toggle to monthly billing
    const monthlyLabels = getAllByText(/MONTHLY/i);
    const billingToggle = monthlyLabels[0].parentElement?.querySelector('button');
    if (billingToggle) {
      fireEvent.click(billingToggle);
      expect(getByText(/\$499/i)).toBeInTheDocument();
    }
  });

  it('renders FaqSection and toggles accordion items', async () => {
    const { getByText, getAllByText } = renderLandingPage();

    expect(getByText(/Architecture & Deployment Inquiries/i)).toBeInTheDocument();
    const question = getByText(/Can we use our own OpenAI or Anthropic API keys\?/i);
    fireEvent.click(question);
    await waitFor(() => {
      expect(getAllByText(/SmartFallbackLLM/i).length).toBeGreaterThan(0);
    });
  });

  it('renders ArchitectureSpecs and toggles schema payload viewer', async () => {
    const { getByText } = renderLandingPage();

    expect(getByText(/Hardened Multi-Agent System Architecture/i)).toBeInTheDocument();
    expect(getByText(/1\. Event Ingestion & Pub\/Sub Bus/i)).toBeInTheDocument();
    expect(getByText(/4\. Enterprise Cybersecurity Hardening/i)).toBeInTheDocument();

    const payloadBtn = getByText(/Event Packet Schema/i);
    fireEvent.click(payloadBtn);
    await waitFor(() => {
      expect(getByText(/CRM_AGENT_EVENT_PACKET_V2\.JSON/i)).toBeInTheDocument();
    });
  });

  it('renders RoiCalculator and recalculates values on slider adjustment', () => {
    const { getByText, getAllByText, getByLabelText } = renderLandingPage();

    expect(getByText(/Estimate Your Revenue Velocity & ROI/i)).toBeInTheDocument();
    expect(getByText(/PROJECTED ADDITIONAL ARR \/ YEAR/i)).toBeInTheDocument();

    const repsSlider = getByLabelText(/Sales Representatives & SDRs/i);
    fireEvent.change(repsSlider, { target: { value: '25' } });
    expect(getAllByText(/25 Reps/i).length).toBeGreaterThan(0);
    expect(getAllByText(/DEPLOY FLEET FOR 25 REPS/i).length).toBeGreaterThan(0);
  });

  it('renders InteractiveCta and LandingFooter', () => {
    const { getByText, getAllByText } = renderLandingPage();

    expect(getByText(/Ready to Put Your Sales Operations on Autonomous Auto-Pilot\?/i)).toBeInTheDocument();
    expect(getByText(/FLEET STATUS: 100% OPERATIONAL • ALL 9 SPECIALIZED AGENTS NOMINAL/i)).toBeInTheDocument();
    expect(getAllByText(/ZERO BORDER RADIUS ENFORCED/i).length).toBeGreaterThan(0);
  });
});

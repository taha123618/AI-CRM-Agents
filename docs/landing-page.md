# 🌐 SaaS Landing Page & Momentum Scrolling Architecture

This document details the architecture, design specifications, animation engine, and components powering the public SaaS landing page of the AI-Powered CRM Multi-Agent Operating System.

---

## 🏛️ Architecture Overview

The landing page resides in `frontend/src/features/landing/` and is served at `/` and `/home`. It is designed around the **Tactical Command Design System**:
- **Zero Border Radius**: All components enforce `rounded-none`, `--radius: 0rem;`, and strict square geometry.
- **Monospace Telemetry**: Applied to metrics, status chips, pricing calculations, and live simulated fleet event logs.
- **High-Contrast Theme Adaptation**: Instant transition between Void Black (`#0B0C10`) and clean light canvas.

```
frontend/src/features/landing/
├── context/
│   └── SmoothScrollContext.tsx       # Lenis + GSAP ScrollTrigger ticker integration
├── hooks/
│   └── useAnimatedCounter.ts         # RAF-driven counter with exponential deceleration
├── components/
│   ├── LandingNavbar.tsx             # Sticky header with anchor links, theme toggle & auth CTAs
│   ├── HeroSection.tsx               # Headline, animated KPI counters & live fleet HUD
│   ├── TrustedByMarquee.tsx          # Infrastructure & technology marquee
│   ├── FeaturesGrid.tsx              # 6-card specialized agent capability grid
│   ├── ProductShowcase.tsx           # Tabbed command module explorer with simulated previews
│   ├── ArchitectureSpecs.tsx         # 4 system pillars & JSON event packet schema viewer
│   ├── HowItWorks.tsx                # 4-phase autonomous intelligence loop
│   ├── TestimonialsSection.tsx       # Direction-aware spring physics carousel with zero layout shift
│   ├── RoiCalculator.tsx             # Real-time parameter value modeller with sliders
│   ├── PricingSection.tsx            # Transparent fleet tiers & monthly/annual billing calculation
│   ├── FaqSection.tsx                # Accordion answering architecture and deployment questions
│   ├── InteractiveCta.tsx            # Command terminal deployment launch banner
│   ├── LandingFooter.tsx             # Telemetry status bar, navigation links & governance notices
│   ├── ScrollProgressBar.tsx         # Fixed 3px glowing top telemetry progress bar
│   └── BackToTopPill.tsx             # Floating tactical return-to-top pill with percentage telemetry
├── data/
│   └── landingData.tsx               # Static feature definitions, testimonials, FAQ, and stats
└── LandingPage.tsx                   # Master page composition wrapper
```

---

## ⚡ Smooth Scrolling & Animation Engine

### 1. Unified `SmoothScrollProvider`
- Powered by [Lenis](https://github.com/darkroomengineering/lenis) and bound to GSAP's `ScrollTrigger` ticker via `gsap.ticker.add((time) => lenis.raf(time * 1000))` and `gsap.ticker.lagSmoothing(0)`.
- Custom easing curve: exponential smooth deceleration `Math.min(1, 1.001 - Math.pow(2, -10 * t))`.
- Automatically disables smooth momentum scrolling when user enables `prefers-reduced-motion`.

### 2. Multi-Alias Navigation & URL Hash Management
The `scrollTo(target, options)` handler maps navigation keys and clean aliases:
- `#capabilities` / `#features` -> `FeaturesGrid`
- `#showcase` / `#modules` -> `ProductShowcase`
- `#architecture` / `#specs` -> `ArchitectureSpecs`
- `#workflow` / `#how-it-works` -> `HowItWorks`
- `#roi-calculator` / `#roi` -> `RoiCalculator`
- `#case-studies` / `#testimonials` -> `TestimonialsSection`
- `#pricing` -> `PricingSection`
- `#faq` -> `FaqSection`

The handler applies `-70px` header clearance offset and updates the URL hash cleanly via `window.history.replaceState` without triggering page refreshes.

### 3. Direction-Aware Spring Physics Testimonials
- Tracks navigation vector (`direction > 0` for next, `direction < 0` for prev).
- Utilizes Framer Motion `mode="popLayout"` with `min-h-[320px]` and `overflow-hidden` constraints to guarantee **zero layout shift** between testimonials of varying lengths.
- Offers direct slide selector tabs (`01`, `02`, `03`) for instant jumping.

---

## 🎨 Theme-Adaptive Scrollbar Standard

Configured via CSS custom properties in `frontend/src/index.css`:

```css
:root {
  --scrollbar-thumb: #0B0C10;                /* Light theme: Solid black */
  --scrollbar-thumb-hover: #1f2937;
  --scrollbar-track: hsl(var(--background));
}

.dark {
  --scrollbar-thumb: hsl(var(--primary));    /* Dark theme: Tactical Gold (#FFB800) */
  --scrollbar-thumb-hover: #f59e0b;
  --scrollbar-track: hsl(var(--background));
}

html, body, * {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border: 1px solid var(--scrollbar-track);
  border-radius: 0 !important;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

---

## 🧪 Testing & Verification

The landing page feature suite is verified in `frontend/src/features/landing/__tests__/LandingPage.test.tsx`:
- Tests all 12 sections, slider interactions, accordion state toggling, and tab navigation.
- Fully compatible with Vitest and `@testing-library/react`.

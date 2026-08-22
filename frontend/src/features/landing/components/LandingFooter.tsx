import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const { scrollTo } = useSmoothScroll();

  const handleNav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <footer className="border-t border-border bg-card font-mono text-xs text-muted-foreground">
      {/* Top Telemetry Status Strip */}
      <div className="border-b border-border bg-background py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
            <span className="text-foreground font-bold">
              FLEET STATUS: 100% OPERATIONAL • ALL 9 SPECIALIZED AGENTS NOMINAL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>WS LATENCY: 18MS</span>
            <span>•</span>
            <span>UPTIME: 99.99%</span>
            <span>•</span>
            <span>REGION: US-EAST (POSTGRES 16)</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-primary text-primary-foreground flex items-center justify-center font-black text-sm border border-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-wider uppercase text-foreground">
              AI·CRM FLEET
            </span>
          </div>
          <p className="text-xs uppercase leading-relaxed max-w-sm text-muted-foreground font-mono">
            Autonomous multi-agent customer relationship management system engineered for high-velocity enterprise revenue teams.
          </p>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">
            Built with React 19, FastAPI, PostgreSQL 16, Redis, and LangChain TraceMixin.
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
            CAPABILITIES
          </span>
          <ul className="space-y-2 text-[11px] uppercase">
            <li>
              <a
                href="#capabilities"
                onClick={(e) => handleNav('capabilities', e)}
                className="hover:text-primary transition-none"
              >
                Voice AI Intelligence
              </a>
            </li>
            <li>
              <a
                href="#capabilities"
                onClick={(e) => handleNav('capabilities', e)}
                className="hover:text-primary transition-none"
              >
                WhatsApp Hub
              </a>
            </li>
            <li>
              <a
                href="#capabilities"
                onClick={(e) => handleNav('capabilities', e)}
                className="hover:text-primary transition-none"
              >
                AI Deal War Room
              </a>
            </li>
            <li>
              <a
                href="#capabilities"
                onClick={(e) => handleNav('capabilities', e)}
                className="hover:text-primary transition-none"
              >
                Monte Carlo Forecasting
              </a>
            </li>
            <li>
              <a
                href="#capabilities"
                onClick={(e) => handleNav('capabilities', e)}
                className="hover:text-primary transition-none"
              >
                AI SDR Sequences
              </a>
            </li>
          </ul>
        </div>

        {/* Architecture & Workflow Column */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
            ARCHITECTURE
          </span>
          <ul className="space-y-2 text-[11px] uppercase">
            <li>
              <a
                href="#architecture"
                onClick={(e) => handleNav('architecture', e)}
                className="hover:text-primary transition-none"
              >
                Multi-Agent Bus
              </a>
            </li>
            <li>
              <a
                href="#architecture"
                onClick={(e) => handleNav('architecture', e)}
                className="hover:text-primary transition-none"
              >
                Schema Specs
              </a>
            </li>
            <li>
              <a
                href="#workflow"
                onClick={(e) => handleNav('workflow', e)}
                className="hover:text-primary transition-none"
              >
                Autonomous Loop
              </a>
            </li>
            <li>
              <a
                href="#roi-calculator"
                onClick={(e) => handleNav('roi-calculator', e)}
                className="hover:text-primary transition-none"
              >
                ROI Value Modeller
              </a>
            </li>
            <li>
              <a
                href="#faq"
                onClick={(e) => handleNav('faq', e)}
                className="hover:text-primary transition-none"
              >
                Deployment FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Security & Access Column */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
            SECURITY &amp; ACCESS
          </span>
          <ul className="space-y-2 text-[11px] uppercase">
            <li>
              <Link to="/login" className="hover:text-primary transition-none">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary transition-none">
                Deploy Workspace
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-primary transition-none">
                RBAC Governance
              </Link>
            </li>
            <li>
              <span className="text-muted-foreground">SOC2 Type II Ready</span>
            </li>
            <li>
              <span className="text-muted-foreground">Zero Prompt Storage</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-border py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase text-muted-foreground">
          <span>
            © {currentYear} AI-POWERED CRM AGENT FLEET. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-4">
            <span>TACTICAL COMMAND DESIGN SYSTEM</span>
            <span>•</span>
            <span>ZERO BORDER RADIUS ENFORCED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

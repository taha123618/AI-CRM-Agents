import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Menu,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

import { useSmoothScroll } from '../context/SmoothScrollContext';

interface LandingNavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export function LandingNavbar({ onNavigateSection }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { scrollTo } = useSmoothScroll();
  const navigate = useNavigate();

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      scrollTo(id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border font-mono transition-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-none bg-primary text-primary-foreground flex items-center justify-center font-black text-base shadow-sm border border-primary">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider uppercase text-foreground">
                AI·CRM FLEET
              </span>
              {/* <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-none text-[9px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase">
                v2.5 PROD
              </span> */}
            </div>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
              Autonomous Multi-Agent System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs uppercase font-bold tracking-wider text-muted-foreground">
          <a
            href="#capabilities"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('capabilities');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Capabilities
          </a>
          <a
            href="#showcase"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('showcase');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Showcase
          </a>
          <a
            href="#architecture"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('architecture');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Architecture
          </a>
          <a
            href="#workflow"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('workflow');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Workflow
          </a>
          <a
            href="#roi-calculator"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('roi-calculator');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            ROI Modeller
          </a>
          <a
            href="#case-studies"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('case-studies');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Case Studies
          </a>
          {/* <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('pricing');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            Pricing
          </a> */}
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              handleScroll('faq');
            }}
            className="hover:text-primary transition-none cursor-pointer"
          >
            FAQ
          </a>
        </nav>

        {/* Actions & CTAs */}
        <div className="hidden sm:flex items-center gap-3">


          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs uppercase font-mono tracking-wider"
            >
              <span>Command Console</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-xs uppercase font-mono border-border bg-card hover:bg-muted text-foreground"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="text-xs uppercase font-mono tracking-wider shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                <span>Deploy Fleet</span>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-none bg-card border border-border text-foreground hover:bg-muted focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-border bg-card font-mono px-4 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-3 text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border pb-4">
              <a
                href="#capabilities"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('capabilities');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Capabilities
              </a>
              <a
                href="#showcase"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('showcase');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Fleet Showcase
              </a>
              <a
                href="#architecture"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('architecture');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Architecture Specs
              </a>
              <a
                href="#workflow"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('workflow');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Autonomous Loop
              </a>
              <a
                href="#roi-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('roi-calculator');
                }}
                className="text-left py-1 hover:text-primary"
              >
                ROI Value Modeller
              </a>
              <a
                href="#case-studies"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('case-studies');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Case Studies
              </a>
              {/* <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('pricing');
                }}
                className="text-left py-1 hover:text-primary"
              >
                Pricing
              </a> */}
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('faq');
                }}
                className="text-left py-1 hover:text-primary"
              >
                FAQ
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-xs uppercase font-mono"
                >
                  Enter Command Console ({user?.email})
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-xs uppercase font-mono border-border bg-background"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="w-full text-xs uppercase font-mono"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Deploy Free Fleet
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

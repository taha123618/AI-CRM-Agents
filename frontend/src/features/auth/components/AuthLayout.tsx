import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden font-mono">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-1 font-mono">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-none bg-card border border-primary flex items-center justify-center text-primary">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-wider text-foreground uppercase group-hover:text-primary transition-none">
            AI-POWERED CRM // TACTICAL
          </span>
        </Link>

        <h1 className="text-base font-black tracking-wider text-foreground uppercase mt-3">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground uppercase">{subtitle}</p>}
      </div>

      {/* Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0 font-mono">
        <div className="border border-border rounded-none shadow-2xl p-6 space-y-4 bg-card">
          {children}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-4 text-center text-[10px] text-muted-foreground uppercase space-y-0.5 font-mono">
          <p>PROTECTED BY ENTERPRISE RBAC, HTTP-ONLY SESSIONS &amp; HMAC SIGNATURES</p>
          <p className="text-[9px]">SOC2 TYPE II &amp; GDPR COMPLIANT SECURITY CONTROLS</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#FF2A54] selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-[#FF2A54] to-[#be123c] p-[1px] shadow-[0_0_15px_rgba(255,42,84,0.4)] border border-[#FF2A54]/50">
            <div className="w-full h-full bg-[#0D0D0D] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FF2A54]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#FF2A54] transition-none font-mono">
            AI-CRM // SAAS
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-white mt-4 font-mono uppercase">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 font-mono">{subtitle}</p>}
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="border border-[#252b36] rounded-none shadow-2xl p-6 sm:p-8 space-y-6 bg-[#1A1F26]">
          {children}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1 font-mono">
          <p>PROTECTED BY ENTERPRISE RBAC &amp; HTTP-ONLY COOKIES</p>
          <p className="text-[10px] text-slate-600">STEALTH LUXURY SECURITY CONTROLS</p>
        </div>
      </div>
    </div>
  );
}


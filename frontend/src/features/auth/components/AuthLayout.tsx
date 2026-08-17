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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-600/15 via-orange-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-10 w-[500px] h-[300px] bg-gradient-to-br from-purple-600/10 via-brand-500/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-400 p-[1px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-brand-300 transition-colors">
            AI-Powered CRM
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-white mt-4">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-card border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl bg-slate-900/60">
          {children}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>Protected by Enterprise RBAC, HTTP-only Cookies & HMAC Signatures</p>
          <p className="text-[11px]">SOC2 Type II & GDPR Compliant Security Controls</p>
        </div>
      </div>
    </div>
  );
}

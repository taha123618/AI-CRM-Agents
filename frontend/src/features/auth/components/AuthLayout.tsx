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
    <div className="min-h-screen bg-[#F6F5F2] dark:bg-[#141311] text-[#1A1917] dark:text-[#F5F3EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#1A1917] selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#1A1917] dark:bg-[#1D1B18] border border-[#35332F] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#C7A66A]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A1917] dark:text-[#F5F3EE]">
            AI-Powered CRM
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1A1917] dark:text-[#F5F3EE] mt-4">{title}</h1>
        {subtitle && <p className="text-sm text-[#5F5C56] dark:text-[#B9B5AD]">{subtitle}</p>}
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-[#1D1B18] border border-[#E9E6E0] dark:border-[#35322E] rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          {children}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-6 text-center text-xs text-[#85817A] dark:text-[#807C75] space-y-1">
          <p>Protected by Enterprise RBAC, HTTP-only Cookies & HMAC Signatures</p>
          <p className="text-[11px]">SOC2 Type II & GDPR Compliant Security Controls</p>
        </div>
      </div>
    </div>
  );
}

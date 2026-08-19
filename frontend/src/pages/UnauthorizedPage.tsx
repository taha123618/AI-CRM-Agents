import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <AuthLayout
      title="Access Restricted"
      subtitle="Role-Based Access Control (RBAC) Permission Required"
    >
      <div className="space-y-5 text-center font-mono">
        <div className="w-14 h-14 rounded-none bg-rose-950/80 border border-[#FF2A54]/50 flex items-center justify-center mx-auto text-[#FF2A54] shadow-[0_0_15px_rgba(255,42,84,0.3)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-white uppercase">403 — Insufficient Privileges</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Your current account role (<strong className="text-[#FF2A54] uppercase font-mono">{user?.role || 'Guest'}</strong>) does not have sufficient permission to access this administrative or protected resource.
          </p>
        </div>

        <div className="p-3 bg-[#0D0D0D] border border-[#252b36] rounded-none text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>User ID:</span>
            <span className="text-slate-200">{user?.email || 'unauthenticated'}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Department:</span>
            <span className="text-[#FF2A54] uppercase">{user?.role || 'none'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary"
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-none font-mono uppercase"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 border-[#252b36] bg-[#0D0D0D] text-slate-300 hover:bg-[#1A1F26] text-xs py-2 rounded-none font-mono uppercase"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Account
          </Button>
        </div>

        <div className="pt-3 border-t border-[#252b36]">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to main application
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}


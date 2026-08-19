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
      title="ACCESS RESTRICTED"
      subtitle="ROLE-BASED ACCESS CONTROL (RBAC) PERMISSION REQUIRED"
    >
      <div className="space-y-4 text-center font-mono">
        <div className="w-12 h-12 rounded-none bg-[#0B0C10] border border-[#FF2A54] flex items-center justify-center mx-auto text-[#FF2A54]">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white uppercase">403 — INSUFFICIENT PRIVILEGES</h3>
          <p className="text-[10px] text-slate-300 leading-relaxed uppercase">
            YOUR CURRENT ROLE (<strong className="text-[#FFB800] uppercase font-mono">{user?.role || 'GUEST'}</strong>) DOES NOT HAVE PERMISSION TO ACCESS THIS RESOURCE.
          </p>
        </div>

        <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552] rounded-none text-left text-xs space-y-1 font-mono uppercase">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>USER ID:</span>
            <span className="text-slate-200">{user?.email || 'UNAUTHENTICATED'}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>DEPARTMENT:</span>
            <span className="text-[#FFB800] uppercase">{user?.role || 'NONE'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2 uppercase"
          >
            <Home className="w-3.5 h-3.5" />
            BACK TO DASHBOARD
          </Button>

          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2 uppercase"
          >
            <LogOut className="w-3.5 h-3.5" />
            SWITCH ACCOUNT
          </Button>
        </div>

        <div className="pt-2 border-t border-[#3A4552]">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white uppercase"
          >
            <ArrowLeft className="w-3 h-3" />
            RETURN TO PLATFORM
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

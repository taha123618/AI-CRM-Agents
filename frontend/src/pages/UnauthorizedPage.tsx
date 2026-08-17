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
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">403 — Insufficient Privileges</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your current account role (<strong className="text-amber-400 uppercase font-mono">{user?.role || 'Guest'}</strong>) does not have sufficient permission to access this administrative or protected resource.
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>User ID:</span>
            <span className="text-slate-200">{user?.email || 'unauthenticated'}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Department:</span>
            <span className="text-brand-400 uppercase">{user?.role || 'none'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-xs py-2"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs py-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Account
          </Button>
        </div>

        <div className="pt-3 border-t border-slate-800">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to main application
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

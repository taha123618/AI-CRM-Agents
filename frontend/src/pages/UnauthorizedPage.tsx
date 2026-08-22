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
        <div className="w-12 h-12 rounded-none bg-background border border-destructive flex items-center justify-center mx-auto text-destructive">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-foreground uppercase">403 — INSUFFICIENT PRIVILEGES</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
            YOUR CURRENT ROLE (<strong className="text-primary uppercase font-mono">{user?.role || 'GUEST'}</strong>) DOES NOT HAVE PERMISSION TO ACCESS THIS RESOURCE.
          </p>
        </div>

        <div className="p-2.5 bg-background border border-border rounded-none text-left text-xs space-y-1 font-mono uppercase">
          <div className="flex justify-between text-muted-foreground text-[10px]">
            <span>USER ID:</span>
            <span className="text-foreground">{user?.email || 'UNAUTHENTICATED'}</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-[10px]">
            <span>DEPARTMENT:</span>
            <span className="text-primary uppercase">{user?.role || 'NONE'}</span>
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

        <div className="pt-2 border-t border-border">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground uppercase"
          >
            <ArrowLeft className="w-3 h-3" />
            RETURN TO PLATFORM
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

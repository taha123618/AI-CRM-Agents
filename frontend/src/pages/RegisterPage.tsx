import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Building, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/features/auth/types';
import { validatePasswordStrength } from '@/lib/validation';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('sales');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, isRegistering, ssoLogin, isSsoLoggingIn, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const pwValidation = validatePasswordStrength(password);
    if (!pwValidation.isValid) {
      setErrorMessage(
        `Password must meet all requirements: ${pwValidation.errors.join(', ')}.`
      );
      return;
    }

    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Registration failed.';
      setErrorMessage(detail);
    }
  };

  const handleSsoClick = async (provider: 'google' | 'microsoft') => {
    try {
      await ssoLogin({
        provider,
        token: `sso_reg_${provider}_${Date.now()}`,
        emailHint: provider === 'google' ? 'executive@google-workspace-demo.com' : 'revops@microsoft-entra-demo.com',
        nameHint: provider === 'google' ? 'Google Workspace User' : 'Microsoft Entra User',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(`SSO registration failed: ${err.message}`);
    }
  };

  return (
    <AuthLayout
      title="OPERATOR PROVISIONING"
      subtitle="CREATE CREDENTIALS FOR COMMAND FLEET"
    >
      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 bg-background border border-destructive text-destructive text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {/* Social SSO Buttons */}
      <div className="space-y-2 font-mono">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('google')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9"
        >
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>SIGN UP WITH GOOGLE WORKSPACE</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('microsoft')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9"
        >
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIGN UP WITH MICROSOFT ENTRA ID</span>
        </Button>
      </div>

      <div className="relative my-3 font-mono">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-card px-2 text-muted-foreground">OR REGISTER WITH EMAIL</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
            FULL NAME
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="JORDAN VANCE"
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
            WORK EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="JORDAN.VANCE@COMPANY.COM"
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} className="mt-1" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase">
              DEPARTMENT ROLE
            </label>
            <span className="text-[9px] text-primary font-mono uppercase">
              ADMIN PROVISIONED VIA SETTINGS
            </span>
          </div>
          <div className="relative">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-mono uppercase"
            >
              <option value="sales">SALES (PIPELINE, SDR &amp; DEALS)</option>
              <option value="support">SUPPORT (CUSTOMER SUCCESS &amp; JOURNEY)</option>
              <option value="auditor">AUDITOR (READ-ONLY COMPLIANCE)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 mt-2 uppercase"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isRegistering ? 'PROVISIONING...' : 'CREATE ACCOUNT'}</span>
        </Button>
      </form>

      <div className="text-center text-[10px] text-muted-foreground pt-2 border-t border-border font-mono uppercase">
        ALREADY HAVE AN ACCOUNT?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          SIGN IN
        </Link>
      </div>
    </AuthLayout>
  );
}

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
      title="Create an account"
      subtitle="Get started with multi-agent AI CRM intelligence"
    >
      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-none text-rose-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Social SSO Buttons */}
      <div className="space-y-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('google')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2.5 border-[#252b36] bg-[#0D0D0D] hover:bg-[#1A1F26] text-slate-200 text-xs py-2.5 rounded-none font-mono"
        >
          <Building className="w-4 h-4 text-[#FF2A54]" />
          Sign up with Google Workspace
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('microsoft')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2.5 border-[#252b36] bg-[#0D0D0D] hover:bg-[#1A1F26] text-slate-200 text-xs py-2.5 rounded-none font-mono"
        >
          <Building className="w-4 h-4 text-cyan-400" />
          Sign up with Microsoft Entra ID
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#252b36]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-mono">
          <span className="bg-[#1A1F26] px-2 text-slate-500 text-[10px]">Or register with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jordan Vance"
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan.vance@company.com"
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} className="mt-2" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase">
              Department Role
            </label>
            <span className="text-[10px] text-amber-400/90 font-mono">
              Admin provisioned via Settings
            </span>
          </div>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none cursor-pointer font-mono"
            >
              <option value="sales">Sales (Pipeline, SDR & Deals)</option>
              <option value="support">Support (Customer Success & Journey)</option>
              <option value="auditor">Auditor (Read-Only Compliance)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Super Admin accounts (<code className="text-slate-400">admin@gmail.com</code>) manage system permissions and user provisioning in Settings & Governance.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold mt-2 rounded-none font-mono uppercase tracking-wider"
        >
          <UserPlus className="w-4 h-4" />
          {isRegistering ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#252b36] font-mono">
        Already have an account?{' '}
        <Link to="/login" className="text-[#FF2A54] hover:text-[#e11d48] font-semibold transition-none">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}


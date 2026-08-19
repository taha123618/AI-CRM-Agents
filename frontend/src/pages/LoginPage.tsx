import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Building } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isLoggingIn, ssoLogin, isSsoLoggingIn, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      await login({ email, password, rememberMe });
      navigate(redirectUrl);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(detail);
    }
  };

  const handleSsoClick = async (provider: 'google' | 'microsoft') => {
    try {
      await ssoLogin({
        provider,
        token: `sso_${provider}_${Date.now()}`,
        emailHint: provider === 'google' ? 'executive@google-workspace-demo.com' : 'revops@microsoft-entra-demo.com',
        nameHint: provider === 'google' ? 'Google Workspace User' : 'Microsoft Entra User',
      });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMessage(`SSO authentication failed: ${err.message}`);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AI-Powered CRM account"
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
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2.5 border-[#252b36] bg-[#0D0D0D] hover:bg-[#1A1F26] text-slate-200 text-xs py-2.5 rounded-none font-mono"
        >
          <Building className="w-4 h-4 text-[#FF2A54]" />
          Continue with Google Workspace
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('microsoft')}
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2.5 border-[#252b36] bg-[#0D0D0D] hover:bg-[#1A1F26] text-slate-200 text-xs py-2.5 rounded-none font-mono"
        >
          <Building className="w-4 h-4 text-cyan-400" />
          Continue with Microsoft Entra ID
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#252b36]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-mono">
          <span className="bg-[#1A1F26] px-2 text-slate-500 text-[10px]">Or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@enterprise.com"
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#FF2A54] hover:text-[#e11d48] transition-none"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded-none border-[#252b36] bg-[#0D0D0D] text-[#FF2A54] focus:ring-0"
            />
            <span>Remember this device</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold mt-2 rounded-none font-mono uppercase tracking-wider"
        >
          <LogIn className="w-4 h-4" />
          {isLoggingIn ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#252b36] font-mono">
        Don't have an enterprise account?{' '}
        <Link to="/register" className="text-[#FF2A54] hover:text-[#e11d48] font-semibold transition-none">
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
}


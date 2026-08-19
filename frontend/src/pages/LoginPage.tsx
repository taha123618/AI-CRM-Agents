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
      title="OPERATOR AUTHENTICATION"
      subtitle="SIGN IN TO ENTERPRISE COMMAND"
    >
      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {/* Social SSO Buttons */}
      <div className="space-y-2 font-mono">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('google')}
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9"
        >
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>CONTINUE WITH GOOGLE WORKSPACE</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSsoClick('microsoft')}
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9"
        >
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          <span>CONTINUE WITH MICROSOFT ENTRA ID</span>
        </Button>
      </div>

      <div className="relative my-3 font-mono">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3A4552]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#1F2833] px-2 text-slate-500">OR DIRECT CREDENTIALS</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        <div>
          <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@enterprise.com"
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FFB800] font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-slate-300 uppercase">
              PASSWORD
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] text-[#FFB800] hover:underline uppercase"
            >
              FORGOT PASSWORD?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FFB800] font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer uppercase text-[10px]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded-none border-[#3A4552] bg-[#0B0C10] text-[#FFB800] focus:ring-0"
            />
            <span>REMEMBER THIS DEVICE</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoggingIn || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 mt-2 uppercase"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{isLoggingIn ? 'SIGNING IN...' : 'SIGN IN'}</span>
        </Button>
      </form>

      <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-[#3A4552] font-mono uppercase">
        NO OPERATOR ACCOUNT?{' '}
        <Link to="/register" className="text-[#FFB800] font-bold hover:underline">
          REGISTER ACCOUNT
        </Link>
      </div>
    </AuthLayout>
  );
}

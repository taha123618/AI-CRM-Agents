import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { validatePasswordStrength } from '@/lib/validation';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { resetPassword, isResetting } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Reset token is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const pwValidation = validatePasswordStrength(newPassword);
    if (!pwValidation.isValid) {
      setErrorMessage(
        `Password must meet all requirements: ${pwValidation.errors.join(', ')}.`
      );
      return;
    }

    try {
      await resetPassword({ token, new_password: newPassword });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Password reset failed. Token may be invalid or expired.');
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your security token and choose a strong new password."
    >
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-none text-rose-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4 text-center font-mono">
          <div className="w-12 h-12 rounded-none bg-emerald-950 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white uppercase">Password Updated!</h3>
          <p className="text-xs text-slate-300 font-sans">
            Your password has been successfully reset. You can now log in with your updated credentials.
          </p>

          <div className="pt-3 border-t border-[#252b36]">
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              className="w-full py-2 text-xs font-mono uppercase"
            >
              Proceed to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Reset Security Token
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token received via email"
                className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] font-mono text-xs transition-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-none"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} className="mt-2" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Confirm New Password
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

          <Button
            type="submit"
            variant="primary"
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold mt-2 rounded-none font-mono uppercase tracking-wider"
          >
            <Lock className="w-4 h-4" />
            {isResetting ? 'Updating password...' : 'Update Password'}
          </Button>

          <div className="text-center pt-2 font-mono">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}


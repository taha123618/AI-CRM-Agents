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
      title="SET NEW CREDENTIALS"
      subtitle="ENTER TOKEN AND CHOOSE A SECURE PASSWORD"
    >
      {errorMessage && (
        <div className="p-2.5 bg-background border border-destructive text-destructive text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-3 text-center font-mono">
          <div className="w-12 h-12 rounded-none bg-background border border-primary flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-xs font-bold text-foreground uppercase">CREDENTIALS UPDATED!</h3>
          <p className="text-[10px] text-muted-foreground uppercase">
            YOUR PASSWORD HAS BEEN RESET. YOU CAN NOW SIGN IN WITH UPDATED CREDENTIALS.
          </p>

          <div className="pt-2 border-t border-border">
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="w-full text-xs uppercase"
            >
              PROCEED TO SIGN IN
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              RESET SECURITY TOKEN
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token received via email"
                className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              NEW PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-none"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} className="mt-1" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              CONFIRM NEW PASSWORD
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

          <Button
            type="submit"
            variant="primary"
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 mt-2 uppercase"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isResetting ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
          </Button>

          <div className="text-center pt-1 border-t border-border">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground uppercase"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO SIGN IN
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

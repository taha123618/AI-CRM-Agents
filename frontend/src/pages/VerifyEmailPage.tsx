import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { verifyEmail, isVerifyingEmail } = useAuth();

  const handleVerify = async (tokenToUse: string) => {
    if (!tokenToUse) return;
    setErrorMessage(null);
    try {
      await verifyEmail({ token: tokenToUse });
      setIsVerified(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Email verification failed or token expired.');
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm your identity to activate all enterprise multi-agent CRM capabilities."
    >
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {isVerified ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white">Email Verified Successfully!</h3>
          <p className="text-xs text-slate-300">
            Your enterprise email address is now verified and active.
          </p>

          <div className="pt-3 border-t border-slate-800">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-2 text-xs"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Verification Security Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <Button
            onClick={() => handleVerify(token)}
            disabled={isVerifyingEmail || !token}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-2.5 shadow-lg shadow-brand-500/20 text-sm font-semibold"
          >
            <MailCheck className="w-4 h-4" />
            {isVerifyingEmail ? 'Verifying...' : 'Verify Email Address'}
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

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
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-none text-rose-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {isVerified ? (
        <div className="space-y-4 text-center font-mono">
          <div className="w-12 h-12 rounded-none bg-emerald-950 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white uppercase">Email Verified Successfully!</h3>
          <p className="text-xs text-slate-300 font-sans">
            Your enterprise email address is now verified and active.
          </p>

          <div className="pt-3 border-t border-[#252b36]">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              className="w-full py-2 text-xs font-mono uppercase"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Verification Security Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token"
              className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] font-mono text-xs transition-none"
            />
          </div>

          <Button
            onClick={() => handleVerify(token)}
            disabled={isVerifyingEmail || !token}
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-none font-mono uppercase tracking-wider"
          >
            <MailCheck className="w-4 h-4" />
            {isVerifyingEmail ? 'Verifying...' : 'Verify Email Address'}
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
        </div>
      )}
    </AuthLayout>
  );
}


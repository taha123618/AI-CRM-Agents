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
      title="VERIFY EMAIL IDENTITY"
      subtitle="CONFIRM IDENTITY TO ACTIVATE AGENT FLEET CAPABILITIES"
    >
      {errorMessage && (
        <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {isVerified ? (
        <div className="space-y-3 text-center font-mono">
          <div className="w-12 h-12 rounded-none bg-[#0B0C10] border border-[#39FF14] flex items-center justify-center mx-auto text-[#39FF14]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-xs font-bold text-white uppercase">EMAIL VERIFIED SUCCESSFULLY!</h3>
          <p className="text-[10px] text-slate-300 uppercase">
            YOUR ENTERPRISE OPERATOR EMAIL IS NOW VERIFIED AND ACTIVE.
          </p>

          <div className="pt-2 border-t border-[#3A4552]">
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="w-full text-xs uppercase"
            >
              CONTINUE TO DASHBOARD
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
              VERIFICATION SECURITY TOKEN
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="PASTE VERIFICATION TOKEN"
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#39FF14] font-mono"
            />
          </div>

          <Button
            onClick={() => handleVerify(token)}
            disabled={isVerifyingEmail || !token}
            variant="primary"
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 uppercase"
          >
            <MailCheck className="w-3.5 h-3.5" />
            <span>{isVerifyingEmail ? 'VERIFYING...' : 'VERIFY EMAIL ADDRESS'}</span>
          </Button>

          <div className="text-center pt-1 border-t border-[#3A4552]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white uppercase"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO SIGN IN
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

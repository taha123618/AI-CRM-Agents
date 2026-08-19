import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Inbox, ShieldAlert } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { forgotPassword, isForgotSubmitting } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please provide your registered work email address.');
      return;
    }

    try {
      await forgotPassword({ email });
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to process password reset request.');
    }
  };

  return (
    <AuthLayout
      title="PASSWORD RECOVERY"
      subtitle="ENTER ACCOUNT EMAIL FOR SECURE RECOVERY"
    >
      {errorMessage && (
        <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-3 text-center font-mono">
          <div className="w-12 h-12 rounded-none bg-[#0B0C10] border border-[#39FF14] flex items-center justify-center mx-auto text-[#39FF14]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white uppercase">RECOVERY DISPATCHED</h3>
            <p className="text-[10px] text-slate-300 leading-relaxed max-w-sm mx-auto uppercase">
              IF AN ACCOUNT IS ASSOCIATED WITH <strong className="text-white font-mono">{submittedEmail}</strong>, A SINGLE-USE TOKEN HAS BEEN SENT.
            </p>
          </div>

          <div className="p-3 bg-[#0B0C10] border border-[#3A4552] rounded-none space-y-1 text-left text-xs uppercase">
            <div className="flex items-center gap-1.5 text-[#39FF14] font-bold text-[10px]">
              <Inbox className="w-3.5 h-3.5" />
              <span>NEXT STEPS:</span>
            </div>
            <ul className="space-y-1 text-slate-400 text-[10px] leading-relaxed">
              <li>• CLICK THE RESET LINK IN THE EMAIL TO SET A NEW PASSWORD.</li>
              <li>• LINK EXPIRES IN <strong className="text-white">60 MINUTES</strong> (SINGLE-USE ONLY).</li>
              <li>• CHECK SPAM / JUNK FOLDER IF NOT RECEIVED WITHIN 2 MINUTES.</li>
            </ul>
          </div>

          <div className="p-2 bg-[#0B0C10] border border-amber-500/40 rounded-none flex items-start gap-2 text-left text-[10px] text-amber-300 uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>NEVER SHARE YOUR RESET LINK. OUR REPS NEVER ASK FOR PASSWORDS.</span>
          </div>

          <div className="pt-2 border-t border-[#3A4552] flex items-center justify-between text-[10px] uppercase">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-[#39FF14] hover:underline"
            >
              ← TRY ANOTHER EMAIL
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO SIGN IN
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
              WORK EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@enterprise.com"
                className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#39FF14] font-mono uppercase"
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-1 uppercase">
              INSTRUCTIONS DISPATCHED ASYNCHRONOUSLY VIA THE TASK QUEUE.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isForgotSubmitting}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 mt-2 uppercase"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isForgotSubmitting ? 'QUEUEING RECOVERY...' : 'SEND RESET INSTRUCTIONS'}</span>
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
        </form>
      )}
    </AuthLayout>
  );
}

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
      title="Reset your password"
      subtitle="Enter your account email to receive secure recovery instructions."
    >
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-none text-rose-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-none bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 font-mono">
            <h3 className="text-base font-bold text-white uppercase">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-sans">
              If an account is associated with <strong className="text-slate-100 font-mono">{submittedEmail}</strong>, we have dispatched a single-use password reset link.
            </p>
          </div>

          <div className="p-4 bg-[#0D0D0D] border border-[#252b36] rounded-none space-y-2.5 text-left text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Inbox className="w-4 h-4 text-[#FF2A54] shrink-0" />
              <span>Next Steps:</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside text-[11px] leading-relaxed font-sans">
              <li>Click the reset link in the email to set a new password.</li>
              <li>The secure link expires in <strong>60 minutes</strong> and can only be used once.</li>
              <li>Check your spam or junk folder if the email does not appear within 2 minutes.</li>
            </ul>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-none flex items-start gap-2 text-left text-[11px] text-amber-300 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Never share your password reset link with anyone. Our team will never ask for your credentials.</span>
          </div>

          <div className="pt-3 border-t border-[#252b36] flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-[#FF2A54] hover:text-[#e11d48] transition-none"
            >
              ← Try another email
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
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
                placeholder="alex@enterprise.com"
                className="w-full bg-[#0D0D0D] border border-[#252b36] rounded-none pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#FF2A54] focus:ring-1 focus:ring-[#FF2A54] transition-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">
              Instructions will be dispatched asynchronously via the task queue.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isForgotSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold mt-2 rounded-none font-mono uppercase tracking-wider"
          >
            <KeyRound className="w-4 h-4" />
            {isForgotSubmitting ? 'Queueing instructions...' : 'Send Reset Instructions'}
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


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
        <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-4 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              If an account is associated with <strong className="text-slate-100 font-mono">{submittedEmail}</strong>, we have dispatched a single-use password reset link.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2.5 text-left text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Inbox className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Next Steps:</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside text-[11px] leading-relaxed">
              <li>Click the reset link in the email to set a new password.</li>
              <li>The secure link expires in <strong>60 minutes</strong> and can only be used once.</li>
              <li>Check your spam or junk folder if the email does not appear within 2 minutes.</li>
            </ul>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl flex items-start gap-2 text-left text-[11px] text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Never share your password reset link with anyone. Our team will never ask for your credentials.</span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              ← Try another email
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Instructions will be dispatched asynchronously via the task queue.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isForgotSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-2.5 shadow-lg shadow-brand-500/20 text-sm font-semibold mt-2"
          >
            <KeyRound className="w-4 h-4" />
            {isForgotSubmitting ? 'Queueing instructions...' : 'Send Reset Instructions'}
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
        </form>
      )}
    </AuthLayout>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, UserPlus, AlertCircle, Building, ShieldCheck,
  Eye, EyeOff, Shield, CheckCircle2, RefreshCw, Clock,
} from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/features/auth/types';
import { validatePasswordStrength } from '@/lib/validation';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';

const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 2 * 60; // 2 minutes (120 seconds)

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isRegistering, verifyOtp, isVerifyingOtp, resendOtp, isResendingOtp, ssoLogin, isSsoLoggingIn, isAuthenticated } = useAuth();

  // ── Step 1: Registration form state ───────────────────────────────────
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [pendingEmail, setPendingEmail] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('sales');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Step 2: OTP state ─────────────────────────────────────────────────
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRE_SECONDS);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Countdown runs only on OTP step
  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = secondsLeft <= 0;

  // ── Step 1: Register submit ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    const pwValidation = validatePasswordStrength(password);
    if (!pwValidation.isValid) {
      setErrorMessage(`Password must meet all requirements: ${pwValidation.errors.join(', ')}.`);
      return;
    }

    try {
      const res = await register({ full_name: fullName, email, password, role });
      if (res.status === 'otp_sent') {
        setPendingEmail(res.email);
        setStep('otp');
        setSecondsLeft(OTP_EXPIRE_SECONDS);
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Registration failed.';
      setErrorMessage(detail);
    }
  };

  const handleSsoClick = async (provider: 'google' | 'microsoft') => {
    try {
      await ssoLogin({
        provider, token: `sso_reg_${provider}_${Date.now()}`,
        emailHint: provider === 'google' ? 'executive@google-workspace-demo.com' : 'revops@microsoft-entra-demo.com',
        nameHint: provider === 'google' ? 'Google Workspace User' : 'Microsoft Entra User',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(`SSO registration failed: ${err.message}`);
    }
  };

  // ── Step 2: OTP helpers ───────────────────────────────────────────────
  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && !digits.includes('');

  const handleDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setOtpError(null);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (text.length >= OTP_LENGTH) {
      setDigits(text.slice(0, OTP_LENGTH).split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      e.preventDefault();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) { setOtpError('Please enter all 6 digits.'); return; }
    if (isExpired) { setOtpError('This code has expired. Please request a new one.'); return; }
    setOtpError(null);
    try {
      await verifyOtp({ email: pendingEmail, otp });
      setOtpSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      setOtpError(err.response?.data?.detail || err.message || 'Invalid code. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    setOtpError(null);
    try {
      const res = await resendOtp(pendingEmail);
      setResendMsg(res.message || 'New code sent.');
      setSecondsLeft(OTP_EXPIRE_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code.');
    }
  };

  const maskedEmail = pendingEmail
    ? pendingEmail.replace(/(.{2})(.+)(?=@)/, (_, a, b) => `${a}${'*'.repeat(b.length)}`)
    : '';

  // ── Render ─────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <AuthLayout
        title="2-FACTOR AUTHENTICATION"
        subtitle={`VERIFY YOUR IDENTITY — CODE SENT TO ${maskedEmail}`}
      >
        {otpSuccess ? (
          <div className="p-6 bg-background border border-emerald-500/40 text-center font-mono">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Account Activated</p>
            <p className="text-xs text-muted-foreground">Routing to Command Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 font-mono">
            {/* Shield icon */}
            <div className="flex flex-col items-center mb-2">
              <div className="w-12 h-12 bg-background border border-primary/40 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase text-center leading-4">
                Enter the 6-digit code from your email to complete registration
              </p>
            </div>

            {/* Countdown */}
            <div className={`flex items-center justify-center gap-2 px-3 py-2 border text-[10px] font-bold uppercase tracking-widest
              ${isExpired ? 'border-destructive text-destructive bg-destructive/5' : 'border-border text-primary bg-primary/5'}`}
            >
              <Clock className="w-3 h-3" />
              {isExpired ? 'CODE EXPIRED' : `EXPIRES IN ${formatTime(secondsLeft)}`}
            </div>

            {/* 6 OTP digit inputs */}
            <div className="flex justify-center gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => handleDigitChange(e.target.value, i)}
                  onKeyDown={(e) => handleDigitKeyDown(e, i)}
                  onPaste={handlePaste}
                  className={`w-11 h-14 text-center text-2xl font-black bg-background border-2 font-mono focus:outline-none focus:border-primary caret-transparent
                    ${digit ? 'border-primary text-primary' : otpError ? 'border-destructive' : 'border-border text-foreground'}`}
                />
              ))}
            </div>

            {/* Errors */}
            {otpError && (
              <div className="flex items-start gap-2 p-2.5 bg-background border border-destructive text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="uppercase">{otpError}</span>
              </div>
            )}

            {/* Resend success */}
            {resendMsg && (
              <div className="flex items-start gap-2 p-2.5 bg-background border border-emerald-500/50 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="uppercase">{resendMsg}</span>
              </div>
            )}

            <Button
              id="verify-otp-btn"
              type="submit"
              variant="primary"
              disabled={isVerifyingOtp || !isComplete || isExpired}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 uppercase"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isVerifyingOtp ? 'VERIFYING...' : 'VERIFY & ACTIVATE ACCOUNT'}</span>
            </Button>

            {/* Resend */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[10px] text-muted-foreground uppercase">Didn't receive it?</span>
              <button
                type="button"
                id="resend-otp-btn"
                onClick={handleResend}
                disabled={isResendingOtp}
                className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase hover:underline disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                {isResendingOtp ? 'SENDING...' : 'RESEND CODE'}
              </button>
            </div>

            {/* Back link */}
            <div className="text-center text-[10px] text-muted-foreground pt-1 border-t border-border uppercase">
              <button
                type="button"
                onClick={() => { setStep('register'); setDigits(Array(OTP_LENGTH).fill('')); setOtpError(null); }}
                className="text-primary hover:underline font-bold"
              >
                ← BACK TO REGISTRATION
              </button>
            </div>

            {/* Security notice */}
            <p className="text-[9px] text-muted-foreground text-center border-t border-border pt-2">
              🔒 SECURITY: Never share this code. AI CRM will never ask for it.
            </p>
          </form>
        )}
      </AuthLayout>
    );
  }

  // ── Step 1: Registration Form ──────────────────────────────────────────
  return (
    <AuthLayout
      title="OPERATOR PROVISIONING"
      subtitle="CREATE CREDENTIALS FOR COMMAND FLEET"
    >
      {errorMessage && (
        <div className="p-2.5 bg-background border border-destructive text-destructive text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="uppercase">{errorMessage}</div>
        </div>
      )}

      {/* SSO Buttons */}
      <div className="space-y-2 font-mono">
        <Button type="button" variant="outline" onClick={() => handleSsoClick('google')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>SIGN UP WITH GOOGLE WORKSPACE</span>
        </Button>
        <Button type="button" variant="outline" onClick={() => handleSsoClick('microsoft')}
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs py-2 h-9">
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIGN UP WITH MICROSOFT ENTRA ID</span>
        </Button>
      </div>

      <div className="relative my-3 font-mono">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-card px-2 text-muted-foreground">OR REGISTER WITH EMAIL</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        {/* Full Name */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">FULL NAME</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input id="register-name" type="text" required value={fullName}
              onChange={(e) => setFullName(e.target.value)} placeholder="JORDAN VANCE"
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">WORK EMAIL ADDRESS</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input id="register-email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="JORDAN.VANCE@COMPANY.COM"
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono" />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input id="register-password" type={showPassword ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
                className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-none" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} className="mt-1" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">CONFIRM PASSWORD</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••"
                className={`w-full bg-background text-foreground border rounded-none pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none font-mono
                  ${confirmPassword && password !== confirmPassword ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'}`} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-none" tabIndex={-1}>
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-mono uppercase font-bold">Passwords Match</span>
              </div>
            )}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[9px] text-destructive font-mono mt-1 uppercase">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase">DEPARTMENT ROLE</label>
            <span className="text-[9px] text-primary font-mono uppercase">ADMIN PROVISIONED VIA SETTINGS</span>
          </div>
          <div className="relative">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <select id="register-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-background text-foreground border border-border rounded-none pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-mono uppercase">
              <option value="sales">SALES (PIPELINE, SDR &amp; DEALS)</option>
              <option value="support">SUPPORT (CUSTOMER SUCCESS &amp; JOURNEY)</option>
              <option value="auditor">AUDITOR (READ-ONLY COMPLIANCE)</option>
            </select>
          </div>
        </div>

        <Button id="register-submit-btn" type="submit" variant="primary"
          disabled={isRegistering || isSsoLoggingIn}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 h-9 mt-2 uppercase">
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isRegistering ? 'PROVISIONING...' : 'CREATE ACCOUNT'}</span>
        </Button>
      </form>

      <div className="text-center text-[10px] text-muted-foreground pt-2 border-t border-border font-mono uppercase">
        ALREADY HAVE AN ACCOUNT?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">SIGN IN</Link>
      </div>
    </AuthLayout>
  );
}

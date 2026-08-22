import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const provider = searchParams.get('provider') || 'google';
  const tokenOrCode = searchParams.get('code') || searchParams.get('token') || `oauth_${Date.now()}`;
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const { ssoLogin } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        await ssoLogin({
          provider,
          token: tokenOrCode,
          emailHint: provider === 'google' ? 'executive@google-workspace-demo.com' : 'revops@microsoft-entra-demo.com',
          nameHint: provider === 'google' ? 'Google Workspace User' : 'Microsoft Entra User',
        });
        if (isMounted) {
          navigate(redirectTarget, { replace: true });
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.response?.data?.detail || err.message || 'OAuth authentication failed.');
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [provider, tokenOrCode, redirectTarget, ssoLogin, navigate]);

  return (
    <AuthLayout
      title="Authenticating SSO..."
      subtitle="Finalizing enterprise identity verification with provider"
    >
      {errorMessage ? (
        <div className="space-y-4">
          <div className="p-3.5 bg-background border border-destructive/40 rounded-none text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="primary"
            className="w-full text-xs"
          >
            Return to Login
          </Button>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-muted-foreground animate-pulse">
            Validating credentials and issuing secure HTTP-only session cookies...
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

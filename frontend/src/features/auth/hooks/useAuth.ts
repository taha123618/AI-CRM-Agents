import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from './useAuthStore';
import { safeStorage } from '@/lib/storage';
import {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    setUser,
    logoutState,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getEffectivePermissions,
  } = useAuthStore();

  const hasTokenOrSession = Boolean(
    safeStorage.getItem('crm_access_token') ||
    safeStorage.getItem('crm_user') ||
    isAuthenticated
  );

  const currentUserQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const userProfile = await authApi.getMe();
        setUser(userProfile);
        return userProfile;
      } catch (err) {
        // Attempt refresh token if available
        try {
          const refreshRes = await authApi.refreshToken();
          if (refreshRes.access_token) {
            safeStorage.setItem('crm_access_token', refreshRes.access_token);
          }
          if (refreshRes.user) {
            setUser(refreshRes.user);
            return refreshRes.user;
          }
          const userProfile = await authApi.getMe();
          setUser(userProfile);
          return userProfile;
        } catch {
          logoutState();
          throw err;
        }
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: hasTokenOrSession,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (data.access_token) {
        safeStorage.setItem('crm_access_token', data.access_token);
      }
      setUser(data.user);
      queryClient.setQueryData(['auth-me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    // Do NOT set user or token here — register now returns OTP pending state
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authApi.verifyOtp(email, otp),
    onSuccess: (data) => {
      if (data.access_token) {
        safeStorage.setItem('crm_access_token', data.access_token);
      }
      setUser(data.user);
      queryClient.setQueryData(['auth-me'], data.user);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutState();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      logoutState();
      queryClient.clear();
      navigate('/login');
    },
  });

  const ssoLoginMutation = useMutation({
    mutationFn: ({ provider, token, emailHint, nameHint }: { provider: string; token: string; emailHint?: string; nameHint?: string }) =>
      authApi.loginSsoCallback(provider, token, emailHint, nameHint),
    onSuccess: (data) => {
      if (data.access_token) {
        safeStorage.setItem('crm_access_token', data.access_token);
      }
      setUser(data.user);
      queryClient.setQueryData(['auth-me'], data.user);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
  });

  return {
    user,
    isAuthenticated,
    isLoading: storeLoading || (hasTokenOrSession && currentUserQuery.isLoading && !user),
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getEffectivePermissions,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    ssoLogin: ssoLoginMutation.mutateAsync,
    isSsoLoggingIn: ssoLoginMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotSubmitting: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifyingEmail: verifyEmailMutation.isPending,
    refetchUser: currentUserQuery.refetch,
  };
}

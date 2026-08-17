import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from './useAuthStore';
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

  const currentUserQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const userProfile = await authApi.getMe();
        setUser(userProfile);
        return userProfile;
      } catch (err) {
        logoutState();
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth-me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth-me'], data.user);
    },
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
    isLoading: storeLoading || currentUserQuery.isLoading,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getEffectivePermissions,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
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
  };
}

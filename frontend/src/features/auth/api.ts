import { apiClient } from '@/lib/api/client';
import {
  AuthResponse,
  UserProfile,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  SsoProvider,
} from './types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/login', {
      email: payload.email,
      password: payload.password,
    });
    return data;
  },

  register: async (payload: RegisterPayload): Promise<{ status: string; email: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  },

  logout: async (): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/logout');
    return data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/refresh');
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get('/api/auth/me');
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ status: string; message: string; reset_token?: string }> => {
    const { data } = await apiClient.post('/api/auth/forgot-password', payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/reset-password', payload);
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/verify-email', payload);
    return data;
  },

  getSsoProviders: async (): Promise<{ providers: SsoProvider[] }> => {
    const { data } = await apiClient.get('/api/auth/sso/providers');
    return data;
  },

  getSsoAuthorizeUrl: async (provider: string, redirectUri?: string, state?: string): Promise<{ provider: string; authorization_url: string }> => {
    const { data } = await apiClient.get(`/api/auth/sso/authorize/${provider}`, {
      params: { redirect_uri: redirectUri, state },
    });
    return data;
  },

  loginSsoCallback: async (provider: string, token: string, emailHint?: string, nameHint?: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post(`/api/auth/sso/callback/${provider}`, {
      token,
      email_hint: emailHint,
      name_hint: nameHint,
    });
    return data;
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/verify-otp', { email, otp });
    return data;
  },

  resendOtp: async (email: string): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/resend-otp', { email });
    return data;
  },
};

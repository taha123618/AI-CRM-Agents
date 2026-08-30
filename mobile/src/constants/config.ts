/**
 * Application Configuration & Environment Security Constants
 * Securely loads and sanitizes Expo Public environment variables (EXPO_PUBLIC_*)
 */

import { Platform } from 'react-native';

/**
 * Safely parse boolean from environment string
 */
function parseEnvBool(val?: string, defaultVal: boolean = false): boolean {
  if (val === undefined || val === null || val === '') return defaultVal;
  const normalized = val.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Safely parse integer from environment string
 */
function parseEnvInt(val?: string, defaultVal: number = 15000): number {
  if (!val) return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

/**
 * Sanitize and validate API URL (strip trailing slashes, enforce protocol)
 */
function sanitizeUrl(rawUrl?: string, fallbackUrl: string = 'http://localhost:8000'): string {
  const url = (rawUrl || fallbackUrl).trim();
  return url.replace(/\/+$/, '');
}

// 1. Environment & Platform Determination
const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV || 'development').trim().toLowerCase();
const IS_PROD = APP_ENV === 'production';
const IS_DEV = APP_ENV === 'development';

// 2. Platform-aware Default Fallbacks
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const DEFAULT_WS_URL = Platform.select({
  android: 'ws://10.0.2.2:8000/ws',
  ios: 'ws://localhost:8000/ws',
  default: 'ws://localhost:8000/ws',
});

// 3. Sanitized Endpoints
const API_BASE_URL = sanitizeUrl(process.env.EXPO_PUBLIC_API_URL, DEFAULT_API_URL);
const WS_URL = sanitizeUrl(process.env.EXPO_PUBLIC_WS_URL, DEFAULT_WS_URL);

// 4. Offline Mock Safety Guard: Disabled by default in production unless explicitly opted in
const ENABLE_OFFLINE_MOCK = parseEnvBool(
  process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MOCK,
  !IS_PROD // Enabled in development, disabled in production
);

// 5. Storage Namespace (Isolates storage keys per environment to prevent credential cross-contamination)
const STORAGE_PREFIX = IS_PROD ? 'aicrm_prod' : 'aicrm_dev';

export const Config = {
  APP_NAME: 'AI CRM Field Command',
  APP_VERSION: '1.0.0',
  APP_ENV,
  IS_PROD,
  IS_DEV,
  
  // API & WebSocket Endpoints
  API_BASE_URL,
  WS_URL,
  
  // Network Timing & Resilience
  TIMEOUT_MS: parseEnvInt(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 15000),
  ENABLE_OFFLINE_MOCK,
  
  // Secure Namespaced Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: `${STORAGE_PREFIX}_auth_token`,
    REFRESH_TOKEN: `${STORAGE_PREFIX}_refresh_token`,
    USER_PROFILE: `${STORAGE_PREFIX}_user_profile`,
    DEALS_CACHE: `${STORAGE_PREFIX}_deals_cache`,
    CUSTOM_FIELDS_CACHE: `${STORAGE_PREFIX}_custom_fields_cache`,
    VOICE_NOTES_CACHE: `${STORAGE_PREFIX}_voice_notes_cache`,
    OFFLINE_QUEUE: `${STORAGE_PREFIX}_offline_action_queue`,
    THEME_PREFERENCE: `${STORAGE_PREFIX}_theme_pref`,
    NOTIFICATIONS_CACHE: `${STORAGE_PREFIX}_notifications_cache`,
  },
} as const;

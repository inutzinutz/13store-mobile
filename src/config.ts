/**
 * Application Configuration
 */

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000/api/v1'
    : 'https://13store-platform.vercel.app/api/v1',
  WEB_URL: __DEV__
    ? 'http://localhost:3000'
    : 'https://13store-platform.vercel.app',
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'api_key',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  SYNC_QUEUE: 'sync_queue',
} as const;

export const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  BATCH_SIZE: 10,
} as const;

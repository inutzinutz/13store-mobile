/**
 * Authentication Service
 * Handles authentication, token storage, and biometric authentication
 */

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { STORAGE_KEYS, API_CONFIG } from '../config';
import { User, LoginCredentials, ApiKeyCredentials } from '../types/auth';

/**
 * Store API key securely
 */
export const storeApiKey = async (apiKey: string): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, apiKey);
};

/**
 * Retrieve stored API key
 */
export const getApiKey = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
};

/**
 * Store user data securely
 */
export const storeUserData = async (user: User): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

/**
 * Retrieve stored user data
 */
export const getUserData = async (): Promise<User | null> => {
  const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
};

/**
 * Check if biometric authentication is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  const enabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
  return enabled === 'true';
};

/**
 * Enable/disable biometric authentication
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
};

/**
 * Check if device supports biometric authentication
 */
export const isBiometricSupported = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access 13 STORE',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Login with email and password
 * Note: This connects to the web platform's auth endpoint
 */
export const loginWithCredentials = async (
  credentials: LoginCredentials
): Promise<{ user: User; apiKey: string }> => {
  const response = await fetch(`${API_CONFIG.WEB_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  
  // Store credentials
  await storeApiKey(data.apiKey);
  await storeUserData(data.user);

  return data;
};

/**
 * Login with API key directly
 */
export const loginWithApiKey = async (
  credentials: ApiKeyCredentials
): Promise<{ user: User; apiKey: string }> => {
  // Validate API key by making a test request
  const response = await fetch(`${API_CONFIG.BASE_URL}/customers?limit=1`, {
    headers: {
      'X-API-Key': credentials.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid API key');
  }

  // For API key login, we need to fetch user data separately
  // This would require a /me endpoint on the API
  // For now, we'll create a mock user
  const user: User = {
    id: 'api-user',
    email: 'api@user.com',
    name: 'API User',
    role: 'sales',
  };

  await storeApiKey(credentials.apiKey);
  await storeUserData(user);

  return { user, apiKey: credentials.apiKey };
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await clearAuthData();
};

/**
 * Restore session from stored credentials
 */
export const restoreSession = async (): Promise<{
  user: User;
  apiKey: string;
} | null> => {
  const apiKey = await getApiKey();
  const user = await getUserData();

  if (!apiKey || !user) {
    return null;
  }

  // Validate API key is still valid
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/customers?limit=1`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      // API key is invalid, clear data
      await clearAuthData();
      return null;
    }

    return { user, apiKey };
  } catch (error) {
    console.error('Session restore error:', error);
    return null;
  }
};

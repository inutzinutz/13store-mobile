/**
 * Authentication types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  apiKey: string | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiKeyCredentials {
  apiKey: string;
}

/**
 * Authentication Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, ApiKeyCredentials } from '../types/auth';
import * as authService from '../services/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  apiKey: null,
  isAuthenticated: false,
  biometricEnabled: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.loginWithCredentials(credentials);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithApiKey = createAsyncThunk(
  'auth/loginWithApiKey',
  async (credentials: ApiKeyCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.loginWithApiKey(credentials);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await authService.restoreSession();
      if (!session) {
        throw new Error('No session found');
      }
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const enableBiometric = createAsyncThunk(
  'auth/enableBiometric',
  async (enabled: boolean, { rejectWithValue }) => {
    try {
      const supported = await authService.isBiometricSupported();
      if (!supported) {
        throw new Error('Biometric authentication is not supported on this device');
      }
      await authService.setBiometricEnabled(enabled);
      return enabled;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const authenticateWithBiometrics = createAsyncThunk(
  'auth/authenticateWithBiometrics',
  async (_, { rejectWithValue }) => {
    try {
      const success = await authService.authenticateWithBiometrics();
      if (!success) {
        throw new Error('Biometric authentication failed');
      }
      const session = await authService.restoreSession();
      if (!session) {
        throw new Error('No session found');
      }
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login with credentials
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.apiKey = action.payload.apiKey;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login with API key
    builder
      .addCase(loginWithApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithApiKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.apiKey = action.payload.apiKey;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Restore session
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.apiKey = action.payload.apiKey;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.apiKey = null;
      state.isAuthenticated = false;
      state.biometricEnabled = false;
      state.error = null;
    });

    // Enable biometric
    builder
      .addCase(enableBiometric.fulfilled, (state, action) => {
        state.biometricEnabled = action.payload;
      })
      .addCase(enableBiometric.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Authenticate with biometrics
    builder
      .addCase(authenticateWithBiometrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateWithBiometrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.apiKey = action.payload.apiKey;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(authenticateWithBiometrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

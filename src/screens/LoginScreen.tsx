/**
 * Login Screen
 * Supports both email/password and API key authentication
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Switch,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loginWithCredentials,
  loginWithApiKey,
  enableBiometric,
  clearError,
} from '../store/authSlice';
import { isBiometricSupported } from '../services/auth';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [loginMode, setLoginMode] = useState<'credentials' | 'apikey'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [enableBiometricAuth, setEnableBiometricAuth] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error]);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricSupported();
    setBiometricAvailable(available);
  };

  const handleLogin = async () => {
    if (loginMode === 'credentials') {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      const result = await dispatch(loginWithCredentials({ email, password }));
      
      if (loginWithCredentials.fulfilled.match(result) && enableBiometricAuth) {
        await dispatch(enableBiometric(true));
      }
    } else {
      if (!apiKey) {
        Alert.alert('Error', 'Please enter your API key');
        return;
      }

      const result = await dispatch(loginWithApiKey({ apiKey }));
      
      if (loginWithApiKey.fulfilled.match(result) && enableBiometricAuth) {
        await dispatch(enableBiometric(true));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>
            13 STORE
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Sales Mobile App
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              {/* Login Mode Selector */}
              <View style={styles.modeSelector}>
                <Button
                  mode={loginMode === 'credentials' ? 'contained' : 'outlined'}
                  onPress={() => setLoginMode('credentials')}
                  style={styles.modeButton}
                >
                  Email/Password
                </Button>
                <Button
                  mode={loginMode === 'apikey' ? 'contained' : 'outlined'}
                  onPress={() => setLoginMode('apikey')}
                  style={styles.modeButton}
                >
                  API Key
                </Button>
              </View>

              {/* Email/Password Login */}
              {loginMode === 'credentials' ? (
                <>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={styles.input}
                    mode="outlined"
                  />
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    style={styles.input}
                    mode="outlined"
                  />
                </>
              ) : (
                <>
                  <TextInput
                    label="API Key"
                    value={apiKey}
                    onChangeText={setApiKey}
                    autoCapitalize="none"
                    autoComplete="off"
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                  />
                  <Text variant="bodySmall" style={styles.helpText}>
                    Get your API key from the Developer Portal in the web dashboard
                  </Text>
                </>
              )}

              {/* Biometric Authentication Toggle */}
              {biometricAvailable && (
                <View style={styles.biometricContainer}>
                  <Text variant="bodyMedium">Enable Biometric Authentication</Text>
                  <Switch
                    value={enableBiometricAuth}
                    onValueChange={setEnableBiometricAuth}
                  />
                </View>
              )}

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              {isLoading && (
                <ActivityIndicator
                  animating={true}
                  size="large"
                  style={styles.loader}
                />
              )}
            </Card.Content>
          </Card>

          <Text variant="bodySmall" style={styles.footer}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    marginBottom: 24,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  helpText: {
    marginTop: -8,
    marginBottom: 12,
    color: '#666',
  },
  biometricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loader: {
    marginTop: 16,
  },
  footer: {
    textAlign: 'center',
    color: '#999',
  },
});

/**
 * 13 STORE Mobile App
 * React Native mobile application for sales team
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import Navigation from './src/navigation';
import NetworkStatusBanner from './src/components/NetworkStatusBanner';
import { initializeBackgroundSync, cleanupBackgroundSync } from './src/services/backgroundSync';

function AppContent() {
  useEffect(() => {
    // Initialize background sync on app start
    initializeBackgroundSync();

    // Cleanup on unmount
    return () => {
      cleanupBackgroundSync();
    };
  }, []);

  return (
    <>
      <NetworkStatusBanner />
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}

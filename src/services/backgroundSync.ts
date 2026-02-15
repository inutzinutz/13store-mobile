/**
 * Background Sync Service
 * Handles automatic syncing when app state changes or network reconnects
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../store';
import { processSyncQueue, loadSyncQueue } from '../store/syncSlice';

let appStateSubscription: any = null;
let netInfoSubscription: any = null;
let isInitialized = false;

/**
 * Initialize background sync service
 */
export const initializeBackgroundSync = () => {
  if (isInitialized) {
    console.log('Background sync already initialized');
    return;
  }

  console.log('Initializing background sync service...');

  // Load sync queue on startup
  store.dispatch(loadSyncQueue());

  // Listen to app state changes
  appStateSubscription = AppState.addEventListener(
    'change',
    handleAppStateChange
  );

  // Listen to network state changes
  netInfoSubscription = NetInfo.addEventListener(handleNetworkChange);

  isInitialized = true;
  console.log('Background sync service initialized');
};

/**
 * Cleanup background sync service
 */
export const cleanupBackgroundSync = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  if (netInfoSubscription && typeof netInfoSubscription === 'function') {
    netInfoSubscription();
    netInfoSubscription = null;
  }

  isInitialized = false;
  console.log('Background sync service cleaned up');
};

/**
 * Handle app state changes
 */
const handleAppStateChange = (nextAppState: AppStateStatus) => {
  console.log('App state changed to:', nextAppState);

  if (nextAppState === 'active') {
    // App came to foreground, trigger sync
    console.log('App became active, triggering sync...');
    triggerSync();
  }
};

/**
 * Handle network state changes
 */
const handleNetworkChange = (state: any) => {
  console.log('Network state changed:', {
    isConnected: state.isConnected,
    type: state.type,
  });

  if (state.isConnected) {
    // Network reconnected, trigger sync
    console.log('Network reconnected, triggering sync...');
    triggerSync();
  }
};

/**
 * Trigger sync operation
 */
export const triggerSync = async () => {
  try {
    const state = store.getState();
    const { queue, isSyncing } = state.sync;

    // Don't sync if already syncing
    if (isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    // Don't sync if queue is empty
    if (queue.length === 0) {
      console.log('Sync queue is empty, nothing to sync');
      return;
    }

    console.log(`Starting sync for ${queue.length} items...`);
    const result = await store.dispatch(processSyncQueue()).unwrap();
    console.log('Sync completed:', result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

/**
 * Manual sync trigger (can be called from UI)
 */
export const manualSync = async (): Promise<boolean> => {
  try {
    console.log('Manual sync triggered');
    await triggerSync();
    return true;
  } catch (error) {
    console.error('Manual sync failed:', error);
    return false;
  }
};

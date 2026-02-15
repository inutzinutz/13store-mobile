/**
 * Network Status Banner
 * Shows online/offline status and sync queue count
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { processSyncQueue } from '../store/syncSlice';

export default function NetworkStatusBanner() {
  const dispatch = useAppDispatch();
  const { queue, isSyncing } = useAppSelector((state) => state.sync);
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Subscribe to network state
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Show banner if offline or has pending items
    setShowBanner(!isOnline || queue.length > 0);
  }, [isOnline, queue.length]);

  const handleSync = async () => {
    if (isOnline && queue.length > 0) {
      await dispatch(processSyncQueue());
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Banner
      visible={showBanner}
      actions={
        isOnline && queue.length > 0
          ? [
              {
                label: isSyncing ? 'Syncing...' : 'Sync Now',
                onPress: handleSync,
                disabled: isSyncing,
              },
            ]
          : []
      }
      icon={isOnline ? 'cloud-sync' : 'cloud-off-outline'}
      style={[styles.banner, isOnline ? styles.onlineBanner : styles.offlineBanner]}
    >
      {isOnline ? (
        queue.length > 0 ? (
          <Text>
            {queue.length} {queue.length === 1 ? 'item' : 'items'} pending sync
          </Text>
        ) : (
          <Text>Connected - All synced</Text>
        )
      ) : (
        <Text>You are offline. Changes will sync when reconnected.</Text>
      )}
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: {
    elevation: 0,
  },
  onlineBanner: {
    backgroundColor: '#E3F2FD',
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
  },
});

/**
 * Sync Status Indicator
 * Small indicator showing sync status in the header
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text, Badge } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useAppSelector } from '../store/hooks';

interface SyncStatusIndicatorProps {
  onPress?: () => void;
}

export default function SyncStatusIndicator({
  onPress,
}: SyncStatusIndicatorProps) {
  const { queue, isSyncing } = useAppSelector((state) => state.sync);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const getIconName = () => {
    if (!isOnline) return 'cloud-off-outline';
    if (isSyncing) return 'cloud-sync';
    if (queue.length > 0) return 'cloud-upload-outline';
    return 'cloud-check-outline';
  };

  const getIconColor = () => {
    if (!isOnline) return '#FF9800';
    if (isSyncing) return '#2196F3';
    if (queue.length > 0) return '#FFC107';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon={getIconName()}
        iconColor={getIconColor()}
        size={24}
        onPress={onPress}
      />
      {queue.length > 0 && (
        <Badge style={styles.badge} size={18}>
          {queue.length}
        </Badge>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5722',
  },
});

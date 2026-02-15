/**
 * Offline Sync Queue Service
 * Manages offline operations and syncs when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, SYNC_CONFIG } from '../config';
import { SyncQueueItem, SyncOperation, SyncResource } from '../types/sync';

const SYNC_QUEUE_KEY = STORAGE_KEYS.SYNC_QUEUE;

/**
 * Load sync queue from storage
 */
export const loadSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error loading sync queue:', error);
    return [];
  }
};

/**
 * Save sync queue to storage
 */
export const saveSyncQueue = async (queue: SyncQueueItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
};

/**
 * Add item to sync queue
 */
export const addToSyncQueue = async (
  operation: SyncOperation,
  resource: SyncResource,
  data: any,
  resourceId?: string
): Promise<SyncQueueItem> => {
  const queue = await loadSyncQueue();

  const item: SyncQueueItem = {
    id: uuidv4(),
    operation,
    resource,
    resourceId,
    data,
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  queue.push(item);
  await saveSyncQueue(queue);

  return item;
};

/**
 * Remove item from sync queue
 */
export const removeFromSyncQueue = async (itemId: string): Promise<void> => {
  const queue = await loadSyncQueue();
  const filteredQueue = queue.filter((item) => item.id !== itemId);
  await saveSyncQueue(filteredQueue);
};

/**
 * Update sync queue item
 */
export const updateSyncQueueItem = async (
  itemId: string,
  updates: Partial<SyncQueueItem>
): Promise<void> => {
  const queue = await loadSyncQueue();
  const index = queue.findIndex((item) => item.id === itemId);

  if (index !== -1) {
    queue[index] = {
      ...queue[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveSyncQueue(queue);
  }
};

/**
 * Get pending items from sync queue
 */
export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const queue = await loadSyncQueue();
  return queue.filter(
    (item) =>
      item.status === 'pending' && item.retryCount < SYNC_CONFIG.MAX_RETRIES
  );
};

/**
 * Clear entire sync queue
 */
export const clearSyncQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
};

/**
 * Get sync queue statistics
 */
export const getSyncQueueStats = async () => {
  const queue = await loadSyncQueue();

  return {
    total: queue.length,
    pending: queue.filter((item) => item.status === 'pending').length,
    syncing: queue.filter((item) => item.status === 'syncing').length,
    error: queue.filter((item) => item.status === 'error').length,
    success: queue.filter((item) => item.status === 'success').length,
  };
};

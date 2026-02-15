/**
 * Offline Sync Types
 */

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncResource = 'customer' | 'deal' | 'product' | 'invoice';
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'error';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  resource: SyncResource;
  resourceId?: string; // For UPDATE and DELETE
  data: any; // The payload to send
  status: SyncStatus;
  retryCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncAt: string | null;
  error: string | null;
}

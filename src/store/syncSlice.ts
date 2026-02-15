/**
 * Sync Queue Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import { SyncState, SyncQueueItem, SyncOperation, SyncResource } from '../types/sync';
import * as syncQueue from '../services/syncQueue';
import { getApiKey } from '../services/auth';
import { API_CONFIG, SYNC_CONFIG } from '../config';

// Initial state
const initialState: SyncState = {
  queue: [],
  isSyncing: false,
  lastSyncAt: null,
  error: null,
};

// Async thunks
export const loadSyncQueue = createAsyncThunk(
  'sync/loadQueue',
  async () => {
    return await syncQueue.loadSyncQueue();
  }
);

export const addToQueue = createAsyncThunk(
  'sync/addToQueue',
  async ({
    operation,
    resource,
    data,
    resourceId,
  }: {
    operation: SyncOperation;
    resource: SyncResource;
    data: any;
    resourceId?: string;
  }) => {
    return await syncQueue.addToSyncQueue(operation, resource, data, resourceId);
  }
);

export const processSyncQueue = createAsyncThunk(
  'sync/processQueue',
  async (_, { rejectWithValue }) => {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new Error('No API key found');
      }

      const pendingItems = await syncQueue.getPendingSyncItems();
      const results = [];

      for (const item of pendingItems) {
        try {
          // Update status to syncing
          await syncQueue.updateSyncQueueItem(item.id, { status: 'syncing' });

          // Build API URL
          const url = buildApiUrl(item);

          // Make API request
          const response = await fetch(url, {
            method: getHttpMethod(item.operation),
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body:
              item.operation !== 'DELETE' ? JSON.stringify(item.data) : undefined,
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }

          // Mark as success and remove from queue
          await syncQueue.removeFromSyncQueue(item.id);
          results.push({ id: item.id, status: 'success' });
        } catch (error: any) {
          // Update retry count
          const retryCount = item.retryCount + 1;

          if (retryCount >= SYNC_CONFIG.MAX_RETRIES) {
            // Max retries reached, mark as error
            await syncQueue.updateSyncQueueItem(item.id, {
              status: 'error',
              error: error.message,
              retryCount,
            });
          } else {
            // Retry later
            await syncQueue.updateSyncQueueItem(item.id, {
              status: 'pending',
              error: error.message,
              retryCount,
            });
          }

          results.push({ id: item.id, status: 'error', error: error.message });
        }

        // Add delay between requests
        await new Promise((resolve) =>
          setTimeout(resolve, SYNC_CONFIG.RETRY_DELAY)
        );
      }

      return results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearQueue = createAsyncThunk('sync/clearQueue', async () => {
  await syncQueue.clearSyncQueue();
});

// Helper functions
function buildApiUrl(item: SyncQueueItem): string {
  const { resource, resourceId, operation } = item;
  let url = `${API_CONFIG.BASE_URL}/${resource}s`;

  if (operation === 'UPDATE' || operation === 'DELETE') {
    url += `/${resourceId}`;
  }

  return url;
}

function getHttpMethod(operation: SyncOperation): string {
  switch (operation) {
    case 'CREATE':
      return 'POST';
    case 'UPDATE':
      return 'PATCH';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'GET';
  }
}

// Slice
const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load queue
    builder
      .addCase(loadSyncQueue.fulfilled, (state, action) => {
        state.queue = action.payload;
      });

    // Add to queue
    builder
      .addCase(addToQueue.fulfilled, (state, action) => {
        state.queue.push(action.payload);
      });

    // Process queue
    builder
      .addCase(processSyncQueue.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(processSyncQueue.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSyncAt = new Date().toISOString();
        
        // Remove successful items from state
        const successIds = action.payload
          .filter((r: any) => r.status === 'success')
          .map((r: any) => r.id);
        
        state.queue = state.queue.filter(
          (item) => !successIds.includes(item.id)
        );
      })
      .addCase(processSyncQueue.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // Clear queue
    builder.addCase(clearQueue.fulfilled, (state) => {
      state.queue = [];
    });
  },
});

export const { clearError } = syncSlice.actions;
export default syncSlice.reducer;

/**
 * Hook for background offline queue synchronization and online status
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { OfflineStorage } from '@/services/offlineStorage';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const checkPending = useCallback(async () => {
    const queue = await OfflineStorage.getOfflineQueue();
    setPendingCount(queue.length);
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await api.syncOfflineQueue();
      await checkPending();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, checkPending]);

  useEffect(() => {
    checkPending();
    const interval = setInterval(() => {
      checkPending();
      syncNow();
    }, 30000); // Check and auto-sync every 30 seconds
    return () => clearInterval(interval);
  }, [checkPending, syncNow]);

  return {
    isSyncing,
    pendingCount,
    syncNow,
    checkPending,
  };
}

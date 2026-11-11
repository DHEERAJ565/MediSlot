import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosClient';

/**
 * ============================================================================
 * UNIT III & V: Custom Hook — useQueuePolling
 * ============================================================================
 * Demonstrates:
 * - Data fetching side-effect abstraction.
 * - useCallback for referential equality and preventing infinite effect loops.
 * - useRef to maintain polling interval ID across renders without triggering re-render.
 * - Effect cleanup to avoid memory leaks on unmount.
 * - Declarative loading, error, and data state handling.
 *
 * @param {string} endpoint - API route to poll (e.g., '/queue/all/live' or '/queue/my-token-status')
 * @param {number} intervalMs - Polling interval (defaults to 6000ms)
 * @param {boolean} enabled - Whether polling is currently active
 */
export const useQueuePolling = (endpoint, intervalMs = 6000, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Stable fetch callback using useCallback
  const refetch = useCallback(async () => {
    if (!endpoint || !enabled) return;
    try {
      const res = await api.get(endpoint);
      if (res.data.success) {
        setData(res.data);
        setError(null);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error(`Polling error at ${endpoint}:`, err);
      setError(err.response?.data?.message || 'Failed to sync queue data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial immediate fetch
    refetch();

    // Setup recurring polling interval
    const intervalId = setInterval(refetch, intervalMs);

    // Cleanup interval on unmount or dependency change
    return () => {
      clearInterval(intervalId);
    };
  }, [refetch, intervalMs, enabled]);

  return { data, loading, error, lastSynced, refetch };
};

export default useQueuePolling;

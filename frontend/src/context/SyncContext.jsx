import { useEffect, useState, useRef, useCallback } from 'react';
import { gmailService } from '../services/gmailService';
import { useAuth } from '../hooks/useAuth';
import { SyncContext } from './SyncContext';

const SYNC_COOLDOWN_MS = 90 * 1000;
const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

export function SyncProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const syncInProgressRef = useRef(false);
  const lastSyncRef = useRef(null);
  const listenersRef = useRef(new Set());

  const subscribe = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback);
  }, []);

  const emitSyncComplete = useCallback((result) => {
    listenersRef.current.forEach((cb) => {
      try { cb(result); } catch { /* ignore */ }
    });
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    setStatusLoading(true);
    try {
      const status = await gmailService.getStatus();
      setIsConnected(!!status.connected);
      setGmailEmail(status.email || null);
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  }, [isAuthenticated]);

  const syncNow = useCallback(async (maxResults = 20, silent = false) => {
    if (!isAuthenticated) return { skipped: true, reason: 'not-auth' };
    if (syncInProgressRef.current) return { skipped: true, reason: 'in-progress' };

    syncInProgressRef.current = true;
    if (!silent) setIsSyncing(true);

    try {
      const result = await gmailService.syncEmails(maxResults);
      const now = Date.now();
      lastSyncRef.current = now;
      setLastSyncTime(now);
      setLastResult(result);
      emitSyncComplete(result);
      return result;
    } catch (err) {
      if (!silent) console.error('Sync failed:', err);
      return { error: err.message };
    } finally {
      syncInProgressRef.current = false;
      if (!silent) setIsSyncing(false);
    }
  }, [isAuthenticated, emitSyncComplete]);

  const connect = useCallback(async () => {
    const { auth_url } = await gmailService.getAuthUrl();
    window.location.href = auth_url;
  }, []);

  const disconnect = useCallback(async () => {
    await gmailService.disconnect();
    setIsConnected(false);
    setGmailEmail(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) {
        setIsConnected(false);
        setGmailEmail(null);
        setStatusLoading(false);
        lastSyncRef.current = null;
        setLastSyncTime(null);
        return;
      }
      await refreshStatus();
    };
    run();
  }, [isAuthenticated, refreshStatus]);

  useEffect(() => {
    const handleOAuthReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const gmailParam = params.get('gmail');
      const emailParam = params.get('email');

      if (gmailParam === 'success') {
        setIsConnected(true);
        setGmailEmail(emailParam);
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => syncNow(30, true), 500);
      } else if (gmailParam === 'error') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    handleOAuthReturn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      const since = lastSyncRef.current ? now - lastSyncRef.current : Infinity;
      if (since > SYNC_COOLDOWN_MS) {
        syncNow(20, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [isAuthenticated, isConnected, syncNow]);

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncNow(20, true);
      }
    }, AUTO_SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, isConnected, syncNow]);

  return (
    <SyncContext.Provider
      value={{
        isConnected,
        gmailEmail,
        isSyncing,
        statusLoading,
        lastSyncTime,
        lastResult,
        refreshStatus,
        syncNow,
        connect,
        disconnect,
        subscribe,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
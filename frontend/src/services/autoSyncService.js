import { gmailService } from './gmailService';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Auto-sync Gmail in the background.
 * Skips if:
 * - Gmail not connected
 * - Last sync was less than 5 minutes ago
 */
export async function autoSyncOnLogin(userId) {
  if (!userId) return { skipped: true, reason: 'no-user' };

  try {
    // Check Gmail connection
    const status = await gmailService.getStatus();
    if (!status.connected) {
      return { skipped: true, reason: 'gmail-not-connected' };
    }

    // Check cooldown
    const lastSyncKey = `finsight-last-sync-${userId}`;
    const lastSync = localStorage.getItem(lastSyncKey);
    const now = Date.now();

    if (lastSync && now - parseInt(lastSync) < SYNC_COOLDOWN_MS) {
      return { skipped: true, reason: 'cooldown' };
    }

    // Run sync
    const result = await gmailService.syncEmails(10);

    // Save timestamp
    localStorage.setItem(lastSyncKey, now.toString());

    return {
      skipped: false,
      synced: result.synced,
      skipped_duplicates: result.skipped_duplicates,
    };
  } catch (err) {
    console.warn('Auto-sync failed:', err.message);
    return { skipped: true, reason: 'error', error: err.message };
  }
}
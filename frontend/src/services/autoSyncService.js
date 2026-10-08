import { gmailService } from './gmailService';

const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes now

/**
 * Auto-sync Gmail in the background.
 * Skips if:
 * - Gmail not connected
 * - Last sync was less than 2 minutes ago
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

/**
 * Force-reset the cooldown (for manual testing)
 */
export function resetSyncCooldown(userId) {
  if (!userId) return;
  localStorage.removeItem(`finsight-last-sync-${userId}`);
}
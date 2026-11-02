import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationContext } from './NotificationContext';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const notificationsRef = useRef([]);
  const hasInitialized = useRef(false);

  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      
      // If this is a background poll AND we have initialized, check for new items
      if (isPolling && hasInitialized.current && notificationsRef.current.length > 0) {
        // Find items in the new data that don't exist in the old ref
        const newNotifs = data.filter(n => !notificationsRef.current.some(old => old.id === n.id));
        
        if (newNotifs.length > 0) {
          newNotifs.forEach(notif => {
            // Trigger the popup toast
            setToasts((prev) => [notif, ...prev]);
            setTimeout(() => {
              setToasts((prev) => prev.filter(t => t.id !== notif.id));
            }, 5000);
          });
        }
      }
      
      setNotifications(data);
      notificationsRef.current = data;

      // Mark as initialized on first successful fetch
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        setLoading(false);
      }

    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [isAuthenticated]);

  // Initial fetch and polling setup
  useEffect(() => {
    Promise.resolve().then(() => {
      if (!isAuthenticated) {
        setNotifications([]);
        notificationsRef.current = [];
        hasInitialized.current = false;
        setLoading(false);
        return;
      }
      fetchNotifications(false);
    });

    if (!isAuthenticated) return;

    // Poll every 10 seconds to check for new notifications (was 15)
    const interval = setInterval(() => {
      fetchNotifications(true); // Pass true to indicate this is a polling check
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback(({ title, message, type = 'info' }) => {
    const localToast = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      created_at: new Date().toISOString()
    };

    setToasts((prev) => [localToast, ...prev]);
    setTimeout(() => removeToast(localToast.id), 5000);
    
    // Refresh list from DB
    fetchNotifications(false);
  }, [removeToast, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    notificationsRef.current = [];
    try {
      await notificationService.clearAll();
    } catch (err) {
      console.error("Failed to clear notifications", err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        toasts, 
        addNotification, 
        removeToast, 
        markAllAsRead, 
        clearAll, 
        unreadCount,
        loading 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
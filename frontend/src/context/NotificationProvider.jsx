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

  const fetchNotifications = useCallback(async (showToastForNew = false) => {
    if (!isAuthenticated) return;
    try {
      // SECURITY: The backend only returns notifications where user_id = auth.uid()
      // The RLS policies enforce this at the database level.
      const data = await notificationService.getNotifications();
      
      if (showToastForNew && notificationsRef.current.length > 0) {
        const newNotifs = data.filter(n => !notificationsRef.current.find(old => old.id === n.id));
        
        newNotifs.forEach(notif => {
          setToasts((prev) => [notif, ...prev]);
          setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== notif.id));
          }, 5000);
        });
      }
      
      setNotifications(data);
      notificationsRef.current = data;
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch and polling setup
  useEffect(() => {
    // We use a microtask here to avoid the "setState synchronously in effect" warning
    Promise.resolve().then(() => {
      if (!isAuthenticated) {
        setNotifications([]);
        notificationsRef.current = [];
        setLoading(false);
        return;
      }
      fetchNotifications(false);
    });

    if (!isAuthenticated) return;

    // Poll every 15 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 15000);

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

    setTimeout(() => {
      removeToast(localToast.id);
    }, 5000);
    
    fetchNotifications(false);
  }, [removeToast, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead();
      // Refresh from DB to ensure accuracy
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(async () => {
    // Optimistic UI update
    setNotifications([]);
    notificationsRef.current = [];
    try {
      await notificationService.clearAll();
    } catch (err) {
      console.error("Failed to clear notifications", err);
      // Re-fetch if it failed, to restore the UI
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
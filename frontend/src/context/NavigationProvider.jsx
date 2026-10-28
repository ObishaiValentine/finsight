import { useState, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]); // For the bell dropdown
  const [toasts, setToasts] = useState([]); // For the floating popups

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback(({ title, message, type = 'info' }) => {
    const id = Date.now().toString();
    const newNotif = {
      id,
      title,
      message,
      type,
      read: false,
      timestamp: new Date(),
    };

    // Add to bell dropdown
    setNotifications((prev) => [newNotif, ...prev]);

    // Add to floating toasts
    setToasts((prev) => [...prev, newNotif]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, toasts, addNotification, removeToast, markAllAsRead, clearAll, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
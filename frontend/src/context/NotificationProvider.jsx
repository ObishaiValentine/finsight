import { useState, useEffect, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';

const STORAGE_KEY = 'finsight-notifications';

export function NotificationProvider({ children }) {
  // Initialize from localStorage
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

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

    setNotifications((prev) => [newNotif, ...prev]);
    setToasts((prev) => [...prev, newNotif]);

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
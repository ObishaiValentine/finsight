import { useState, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

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
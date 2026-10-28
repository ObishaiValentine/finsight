import { useState, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(({ title, message, type = 'info' }) => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      type, // 'success', 'error', 'info'
      read: false,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllAsRead, clearAll, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
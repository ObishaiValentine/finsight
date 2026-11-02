import api from './api';

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markAllAsRead() {
    await api.post('/notifications/mark-read');
  },

  async clearAll() {
    await api.delete('/notifications');
  }
};
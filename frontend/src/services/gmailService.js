import api from './api';

export const gmailService = {
  /**
   * Get Google OAuth URL for connecting Gmail.
   */
  async getAuthUrl() {
    const response = await api.get('/gmail/connect');
    return response.data;
  },

  /**
   * Check if user's Gmail is connected.
   */
  async getStatus() {
    const response = await api.get('/gmail/status');
    return response.data;
  },

  /**
   * Sync Gmail bank alerts into transactions.
   */
  async syncEmails(maxResults = 50) {
    const response = await api.post(`/gmail/sync?max_results=${maxResults}`);
    return response.data;
  },

  /**
   * Disconnect Gmail from user's account.
   */
  async disconnect() {
    const response = await api.post('/gmail/disconnect');
    return response.data;
  },
};
import api from './api';

export const accountService = {
  /**
   * Get all accounts for current user.
   */
  async getAccounts() {
    const response = await api.get('/accounts');
    return response.data;
  },

  /**
   * Create a new bank account.
   */
  async createAccount(data) {
    const response = await api.post('/accounts', data);
    return response.data;
  },

  /**
   * Get a single account.
   */
  async getAccount(id) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  /**
   * Update an account.
   */
  async updateAccount(id, data) {
    const response = await api.patch(`/accounts/${id}`, data);
    return response.data;
  },

  /**
   * Delete an account (soft delete).
   */
  async deleteAccount(id) {
    await api.delete(`/accounts/${id}`);
  },

    /**
   * Get archived accounts.
   */
  async getArchivedAccounts() {
    const response = await api.get('/accounts/archived');
    return response.data;
  },

  /**
   * Restore a soft-deleted account.
   */
  async restoreAccount(id) {
    const response = await api.post(`/accounts/${id}/restore`);
    return response.data;
  },
};
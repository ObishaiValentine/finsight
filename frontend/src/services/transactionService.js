import api from './api';

export const transactionService = {
  /**
   * Get paginated transactions for current user.
   */
  async getTransactions(params = {}) {
    const { page = 1, pageSize = 20, transactionType, bankName } = params;
    const query = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (transactionType) query.append('transaction_type', transactionType);
    if (bankName) query.append('bank_name', bankName);

    const response = await api.get(`/transactions?${query.toString()}`);
    return response.data;
  },

  /**
   * Get stats for dashboard.
   */
  async getStats() {
    const response = await api.get('/transactions/stats');
    return response.data;
  },

  /**
   * Get a single transaction.
   */
  async getTransaction(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Delete a transaction.
   */
  async deleteTransaction(id) {
    await api.delete(`/transactions/${id}`);
  },

  /**
   * Parse and save an alert.
   */
  async parseAndSave(text) {
    const response = await api.post('/transactions/parse-and-save', { text });
    return response.data;
  },

  /**
   * Get analytics for charts.
   */
  async getAnalytics() {
    const response = await api.get('/transactions/analytics');
    return response.data;
  },

  /**
   * Update transaction category (NEW).
   */
  async updateCategory(id, category) {
    const response = await api.patch(`/transactions/${id}`, { category });
    return response.data;
  },
};
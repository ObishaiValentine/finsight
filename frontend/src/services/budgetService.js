import api from './api';

export const budgetService = {
  async getBudgets() {
    const response = await api.get('/budgets');
    return response.data;
  },

  async setBudget(category, monthly_limit) {
    const response = await api.post('/budgets', { category, monthly_limit });
    return response.data;
  },

  async deleteBudget(id) {
    await api.delete(`/budgets/${id}`);
  }
};
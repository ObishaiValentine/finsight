import api from './api';

export const authService = {
  async signup(email, password, fullName) {
    const response = await api.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  async updatePreferences(data) {
    const response = await api.patch('/auth/preferences', data);
    return response.data;
  },

  async updateNotifications(data) {
    const response = await api.patch('/auth/notifications', data);
    return response.data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/auth/account');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('finsight-token');
    localStorage.removeItem('finsight-user');
  },
};
import api from './api';

export const parserService = {
  /**
   * Parse a single bank alert.
   * @param {string} text - The bank alert email body
   * @returns {Promise<Object>} Parsed transaction with confidence score
   */
  async parseAlert(text) {
    const response = await api.post('/parser/parse', { text });
    return response.data;
  },

  /**
   * Parse multiple alerts at once.
   * @param {string[]} texts - Array of alert texts
   * @returns {Promise<Array>} Array of parsed results
   */
  async parseBatch(texts) {
    const payload = texts.map((text) => ({ text }));
    const response = await api.post('/parser/parse-batch', payload);
    return response.data;
  },

  /**
   * Get all sample alerts.
   */
  async getSamples() {
    const response = await api.get('/parser/samples');
    return response.data;
  },

  /**
   * Parse a sample alert by ID.
   */
  async parseSample(id) {
    const response = await api.get(`/parser/parse-sample/${id}`);
    return response.data;
  },
};
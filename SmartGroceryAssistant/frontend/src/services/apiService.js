import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Shopping List APIs
  async getShoppingList() {
    const response = await api.get('/shopping-list');
    return response.data;
  },

  async addItemToList(item) {
    const response = await api.post('/shopping-list/items', item);
    return response.data;
  },

  async removeItemFromList(itemName, category = null) {
    const response = await api.delete(`/shopping-list/items/${encodeURIComponent(itemName)}`, {
      data: { category }
    });
    return response.data;
  },

  async updateItemQuantity(itemName, quantity, category = null) {
    const response = await api.put(`/shopping-list/items/${encodeURIComponent(itemName)}/quantity`, {
      quantity,
      category
    });
    return response.data;
  },

  async clearShoppingList() {
    const response = await api.delete('/shopping-list/clear');
    return response.data;
  },

  // Purchase History APIs
  async getPurchaseHistory() {
    const response = await api.get('/purchase-history');
    return response.data;
  },

  async addPurchase(item) {
    const response = await api.post('/purchase-history/items', item);
    return response.data;
  },

  async markItemsAsPurchased() {
    const response = await api.post('/purchase-history/mark-purchased');
    return response.data;
  },

  async getPurchaseStats() {
    const response = await api.get('/purchase-history/stats');
    return response.data;
  },

  // Suggestions APIs
  async getSuggestions() {
    const response = await api.get('/suggestions');
    return response.data;
  },

  async getShoppingPatterns() {
    const response = await api.get('/suggestions/patterns');
    return response.data;
  },

  // Health Recommendations APIs
  async getHealthyAlternative(itemName) {
    const response = await api.get(`/health/alternatives/${encodeURIComponent(itemName)}`);
    return response.data;
  },

  async getListHealthRating() {
    const response = await api.get('/health/list-rating');
    return response.data;
  },

  async getHealthSuggestions() {
    const response = await api.get('/health/suggestions');
    return response.data;
  },

  async getNutrientBoosters() {
    const response = await api.get('/health/nutrient-boosters');
    return response.data;
  },

  // Expiration Tracking APIs
  async checkExpiringItems(days = 7) {
    const response = await api.get(`/expiration/check?days=${days}`);
    return response.data;
  },

  async getExpirationReminders() {
    const response = await api.get('/expiration/reminders');
    return response.data;
  },

  async getMealSuggestions() {
    const response = await api.get('/expiration/meal-suggestions');
    return response.data;
  },

  async getExpirationSummary() {
    const response = await api.get('/expiration/summary');
    return response.data;
  },

  // Data Management APIs
  async getDataSummary() {
    const response = await api.get('/data/summary');
    return response.data;
  },

  async backupData() {
    const response = await api.post('/data/backup');
    return response.data;
  },

  async clearAllData() {
    const response = await api.delete('/data/clear');
    return response.data;
  },

  async addSampleData() {
    const response = await api.post('/data/sample');
    return response.data;
  },

  // User Preferences APIs
  async getPreferences() {
    const response = await api.get('/preferences');
    return response.data;
  },

  async updatePreferences(preferences) {
    const response = await api.put('/preferences', preferences);
    return response.data;
  },
};

export default apiService;
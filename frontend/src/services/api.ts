import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface GroceryItem {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiration_days: number;
    price: number;
    is_organic: boolean;
    purchase_date?: string;
    last_purchased?: string;
    purchase_frequency?: number;
}

export interface ShoppingListResponse {
    items: GroceryItem[];
}

export interface SuggestionItem {
    name: string;
    category: string;
    reason: string;
    priority: number;
}

export interface Analytics {
    total_spent: number;
    total_items: number;
    shopping_trips: number;
    avg_per_trip: number;
    category_breakdown: Record<string, number>;
    monthly_trends: Record<string, number>;
}

// Shopping List API
export const shoppingListApi = {
    getList: () => api.get<ShoppingListResponse>('/shopping-list'),
    addItem: (item: Omit<GroceryItem, 'purchase_date'>) => api.post('/shopping-list/items', item),
    removeItem: (name: string, category?: string) =>
        api.delete(`/shopping-list/items/${encodeURIComponent(name)}`, {
            data: category ? { category } : {}
        }),
    updateQuantity: (name: string, quantity: number, category?: string) =>
        api.put(`/shopping-list/items/${encodeURIComponent(name)}/quantity`, {
            quantity,
            category
        }),
    clearList: () => api.delete('/shopping-list/clear'),
    getSummary: () => api.get('/shopping-list/summary'),
};

// Suggestions API
export const suggestionsApi = {
    getSuggestions: () => api.get<SuggestionItem[]>('/suggestions'),
    getPatterns: () => api.get('/suggestions/patterns'),
    refreshSuggestions: () => api.post('/suggestions/refresh'),
};

// Purchase History API
export const purchaseHistoryApi = {
    getHistory: () => api.get('/purchase-history'),
    addPurchase: (item: GroceryItem) => api.post('/purchase-history/items', item),
    checkRecentPurchase: (itemName: string) => api.get(`/purchase-history/check-recent/${encodeURIComponent(itemName)}`),
};

// Expiration API
export const expirationApi = {
    checkExpiring: (days: number = 7) => api.get(`/expiration/check?days=${days}`),
    getReminders: () => api.get('/expiration/reminders'),
    getMealSuggestions: () => api.get('/expiration/meal-suggestions'),
};

// Analytics API
export const analyticsApi = {
    getAnalytics: () => api.get<Analytics>('/analytics'),
    getCategoryAnalytics: () => api.get('/analytics/categories'),
    getMonthlyAnalytics: () => api.get('/analytics/monthly'),
    getSpendingAnalytics: () => api.get('/analytics/spending'),
};

// Health API
export const healthApi = {
    checkHealth: () => api.get('/health'),
};

export default api;
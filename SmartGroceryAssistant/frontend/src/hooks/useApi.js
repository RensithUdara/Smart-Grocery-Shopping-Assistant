import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

export const useShoppingList = () => {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const data = await apiService.getShoppingList();
      setShoppingList(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item) => {
    try {
      await apiService.addItemToList(item);
      await fetchShoppingList();
      toast.success('Item added to shopping list');
    } catch (err) {
      toast.error('Failed to add item');
      throw err;
    }
  };

  const removeItem = async (itemName, category) => {
    try {
      await apiService.removeItemFromList(itemName, category);
      await fetchShoppingList();
      toast.success('Item removed from list');
    } catch (err) {
      toast.error('Failed to remove item');
      throw err;
    }
  };

  const updateQuantity = async (itemName, quantity, category) => {
    try {
      await apiService.updateItemQuantity(itemName, quantity, category);
      await fetchShoppingList();
      toast.success('Quantity updated');
    } catch (err) {
      toast.error('Failed to update quantity');
      throw err;
    }
  };

  const clearList = async () => {
    try {
      await apiService.clearShoppingList();
      await fetchShoppingList();
      toast.success('Shopping list cleared');
    } catch (err) {
      toast.error('Failed to clear list');
      throw err;
    }
  };

  const markAsPurchased = async () => {
    try {
      await apiService.markItemsAsPurchased();
      await fetchShoppingList();
      toast.success('Items marked as purchased');
    } catch (err) {
      toast.error('Failed to mark items as purchased');
      throw err;
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  return {
    shoppingList,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearList,
    markAsPurchased,
    refresh: fetchShoppingList,
  };
};

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const [suggestionsData, patternsData] = await Promise.all([
        apiService.getSuggestions(),
        apiService.getShoppingPatterns(),
      ]);
      setSuggestions(suggestionsData);
      setPatterns(patternsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    patterns,
    loading,
    error,
    refresh: fetchSuggestions,
  };
};

export const useHealthRecommendations = () => {
  const [healthRating, setHealthRating] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [nutrientBoosters, setNutrientBoosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const [ratingData, suggestionsData, boostersData] = await Promise.all([
        apiService.getListHealthRating(),
        apiService.getHealthSuggestions(),
        apiService.getNutrientBoosters(),
      ]);
      setHealthRating(ratingData);
      setSuggestions(suggestionsData);
      setNutrientBoosters(boostersData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load health recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getAlternative = async (itemName) => {
    try {
      const alternative = await apiService.getHealthyAlternative(itemName);
      return alternative;
    } catch (err) {
      toast.error('No healthy alternative found');
      throw err;
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return {
    healthRating,
    suggestions,
    nutrientBoosters,
    loading,
    error,
    getAlternative,
    refresh: fetchHealthData,
  };
};

export const useExpirationTracker = () => {
  const [expiringItems, setExpiringItems] = useState({});
  const [reminders, setReminders] = useState([]);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpirationData = async () => {
    try {
      setLoading(true);
      const [itemsData, remindersData, mealsData, summaryData] = await Promise.all([
        apiService.checkExpiringItems(),
        apiService.getExpirationReminders(),
        apiService.getMealSuggestions(),
        apiService.getExpirationSummary(),
      ]);
      setExpiringItems(itemsData);
      setReminders(remindersData);
      setMealSuggestions(mealsData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load expiration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpirationData();
  }, []);

  return {
    expiringItems,
    reminders,
    mealSuggestions,
    summary,
    loading,
    error,
    refresh: fetchExpirationData,
  };
};

export const useAnalytics = () => {
  const [purchaseStats, setPurchaseStats] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        apiService.getPurchaseStats(),
        apiService.getPurchaseHistory(),
      ]);
      setPurchaseStats(statsData);
      setPurchaseHistory(historyData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    purchaseStats,
    purchaseHistory,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};
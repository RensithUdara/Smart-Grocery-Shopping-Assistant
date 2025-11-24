// UI Utility functions for the Smart Grocery Shopping Assistant

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitalizes the first letter of a string only
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formats category names for better display
 * @param category - The category to format
 * @returns The formatted category name
 */
export const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'fruits': 'Fruits & Vegetables',
    'vegetables': 'Fruits & Vegetables', 
    'meat': 'Meat & Poultry',
    'poultry': 'Meat & Poultry',
    'dairy': 'Dairy & Eggs',
    'eggs': 'Dairy & Eggs',
    'bakery': 'Bakery',
    'bread': 'Bakery',
    'pantry': 'Pantry',
    'grains': 'Pantry',
    'beverages': 'Beverages',
    'drinks': 'Beverages',
    'frozen': 'Frozen',
    'snacks': 'Snacks',
    'personal care': 'Personal Care',
    'household': 'Household',
    'cleaning': 'Household'
  };

  const lowerCategory = category.toLowerCase();
  return categoryMap[lowerCategory] || capitalizeWords(category);
};

/**
 * Gets the appropriate color for a category chip
 * @param category - The category name
 * @returns The hex color code
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Fruits & Vegetables': '#4CAF50',
    'Meat & Poultry': '#F44336',
    'Dairy & Eggs': '#2196F3',
    'Bakery': '#FF9800',
    'Pantry': '#795548',
    'Beverages': '#9C27B0',
    'Frozen': '#00BCD4',
    'Snacks': '#FFC107',
    'Personal Care': '#E91E63',
    'Household': '#607D8B',
  };
  
  const formattedCategory = formatCategory(category);
  return colors[formattedCategory] || '#757575';
};

/**
 * Formats price for display
 * @param price - The price number
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Formats quantity with unit for display
 * @param quantity - The quantity number
 * @param unit - The unit string
 * @returns Formatted quantity string
 */
export const formatQuantity = (quantity: number, unit: string): string => {
  const unitSingular = unit.replace(/s$/, ''); // Remove trailing 's'
  const displayUnit = quantity === 1 ? unitSingular : unit;
  return `${quantity} ${displayUnit}`;
};

/**
 * Calculates days since a date
 * @param dateString - The date string
 * @returns Number of days since the date
 */
export const daysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Checks if an item was purchased recently (within specified days)
 * @param lastPurchased - The last purchase date string
 * @param warningDays - Number of days to consider as "recent" (default: 7)
 * @returns Object with warning status and message
 */
export const checkRecentPurchase = (
  lastPurchased?: string, 
  itemName?: string,
  warningDays: number = 30
): { shouldWarn: boolean; message: string; daysSince: number } => {
  if (!lastPurchased) {
    return { shouldWarn: false, message: '', daysSince: 0 };
  }

  const days = daysSince(lastPurchased);
  const capitalizedName = itemName ? capitalizeWords(itemName) : 'this item';
  
  if (days <= warningDays) {
    return {
      shouldWarn: true,
      message: `You bought ${capitalizedName} ${days} day${days === 1 ? '' : 's'} ago`,
      daysSince: days
    };
  }

  return { shouldWarn: false, message: '', daysSince: days };
};

/**
 * Gets appropriate icon for category
 * @param category - The category name
 * @returns Material-UI icon name
 */
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Fruits & Vegetables': 'LocalFlorist',
    'Meat & Poultry': 'Restaurant',
    'Dairy & Eggs': 'LocalDrink',
    'Bakery': 'Cake',
    'Pantry': 'Kitchen',
    'Beverages': 'LocalCafe',
    'Frozen': 'AcUnit',
    'Snacks': 'Cookie',
    'Personal Care': 'Face',
    'Household': 'Home',
  };
  
  const formattedCategory = formatCategory(category);
  return icons[formattedCategory] || 'ShoppingBasket';
};

/**
 * Generates a friendly message for purchase frequency
 * @param frequency - Purchase frequency in days
 * @returns Friendly message
 */
export const getFrequencyMessage = (frequency?: number): string => {
  if (!frequency) return '';
  
  if (frequency <= 3) return 'You buy this very frequently';
  if (frequency <= 7) return 'You buy this weekly';
  if (frequency <= 14) return 'You buy this bi-weekly';
  if (frequency <= 30) return 'You buy this monthly';
  return 'You buy this occasionally';
};

export default {
  capitalizeWords,
  capitalizeFirst,
  formatCategory,
  getCategoryColor,
  formatPrice,
  formatQuantity,
  daysSince,
  checkRecentPurchase,
  getCategoryIcon,
  getFrequencyMessage,
};
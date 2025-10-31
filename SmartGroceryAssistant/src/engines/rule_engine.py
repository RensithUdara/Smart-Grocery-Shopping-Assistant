from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import re
from ..models.grocery_item import GroceryItem
from ..models.shopping_list import ShoppingList
from ..models.purchase_history import PurchaseHistory

class RuleEngine:
    """
    Rule-based reasoning engine for smart grocery suggestions
    """
    
    def __init__(self):
        # Common item associations - when you buy X, you often need Y
        self.item_associations = {
            'pasta': ['pasta sauce', 'cheese', 'garlic'],
            'bread': ['butter', 'jam', 'cheese'],
            'cereal': ['milk'],
            'coffee': ['milk', 'sugar'],
            'tea': ['sugar', 'honey', 'lemon'],
            'rice': ['soy sauce', 'vegetables'],
            'chicken': ['vegetables', 'spices'],
            'fish': ['lemon', 'vegetables'],
            'potatoes': ['butter', 'cheese'],
            'salad': ['dressing', 'tomatoes', 'cucumber'],
            'yogurt': ['honey', 'fruits'],
            'oatmeal': ['fruits', 'honey', 'milk'],
        }
        
        # Category-based suggestions
        self.category_suggestions = {
            'dairy': ['milk', 'cheese', 'yogurt', 'butter'],
            'fruits': ['bananas', 'apples', 'oranges'],
            'vegetables': ['onions', 'tomatoes', 'carrots', 'potatoes'],
            'protein': ['chicken', 'fish', 'eggs', 'beans'],
            'grains': ['rice', 'pasta', 'bread', 'oats']
        }
        
        # Seasonal suggestions by month
        self.seasonal_items = {
            1: ['oranges', 'winter vegetables', 'soup ingredients'],  # January
            2: ['citrus fruits', 'warm beverages'],  # February
            3: ['spring vegetables', 'fresh herbs'],  # March
            4: ['asparagus', 'spring onions'],  # April
            5: ['strawberries', 'fresh greens'],  # May
            6: ['summer fruits', 'berries'],  # June
            7: ['tomatoes', 'summer vegetables'],  # July
            8: ['peaches', 'corn', 'zucchini'],  # August
            9: ['apples', 'autumn vegetables'],  # September
            10: ['pumpkins', 'squash', 'apples'],  # October
            11: ['root vegetables', 'cranberries'],  # November
            12: ['winter citrus', 'holiday spices']  # December
        }
    
    def generate_suggestions(self, shopping_list: ShoppingList, 
                           purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Generate intelligent suggestions based on multiple rules
        Returns list of suggestion dictionaries with item name, reason, and confidence
        """
        suggestions = []
        
        # Rule 1: Pattern-based suggestions from purchase history
        pattern_suggestions = self._get_pattern_suggestions(shopping_list, purchase_history)
        suggestions.extend(pattern_suggestions)
        
        # Rule 2: Association-based suggestions
        association_suggestions = self._get_association_suggestions(shopping_list)
        suggestions.extend(association_suggestions)
        
        # Rule 3: Seasonal suggestions
        seasonal_suggestions = self._get_seasonal_suggestions(shopping_list)
        suggestions.extend(seasonal_suggestions)
        
        # Rule 4: Category completion suggestions
        category_suggestions = self._get_category_suggestions(shopping_list, purchase_history)
        suggestions.extend(category_suggestions)
        
        # Rule 5: Expiration replacement suggestions
        expiration_suggestions = self._get_expiration_replacement_suggestions(purchase_history)
        suggestions.extend(expiration_suggestions)
        
        # Remove duplicates and items already in shopping list
        unique_suggestions = self._deduplicate_suggestions(suggestions, shopping_list)
        
        # Sort by confidence score
        unique_suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return unique_suggestions[:10]  # Return top 10 suggestions
    
    def _get_pattern_suggestions(self, shopping_list: ShoppingList, 
                               purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Suggest items based on purchase frequency patterns
        """
        suggestions = []
        recent_purchases = purchase_history.get_recent_purchases(60)  # Last 2 months
        
        # Get unique items from recent purchases
        unique_items = set(item.name for item in recent_purchases)
        
        for item_name in unique_items:
            # Skip if already in shopping list
            if shopping_list.find_item(item_name):
                continue
            
            should_suggest, reason = purchase_history.should_suggest_item(item_name)
            
            if should_suggest:
                # Find a recent purchase for category and other details
                recent_item = next(item for item in recent_purchases if item.name == item_name)
                
                suggestions.append({
                    'name': item_name,
                    'category': recent_item.category,
                    'reason': f"Pattern Analysis: {reason}",
                    'confidence': 0.8,
                    'rule_type': 'pattern'
                })
        
        return suggestions
    
    def _get_association_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Suggest items based on what's already in the shopping list
        """
        suggestions = []
        
        for item in shopping_list.items:
            item_name = item.name.lower()
            
            # Check if this item has associations
            for key, associated_items in self.item_associations.items():
                if key in item_name or item_name in key:
                    for associated_item in associated_items:
                        # Skip if already in shopping list
                        if shopping_list.find_item(associated_item):
                            continue
                        
                        suggestions.append({
                            'name': associated_item,
                            'category': self._guess_category(associated_item),
                            'reason': f"Goes well with {item.name}",
                            'confidence': 0.6,
                            'rule_type': 'association'
                        })
        
        return suggestions
    
    def _get_seasonal_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Suggest seasonal items based on current month
        """
        suggestions = []
        current_month = datetime.now().month
        
        if current_month in self.seasonal_items:
            seasonal_items = self.seasonal_items[current_month]
            
            for item_name in seasonal_items:
                # Skip if already in shopping list
                if shopping_list.find_item(item_name):
                    continue
                
                suggestions.append({
                    'name': item_name,
                    'category': self._guess_category(item_name),
                    'reason': f"Seasonal recommendation for {datetime.now().strftime('%B')}",
                    'confidence': 0.4,
                    'rule_type': 'seasonal'
                })
        
        return suggestions
    
    def _get_category_suggestions(self, shopping_list: ShoppingList, 
                                purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Suggest items to balance categories based on user preferences
        """
        suggestions = []
        
        # Get user's category preferences from history
        category_preferences = purchase_history.get_category_preferences()
        
        # Get current list categories
        current_categories = shopping_list.get_items_by_category()
        
        # Suggest items for underrepresented categories
        for category, purchase_count in category_preferences.items():
            if category not in current_categories and purchase_count > 3:  # User buys this category regularly
                # Suggest popular items from this category
                if category in self.category_suggestions:
                    for item_name in self.category_suggestions[category][:2]:  # Top 2 items
                        if shopping_list.find_item(item_name):
                            continue
                        
                        suggestions.append({
                            'name': item_name,
                            'category': category,
                            'reason': f"You often buy {category} items",
                            'confidence': 0.5,
                            'rule_type': 'category_balance'
                        })
        
        return suggestions
    
    def _get_expiration_replacement_suggestions(self, purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Suggest replacements for items that should be expiring soon
        """
        suggestions = []
        
        # Get items purchased in the last week (likely to expire soon)
        recent_purchases = purchase_history.get_recent_purchases(7)
        
        for item in recent_purchases:
            if item.is_expiring_soon:
                suggestions.append({
                    'name': item.name,
                    'category': item.category,
                    'reason': f"Replace expiring {item.name} (expires in {item.days_until_expiry} days)",
                    'confidence': 0.7,
                    'rule_type': 'expiration_replacement'
                })
        
        return suggestions
    
    def _deduplicate_suggestions(self, suggestions: List[Dict[str, any]], 
                               shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Remove duplicate suggestions and items already in shopping list
        """
        seen_items = set()
        unique_suggestions = []
        
        for suggestion in suggestions:
            item_name = suggestion['name'].lower().strip()
            
            # Skip if already seen or in shopping list
            if item_name in seen_items or shopping_list.find_item(item_name):
                continue
            
            seen_items.add(item_name)
            unique_suggestions.append(suggestion)
        
        return unique_suggestions
    
    def _guess_category(self, item_name: str) -> str:
        """
        Guess the category of an item based on its name
        """
        item_name = item_name.lower()
        
        # Mapping of keywords to categories
        category_keywords = {
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
            'fruits': ['apple', 'banana', 'orange', 'berry', 'grape', 'lemon', 'peach'],
            'vegetables': ['tomato', 'onion', 'carrot', 'potato', 'lettuce', 'spinach', 'broccoli'],
            'protein': ['chicken', 'beef', 'fish', 'egg', 'bean', 'tofu'],
            'grains': ['bread', 'rice', 'pasta', 'oat', 'cereal'],
            'beverages': ['juice', 'soda', 'tea', 'coffee', 'water'],
            'condiments': ['sauce', 'dressing', 'spice', 'salt', 'pepper', 'oil'],
            'snacks': ['chip', 'cookie', 'cracker', 'nut']
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in item_name:
                    return category
        
        return 'other'
    
    def analyze_shopping_patterns(self, purchase_history: PurchaseHistory) -> Dict[str, any]:
        """
        Analyze user's shopping patterns and provide insights
        """
        if not purchase_history.all_purchases:
            return {"message": "No purchase history available for analysis"}
        
        stats = purchase_history.get_summary_stats()
        most_purchased = purchase_history.get_most_purchased_items(5)
        category_prefs = purchase_history.get_category_preferences()
        
        # Calculate shopping frequency
        if stats['date_range']:
            start_date, end_date = stats['date_range']
            days_span = (end_date - start_date).days
            avg_items_per_week = (stats['total_purchases'] / max(days_span, 1)) * 7
        else:
            avg_items_per_week = 0
        
        return {
            'total_purchases': stats['total_purchases'],
            'unique_items': stats['unique_items'],
            'categories_shopped': stats['categories'],
            'avg_items_per_week': round(avg_items_per_week, 1),
            'top_items': most_purchased,
            'favorite_categories': sorted(category_prefs.items(), key=lambda x: x[1], reverse=True)[:3],
            'shopping_diversity': stats['unique_items'] / max(stats['total_purchases'], 1)
        }
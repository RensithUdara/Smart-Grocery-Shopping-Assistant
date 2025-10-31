from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from ..models.grocery_item import GroceryItem
from ..models.shopping_list import ShoppingList
from ..models.purchase_history import PurchaseHistory

class ExpirationTracker:
    """
    Tracks expiring items and provides reminders
    """
    
    def __init__(self):
        # Default expiration days for different categories
        self.default_expiration_days = {
            'dairy': 7,
            'meat': 3,
            'fish': 2,
            'fruits': 5,
            'vegetables': 7,
            'bread': 5,
            'eggs': 14,
            'leftovers': 3,
            'canned': 365,
            'frozen': 90,
            'dry_goods': 180
        }
        
        # Priority levels for expiration warnings
        self.priority_levels = {
            'urgent': 1,     # Expires today or tomorrow
            'warning': 3,    # Expires in 2-3 days
            'notice': 7      # Expires within a week
        }
    
    def check_expiring_items(self, purchase_history: PurchaseHistory, 
                           days_ahead: int = 7) -> Dict[str, List[GroceryItem]]:
        """
        Check for items expiring within specified days
        """
        current_time = datetime.now()
        cutoff_date = current_time + timedelta(days=days_ahead)
        
        expiring_items = {
            'expired': [],
            'urgent': [],
            'warning': [],
            'notice': []
        }
        
        # Check recent purchases that might be expiring
        recent_purchases = purchase_history.get_recent_purchases(30)  # Last 30 days
        
        for item in recent_purchases:
            days_until_expiry = item.days_until_expiry
            
            if item.is_expired:
                expiring_items['expired'].append(item)
            elif days_until_expiry <= self.priority_levels['urgent']:
                expiring_items['urgent'].append(item)
            elif days_until_expiry <= self.priority_levels['warning']:
                expiring_items['warning'].append(item)
            elif days_until_expiry <= self.priority_levels['notice']:
                expiring_items['notice'].append(item)
        
        return expiring_items
    
    def get_expiration_reminders(self, purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Generate expiration reminders with actionable advice
        """
        expiring_items = self.check_expiring_items(purchase_history)
        reminders = []
        
        # Expired items - highest priority
        for item in expiring_items['expired']:
            reminders.append({
                'item': item,
                'priority': 'HIGH',
                'message': f"⚠️ {item.name.title()} expired {abs(item.days_until_expiry)} days ago - discard immediately",
                'action': 'discard',
                'days_until_expiry': item.days_until_expiry
            })
        
        # Urgent items - expiring very soon
        for item in expiring_items['urgent']:
            if item.days_until_expiry == 0:
                message = f"🚨 {item.name.title()} expires today - use immediately"
            elif item.days_until_expiry == 1:
                message = f"⚡ {item.name.title()} expires tomorrow - use soon"
            else:
                message = f"⚠️ {item.name.title()} expires in {item.days_until_expiry} days"
            
            reminders.append({
                'item': item,
                'priority': 'HIGH',
                'message': message,
                'action': 'use_immediately',
                'days_until_expiry': item.days_until_expiry,
                'suggestions': self._get_usage_suggestions(item)
            })
        
        # Warning items - expiring soon
        for item in expiring_items['warning']:
            reminders.append({
                'item': item,
                'priority': 'MEDIUM',
                'message': f"📅 {item.name.title()} expires in {item.days_until_expiry} days - plan to use",
                'action': 'plan_usage',
                'days_until_expiry': item.days_until_expiry,
                'suggestions': self._get_usage_suggestions(item)
            })
        
        # Notice items - expiring within a week
        for item in expiring_items['notice']:
            reminders.append({
                'item': item,
                'priority': 'LOW',
                'message': f"📝 {item.name.title()} expires in {item.days_until_expiry} days",
                'action': 'monitor',
                'days_until_expiry': item.days_until_expiry
            })
        
        # Sort by priority and expiration date
        priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        reminders.sort(key=lambda x: (priority_order[x['priority']], x['days_until_expiry']))
        
        return reminders
    
    def suggest_meal_planning(self, expiring_items: List[GroceryItem]) -> List[Dict[str, any]]:
        """
        Suggest meal plans based on expiring items
        """
        if not expiring_items:
            return []
        
        # Group items by category for meal planning
        categories = {}
        for item in expiring_items:
            if item.category not in categories:
                categories[item.category] = []
            categories[item.category].append(item)
        
        meal_suggestions = []
        
        # Generate meal ideas based on available expiring ingredients
        if 'vegetables' in categories and 'protein' in categories:
            meal_suggestions.append({
                'meal_type': 'dinner',
                'title': 'Quick Stir-Fry',
                'ingredients': categories['vegetables'][:3] + categories['protein'][:1],
                'description': 'Use up vegetables and protein in a quick stir-fry',
                'prep_time': '15 minutes'
            })
        
        if 'fruits' in categories:
            meal_suggestions.append({
                'meal_type': 'breakfast/snack',
                'title': 'Fresh Fruit Smoothie',
                'ingredients': categories['fruits'][:3],
                'description': 'Blend expiring fruits into a nutritious smoothie',
                'prep_time': '5 minutes'
            })
        
        if 'dairy' in categories and 'vegetables' in categories:
            meal_suggestions.append({
                'meal_type': 'lunch',
                'title': 'Vegetable Omelet',
                'ingredients': categories['dairy'][:1] + categories['vegetables'][:2],
                'description': 'Use up dairy and vegetables in a hearty omelet',
                'prep_time': '10 minutes'
            })
        
        return meal_suggestions
    
    def get_storage_tips(self, item: GroceryItem) -> List[str]:
        """
        Get storage tips to extend item freshness
        """
        tips = []
        item_name = item.name.lower()
        category = item.category.lower()
        
        # General storage tips by category
        storage_advice = {
            'fruits': [
                "Store in cool, dry place or refrigerate",
                "Keep away from direct sunlight",
                "Don't wash until ready to eat"
            ],
            'vegetables': [
                "Store in refrigerator crisper drawer",
                "Keep in perforated bags for air circulation",
                "Separate from fruits to prevent early ripening"
            ],
            'dairy': [
                "Keep refrigerated at 40°F or below",
                "Store in original containers",
                "Check expiration dates regularly"
            ],
            'meat': [
                "Store in coldest part of refrigerator",
                "Use within 1-2 days or freeze",
                "Keep separate from other foods"
            ],
            'bread': [
                "Store in cool, dry place",
                "Freeze for longer storage",
                "Keep in airtight container"
            ]
        }
        
        if category in storage_advice:
            tips.extend(storage_advice[category])
        
        # Specific item tips
        specific_tips = {
            'bananas': ["Store at room temperature", "Separate from bunch to slow ripening"],
            'avocado': ["Store at room temperature to ripen", "Refrigerate when ripe"],
            'tomatoes': ["Store at room temperature for best flavor"],
            'potatoes': ["Store in dark, cool place", "Don't refrigerate"],
            'onions': ["Store in dry, well-ventilated area"],
            'garlic': ["Store in cool, dry place with good air circulation"]
        }
        
        for item_key, item_tips in specific_tips.items():
            if item_key in item_name:
                tips.extend(item_tips)
                break
        
        return tips[:3]  # Return top 3 tips
    
    def _get_usage_suggestions(self, item: GroceryItem) -> List[str]:
        """
        Get suggestions for how to use an expiring item
        """
        suggestions = []
        item_name = item.name.lower()
        category = item.category.lower()
        
        # Category-based suggestions
        if category == 'fruits':
            suggestions.extend([
                "Make a smoothie or juice",
                "Add to yogurt or cereal",
                "Bake into muffins or bread"
            ])
        elif category == 'vegetables':
            suggestions.extend([
                "Add to stir-fry or soup",
                "Make a salad",
                "Roast or steam as side dish"
            ])
        elif category == 'dairy':
            if 'milk' in item_name:
                suggestions.extend([
                    "Use in cereal or coffee",
                    "Make pancakes or smoothies",
                    "Bake into recipes"
                ])
            elif 'cheese' in item_name:
                suggestions.extend([
                    "Add to sandwiches or salads",
                    "Make grilled cheese",
                    "Use in pasta dishes"
                ])
        elif category == 'meat':
            suggestions.extend([
                "Cook tonight's dinner",
                "Freeze for later use",
                "Add to pasta or rice dish"
            ])
        elif category == 'bread':
            suggestions.extend([
                "Make toast or sandwiches",
                "Use for breadcrumbs",
                "Make French toast"
            ])
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def estimate_expiration_date(self, item_name: str, category: str, 
                               purchase_date: datetime = None) -> datetime:
        """
        Estimate expiration date based on item type and category
        """
        if purchase_date is None:
            purchase_date = datetime.now()
        
        # Get default expiration days for category
        expiration_days = self.default_expiration_days.get(category.lower(), 7)
        
        # Specific item adjustments
        item_adjustments = {
            'milk': 7,
            'eggs': 14,
            'bread': 5,
            'bananas': 4,
            'apples': 14,
            'chicken': 2,
            'fish': 1,
            'yogurt': 10
        }
        
        item_name = item_name.lower()
        for item_key, days in item_adjustments.items():
            if item_key in item_name:
                expiration_days = days
                break
        
        return purchase_date + timedelta(days=expiration_days)
    
    def get_expiration_summary(self, purchase_history: PurchaseHistory) -> Dict[str, any]:
        """
        Get summary of expiration status
        """
        expiring_items = self.check_expiring_items(purchase_history)
        
        total_expiring = sum(len(items) for items in expiring_items.values())
        
        return {
            'total_items_tracked': len(purchase_history.get_recent_purchases(30)),
            'expired_items': len(expiring_items['expired']),
            'urgent_items': len(expiring_items['urgent']),
            'warning_items': len(expiring_items['warning']),
            'notice_items': len(expiring_items['notice']),
            'total_expiring': total_expiring,
            'needs_attention': len(expiring_items['expired']) + len(expiring_items['urgent']) > 0
        }
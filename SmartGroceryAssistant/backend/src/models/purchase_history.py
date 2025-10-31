from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from .grocery_item import GroceryItem

class PurchaseHistory:
    """
    Tracks purchase history and analyzes buying patterns for smart suggestions
    """
    
    def __init__(self):
        self._purchases: List[GroceryItem] = []
        self._purchase_patterns = {}
    
    @property
    def all_purchases(self) -> List[GroceryItem]:
        """Get all purchase history"""
        return self._purchases.copy()
    
    @property
    def total_purchases(self) -> int:
        """Get total number of purchases"""
        return len(self._purchases)
    
    def add_purchase(self, item: GroceryItem) -> None:
        """
        Add a purchased item to history
        """
        # Create a copy to avoid modifying the original
        purchase_item = GroceryItem(
            name=item.name,
            category=item.category,
            quantity=item.quantity,
            unit=item.unit,
            purchase_date=item.purchase_date or datetime.now(),
            expiration_days=item.expiration_days,
            price=item.price,
            is_organic=item.is_organic
        )
        
        self._purchases.append(purchase_item)
        self._update_patterns()
    
    def add_multiple_purchases(self, items: List[GroceryItem]) -> None:
        """
        Add multiple purchased items to history
        """
        for item in items:
            self.add_purchase(item)
    
    def get_purchases_by_date_range(self, start_date: datetime, end_date: datetime) -> List[GroceryItem]:
        """
        Get purchases within a specific date range
        """
        return [item for item in self._purchases 
                if start_date <= item.purchase_date <= end_date]
    
    def get_recent_purchases(self, days: int = 30) -> List[GroceryItem]:
        """
        Get purchases from the last N days
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        return [item for item in self._purchases 
                if item.purchase_date >= cutoff_date]
    
    def get_purchase_frequency(self, item_name: str) -> Dict[str, any]:
        """
        Analyze purchase frequency for a specific item
        """
        item_name = item_name.lower().strip()
        item_purchases = [item for item in self._purchases 
                         if item.name == item_name]
        
        if not item_purchases:
            return {
                'total_purchases': 0,
                'average_days_between': 0,
                'last_purchase_date': None,
                'predicted_next_purchase': None
            }
        
        # Sort by purchase date
        item_purchases.sort(key=lambda x: x.purchase_date)
        
        # Calculate days between purchases
        if len(item_purchases) > 1:
            days_between = []
            for i in range(1, len(item_purchases)):
                days = (item_purchases[i].purchase_date - item_purchases[i-1].purchase_date).days
                days_between.append(days)
            
            average_days = sum(days_between) / len(days_between)
        else:
            average_days = 0
        
        last_purchase = item_purchases[-1].purchase_date
        predicted_next = last_purchase + timedelta(days=average_days) if average_days > 0 else None
        
        return {
            'total_purchases': len(item_purchases),
            'average_days_between': round(average_days, 1),
            'last_purchase_date': last_purchase,
            'predicted_next_purchase': predicted_next
        }
    
    def get_category_preferences(self) -> Dict[str, int]:
        """
        Get purchase count by category
        """
        category_count = Counter(item.category for item in self._purchases)
        return dict(category_count)
    
    def get_most_purchased_items(self, limit: int = 10) -> List[tuple]:
        """
        Get most frequently purchased items
        Returns list of (item_name, count) tuples
        """
        item_count = Counter(item.name for item in self._purchases)
        return item_count.most_common(limit)
    
    def get_seasonal_patterns(self) -> Dict[str, List[str]]:
        """
        Analyze seasonal purchasing patterns by month
        """
        monthly_items = defaultdict(list)
        
        for item in self._purchases:
            month = item.purchase_date.strftime("%B")
            monthly_items[month].append(item.name)
        
        # Get most common items per month
        seasonal_patterns = {}
        for month, items in monthly_items.items():
            item_counter = Counter(items)
            seasonal_patterns[month] = [item for item, count in item_counter.most_common(5)]
        
        return seasonal_patterns
    
    def should_suggest_item(self, item_name: str, threshold_days: int = 7) -> tuple[bool, str]:
        """
        Determine if an item should be suggested based on purchase patterns
        Returns (should_suggest, reason)
        """
        frequency_data = self.get_purchase_frequency(item_name)
        
        if frequency_data['total_purchases'] == 0:
            return False, "Never purchased before"
        
        if frequency_data['total_purchases'] == 1:
            # Single purchase, check if it was recent enough to suggest
            days_since = (datetime.now() - frequency_data['last_purchase_date']).days
            if days_since >= 14:  # Suggest after 2 weeks for single purchase
                return True, f"You bought {item_name} {days_since} days ago"
            return False, "Too recent for single purchase"
        
        # Multiple purchases - use prediction
        predicted_date = frequency_data['predicted_next_purchase']
        if predicted_date:
            days_until_predicted = (predicted_date - datetime.now()).days
            
            if -threshold_days <= days_until_predicted <= threshold_days:
                avg_days = frequency_data['average_days_between']
                return True, f"You usually buy {item_name} every {avg_days:.0f} days"
        
        return False, "Not time yet based on your pattern"
    
    def _update_patterns(self) -> None:
        """
        Update internal purchase patterns cache
        """
        # This could be expanded for more complex pattern analysis
        self._purchase_patterns = {
            'total_items': len(set(item.name for item in self._purchases)),
            'categories': len(set(item.category for item in self._purchases)),
            'last_updated': datetime.now().isoformat()
        }
    
    def to_dict(self) -> dict:
        """
        Convert purchase history to dictionary for JSON serialization
        """
        return {
            'purchases': [item.to_dict() for item in self._purchases],
            'patterns': self._purchase_patterns,
            'total_purchases': self.total_purchases
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PurchaseHistory':
        """
        Create PurchaseHistory from dictionary
        """
        history = cls()
        
        # Load purchases
        for item_data in data.get('purchases', []):
            item = GroceryItem.from_dict(item_data)
            history._purchases.append(item)
        
        # Load patterns if available
        history._purchase_patterns = data.get('patterns', {})
        
        return history
    
    def get_summary_stats(self) -> Dict[str, any]:
        """
        Get summary statistics about purchase history
        """
        if not self._purchases:
            return {
                'total_purchases': 0,
                'unique_items': 0,
                'categories': 0,
                'date_range': None,
                'most_purchased': None
            }
        
        dates = [item.purchase_date for item in self._purchases]
        
        return {
            'total_purchases': len(self._purchases),
            'unique_items': len(set(item.name for item in self._purchases)),
            'categories': len(set(item.category for item in self._purchases)),
            'date_range': (min(dates), max(dates)),
            'most_purchased': self.get_most_purchased_items(3)
        }
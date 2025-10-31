from typing import List, Optional, Dict
from datetime import datetime
from .grocery_item import GroceryItem

class ShoppingList:
    """
    Manages the current shopping list with add, remove, and update operations
    """
    
    def __init__(self):
        self._items: List[GroceryItem] = []
        self._created_date = datetime.now()
    
    @property
    def items(self) -> List[GroceryItem]:
        """Get all items in the shopping list"""
        return self._items.copy()
    
    @property
    def item_count(self) -> int:
        """Get total number of different items"""
        return len(self._items)
    
    @property
    def total_quantity(self) -> int:
        """Get total quantity of all items"""
        return sum(item.quantity for item in self._items)
    
    def add_item(self, item: GroceryItem) -> bool:
        """
        Add an item to the shopping list
        If item already exists, increase quantity
        """
        existing_item = self.find_item(item.name, item.category)
        
        if existing_item:
            existing_item.quantity += item.quantity
            return True
        else:
            self._items.append(item)
            return True
    
    def remove_item(self, name: str, category: str = None) -> bool:
        """
        Remove an item from the shopping list
        Returns True if item was found and removed
        """
        item = self.find_item(name, category)
        if item:
            self._items.remove(item)
            return True
        return False
    
    def update_quantity(self, name: str, new_quantity: int, category: str = None) -> bool:
        """
        Update the quantity of an item
        If quantity is 0 or negative, remove the item
        """
        item = self.find_item(name, category)
        if item:
            if new_quantity <= 0:
                return self.remove_item(name, category)
            else:
                item.quantity = new_quantity
                return True
        return False
    
    def find_item(self, name: str, category: str = None) -> Optional[GroceryItem]:
        """
        Find an item by name and optionally by category
        """
        name = name.lower().strip()
        
        for item in self._items:
            if item.name == name:
                if category is None or item.category == category.lower().strip():
                    return item
        return None
    
    def get_items_by_category(self) -> Dict[str, List[GroceryItem]]:
        """
        Group items by category
        """
        categories = {}
        for item in self._items:
            if item.category not in categories:
                categories[item.category] = []
            categories[item.category].append(item)
        return categories
    
    def clear_list(self) -> None:
        """
        Clear all items from the shopping list
        """
        self._items.clear()
    
    def get_expiring_items(self, days_threshold: int = 3) -> List[GroceryItem]:
        """
        Get items that are expiring within the specified days
        """
        return [item for item in self._items 
                if 0 <= item.days_until_expiry <= days_threshold]
    
    def get_expired_items(self) -> List[GroceryItem]:
        """
        Get items that have already expired
        """
        return [item for item in self._items if item.is_expired]
    
    def to_dict(self) -> dict:
        """
        Convert shopping list to dictionary for JSON serialization
        """
        return {
            'items': [item.to_dict() for item in self._items],
            'created_date': self._created_date.isoformat(),
            'item_count': self.item_count,
            'total_quantity': self.total_quantity
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ShoppingList':
        """
        Create ShoppingList from dictionary
        """
        shopping_list = cls()
        
        # Load items
        for item_data in data.get('items', []):
            item = GroceryItem.from_dict(item_data)
            shopping_list._items.append(item)
        
        # Load created date if available
        if data.get('created_date'):
            shopping_list._created_date = datetime.fromisoformat(data['created_date'])
        
        return shopping_list
    
    def __str__(self) -> str:
        """
        String representation of the shopping list
        """
        if not self._items:
            return "Shopping list is empty"
        
        result = f"Shopping List ({self.item_count} items, {self.total_quantity} total):\n"
        result += "=" * 50 + "\n"
        
        # Group by category
        categories = self.get_items_by_category()
        
        for category, items in sorted(categories.items()):
            result += f"\n{category.title()}:\n"
            result += "-" * 20 + "\n"
            for item in sorted(items, key=lambda x: x.name):
                result += f"  • {item}\n"
        
        return result
    
    def __len__(self) -> int:
        """
        Return number of items in the list
        """
        return len(self._items)
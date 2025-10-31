from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

@dataclass
class GroceryItem:
    """
    Represents a grocery item with all necessary attributes for tracking
    """
    name: str
    category: str
    quantity: int = 1
    unit: str = "pieces"
    purchase_date: Optional[datetime] = None
    expiration_days: int = 7  # Default expiration in days
    price: float = 0.0
    is_organic: bool = False
    
    def __post_init__(self):
        """Initialize purchase date if not provided"""
        if self.purchase_date is None:
            self.purchase_date = datetime.now()
            
        # Normalize name to lowercase for consistency
        self.name = self.name.lower().strip()
        self.category = self.category.lower().strip()
    
    @property
    def expiration_date(self) -> datetime:
        """Calculate expiration date based on purchase date and expiration days"""
        return self.purchase_date + timedelta(days=self.expiration_days)
    
    @property
    def days_until_expiry(self) -> int:
        """Calculate days until expiration"""
        return (self.expiration_date - datetime.now()).days
    
    @property
    def is_expired(self) -> bool:
        """Check if item has expired"""
        return self.days_until_expiry < 0
    
    @property
    def is_expiring_soon(self) -> bool:
        """Check if item is expiring within 3 days"""
        return 0 <= self.days_until_expiry <= 3
    
    def to_dict(self) -> dict:
        """Convert GroceryItem to dictionary for JSON serialization"""
        return {
            'name': self.name,
            'category': self.category,
            'quantity': self.quantity,
            'unit': self.unit,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'expiration_days': self.expiration_days,
            'price': self.price,
            'is_organic': self.is_organic
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GroceryItem':
        """Create GroceryItem from dictionary"""
        item = cls(
            name=data['name'],
            category=data['category'],
            quantity=data.get('quantity', 1),
            unit=data.get('unit', 'pieces'),
            expiration_days=data.get('expiration_days', 7),
            price=data.get('price', 0.0),
            is_organic=data.get('is_organic', False)
        )
        
        # Parse purchase date if provided
        if data.get('purchase_date'):
            item.purchase_date = datetime.fromisoformat(data['purchase_date'])
            
        return item
    
    def __str__(self) -> str:
        """String representation of the item"""
        status = ""
        if self.is_expired:
            status = " (EXPIRED)"
        elif self.is_expiring_soon:
            status = f" (expires in {self.days_until_expiry} days)"
            
        organic_label = " [Organic]" if self.is_organic else ""
        
        return f"{self.name.title()} - {self.quantity} {self.unit}{organic_label}{status}"
    
    def __eq__(self, other) -> bool:
        """Check equality based on name and category"""
        if not isinstance(other, GroceryItem):
            return False
        return self.name == other.name and self.category == other.category
"""
Enhanced DataManager with PostgreSQL support
Maintains backward compatibility with JSON-based storage
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from ..models.shopping_list import ShoppingList as JsonShoppingList
from ..models.purchase_history import PurchaseHistory as JsonPurchaseHistory
from ..database import (
    SessionLocal, User, Category, Item, ShoppingList, ShoppingListItem,
    Purchase, Store, Recipe, Notification, BudgetGoal
)

class DatabaseDataManager:
    """
    Enhanced data manager supporting both JSON and PostgreSQL storage
    """
    
    def __init__(self, use_database: bool = False, data_dir: str = "data"):
        self.use_database = use_database
        self.data_dir = data_dir
        
        # JSON file paths (for backward compatibility)
        self.shopping_list_file = os.path.join(data_dir, "shopping_list.json")
        self.purchase_history_file = os.path.join(data_dir, "purchase_history.json")
        self.user_preferences_file = os.path.join(data_dir, "user_preferences.json")
        
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Default preferences
        self.default_preferences = {
            'expiration_reminder_days': 3,
            'suggestion_count': 10,
            'prefer_organic': False,
            'dietary_restrictions': [],
            'favorite_categories': [],
            'last_updated': datetime.now().isoformat()
        }
        
        # Default user ID for single-user mode
        self.default_user_id = 1
        
        if self.use_database:
            self._ensure_default_user()
    
    def _get_db(self) -> Session:
        """Get database session"""
        return SessionLocal()
    
    def _ensure_default_user(self):
        """Ensure default user exists in database"""
        db = self._get_db()
        try:
            user = db.query(User).filter(User.id == self.default_user_id).first()
            if not user:
                user = User(
                    id=self.default_user_id,
                    name="Default User",
                    email="user@smartgrocery.local",
                    preferences=self.default_preferences
                )
                db.add(user)
                db.commit()
                
                # Create default categories
                self._create_default_categories(db)
        finally:
            db.close()
    
    def _create_default_categories(self, db: Session):
        """Create default food categories"""
        default_categories = [
            {"name": "fruits", "color": "#4CAF50", "icon": "apple"},
            {"name": "vegetables", "color": "#8BC34A", "icon": "carrot"},
            {"name": "dairy", "color": "#2196F3", "icon": "milk"},
            {"name": "protein", "color": "#FF5722", "icon": "meat"},
            {"name": "grains", "color": "#FF9800", "icon": "bread"},
            {"name": "pantry", "color": "#795548", "icon": "storage"},
            {"name": "beverages", "color": "#00BCD4", "icon": "drink"},
            {"name": "snacks", "color": "#9C27B0", "icon": "cookie"}
        ]
        
        for cat_data in default_categories:
            category = Category(**cat_data)
            db.add(category)
        
        db.commit()
    
    # Shopping List Methods
    def save_shopping_list(self, shopping_list: Union[JsonShoppingList, Dict]) -> bool:
        """Save shopping list to JSON or database"""
        if self.use_database:
            return self._save_shopping_list_db(shopping_list)
        else:
            return self._save_shopping_list_json(shopping_list)
    
    def _save_shopping_list_json(self, shopping_list: Union[JsonShoppingList, Dict]) -> bool:
        """Save shopping list to JSON file"""
        try:
            if isinstance(shopping_list, JsonShoppingList):
                data = shopping_list.to_dict()
            else:
                data = shopping_list
            
            data['last_saved'] = datetime.now().isoformat()
            
            with open(self.shopping_list_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving shopping list to JSON: {e}")
            return False
    
    def _save_shopping_list_db(self, shopping_list_data: Union[JsonShoppingList, Dict]) -> bool:
        """Save shopping list to database"""
        db = self._get_db()
        try:
            if isinstance(shopping_list_data, JsonShoppingList):
                items_data = shopping_list_data.to_dict().get('items', [])
            else:
                items_data = shopping_list_data.get('items', [])
            
            # Get or create active shopping list
            shopping_list = db.query(ShoppingList).filter(
                and_(ShoppingList.user_id == self.default_user_id, ShoppingList.is_active == True)
            ).first()
            
            if not shopping_list:
                shopping_list = ShoppingList(
                    user_id=self.default_user_id,
                    name="My Shopping List",
                    is_active=True
                )
                db.add(shopping_list)
                db.flush()
            
            # Clear existing items
            db.query(ShoppingListItem).filter(
                ShoppingListItem.shopping_list_id == shopping_list.id
            ).delete()
            
            # Add new items
            for item_data in items_data:
                # Get or create item
                item = self._get_or_create_item(db, item_data)
                
                shopping_list_item = ShoppingListItem(
                    shopping_list_id=shopping_list.id,
                    item_id=item.id,
                    quantity=item_data.get('quantity', 1),
                    unit=item_data.get('unit', 'piece'),
                    estimated_price=item_data.get('price', 0.0)
                )
                db.add(shopping_list_item)
            
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Error saving shopping list to database: {e}")
            return False
        finally:
            db.close()
    
    def load_shopping_list(self) -> Union[JsonShoppingList, Dict]:
        """Load shopping list from JSON or database"""
        if self.use_database:
            return self._load_shopping_list_db()
        else:
            return self._load_shopping_list_json()
    
    def _load_shopping_list_json(self) -> JsonShoppingList:
        """Load shopping list from JSON file"""
        try:
            if os.path.exists(self.shopping_list_file):
                with open(self.shopping_list_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return JsonShoppingList.from_dict(data)
            else:
                return JsonShoppingList()
        except Exception as e:
            print(f"Error loading shopping list from JSON: {e}")
            return JsonShoppingList()
    
    def _load_shopping_list_db(self) -> Dict:
        """Load shopping list from database"""
        db = self._get_db()
        try:
            shopping_list = db.query(ShoppingList).filter(
                and_(ShoppingList.user_id == self.default_user_id, ShoppingList.is_active == True)
            ).first()
            
            if not shopping_list:
                return {"items": []}
            
            items = []
            for sl_item in shopping_list.items:
                items.append({
                    "name": sl_item.item.name,
                    "category": sl_item.item.category.name,
                    "quantity": sl_item.quantity,
                    "unit": sl_item.unit,
                    "price": sl_item.estimated_price,
                    "is_organic": sl_item.item.is_organic,
                    "expiration_days": sl_item.item.expiration_days,
                    "purchase_date": sl_item.added_at.isoformat() if sl_item.added_at else None
                })
            
            return {"items": items, "last_saved": shopping_list.updated_at.isoformat() if shopping_list.updated_at else None}
            
        except Exception as e:
            print(f"Error loading shopping list from database: {e}")
            return {"items": []}
        finally:
            db.close()
    
    def _get_or_create_item(self, db: Session, item_data: Dict) -> Item:
        """Get existing item or create new one"""
        item_name = item_data.get('name', '')
        category_name = item_data.get('category', 'pantry')
        
        # Get or create category
        category = db.query(Category).filter(Category.name == category_name).first()
        if not category:
            category = Category(name=category_name)
            db.add(category)
            db.flush()
        
        # Get or create item
        item = db.query(Item).filter(
            and_(Item.name == item_name, Item.category_id == category.id)
        ).first()
        
        if not item:
            item = Item(
                name=item_name,
                category_id=category.id,
                average_price=item_data.get('price', 0.0),
                default_unit=item_data.get('unit', 'piece'),
                expiration_days=item_data.get('expiration_days', 7),
                is_organic=item_data.get('is_organic', False)
            )
            db.add(item)
            db.flush()
        
        return item
    
    # Purchase History Methods
    def save_purchase_history(self, purchase_history: Union[JsonPurchaseHistory, Dict]) -> bool:
        """Save purchase history to JSON or database"""
        if self.use_database:
            return self._save_purchase_history_db(purchase_history)
        else:
            return self._save_purchase_history_json(purchase_history)
    
    def _save_purchase_history_json(self, purchase_history: Union[JsonPurchaseHistory, Dict]) -> bool:
        """Save purchase history to JSON file"""
        try:
            if isinstance(purchase_history, JsonPurchaseHistory):
                data = purchase_history.to_dict()
            else:
                data = purchase_history
            
            data['last_saved'] = datetime.now().isoformat()
            
            with open(self.purchase_history_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving purchase history to JSON: {e}")
            return False
    
    def _save_purchase_history_db(self, purchase_history_data: Union[JsonPurchaseHistory, Dict]) -> bool:
        """Save purchase history to database"""
        db = self._get_db()
        try:
            if isinstance(purchase_history_data, JsonPurchaseHistory):
                purchases_data = purchase_history_data.to_dict().get('purchases', [])
            else:
                purchases_data = purchase_history_data.get('purchases', [])
            
            # Clear existing purchases for this user (in a real app, you'd append instead)
            db.query(Purchase).filter(Purchase.user_id == self.default_user_id).delete()
            
            # Add purchases
            for purchase_data in purchases_data:
                item = self._get_or_create_item(db, purchase_data)
                
                purchase = Purchase(
                    user_id=self.default_user_id,
                    item_id=item.id,
                    quantity=purchase_data.get('quantity', 1),
                    unit=purchase_data.get('unit', 'piece'),
                    price_per_unit=purchase_data.get('price', 0.0),
                    total_price=purchase_data.get('price', 0.0) * purchase_data.get('quantity', 1),
                    purchase_date=datetime.fromisoformat(purchase_data.get('purchase_date', datetime.now().isoformat())),
                    is_organic=purchase_data.get('is_organic', False)
                )
                db.add(purchase)
            
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Error saving purchase history to database: {e}")
            return False
        finally:
            db.close()
    
    def load_purchase_history(self) -> Union[JsonPurchaseHistory, Dict]:
        """Load purchase history from JSON or database"""
        if self.use_database:
            return self._load_purchase_history_db()
        else:
            return self._load_purchase_history_json()
    
    def _load_purchase_history_json(self) -> JsonPurchaseHistory:
        """Load purchase history from JSON file"""
        try:
            if os.path.exists(self.purchase_history_file):
                with open(self.purchase_history_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return JsonPurchaseHistory.from_dict(data)
            else:
                return JsonPurchaseHistory()
        except Exception as e:
            print(f"Error loading purchase history from JSON: {e}")
            return JsonPurchaseHistory()
    
    def _load_purchase_history_db(self) -> Dict:
        """Load purchase history from database"""
        db = self._get_db()
        try:
            purchases = db.query(Purchase).filter(Purchase.user_id == self.default_user_id).all()
            
            purchases_data = []
            for purchase in purchases:
                purchases_data.append({
                    "name": purchase.item.name,
                    "category": purchase.item.category.name,
                    "quantity": purchase.quantity,
                    "unit": purchase.unit,
                    "price": purchase.price_per_unit,
                    "total_price": purchase.total_price,
                    "purchase_date": purchase.purchase_date.isoformat(),
                    "is_organic": purchase.is_organic,
                    "expiration_days": purchase.item.expiration_days
                })
            
            return {"purchases": purchases_data}
            
        except Exception as e:
            print(f"Error loading purchase history from database: {e}")
            return {"purchases": []}
        finally:
            db.close()
    
    # User Preferences Methods
    def save_user_preferences(self, preferences: Dict[str, Any]) -> bool:
        """Save user preferences to JSON or database"""
        if self.use_database:
            return self._save_user_preferences_db(preferences)
        else:
            return self._save_user_preferences_json(preferences)
    
    def _save_user_preferences_json(self, preferences: Dict[str, Any]) -> bool:
        """Save user preferences to JSON file"""
        try:
            preferences['last_updated'] = datetime.now().isoformat()
            
            with open(self.user_preferences_file, 'w', encoding='utf-8') as f:
                json.dump(preferences, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving user preferences to JSON: {e}")
            return False
    
    def _save_user_preferences_db(self, preferences: Dict[str, Any]) -> bool:
        """Save user preferences to database"""
        db = self._get_db()
        try:
            user = db.query(User).filter(User.id == self.default_user_id).first()
            if user:
                user.preferences = preferences
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            print(f"Error saving user preferences to database: {e}")
            return False
        finally:
            db.close()
    
    def load_user_preferences(self) -> Dict[str, Any]:
        """Load user preferences from JSON or database"""
        if self.use_database:
            return self._load_user_preferences_db()
        else:
            return self._load_user_preferences_json()
    
    def _load_user_preferences_json(self) -> Dict[str, Any]:
        """Load user preferences from JSON file"""
        try:
            if os.path.exists(self.user_preferences_file):
                with open(self.user_preferences_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return self.default_preferences.copy()
        except Exception as e:
            print(f"Error loading user preferences from JSON: {e}")
            return self.default_preferences.copy()
    
    def _load_user_preferences_db(self) -> Dict[str, Any]:
        """Load user preferences from database"""
        db = self._get_db()
        try:
            user = db.query(User).filter(User.id == self.default_user_id).first()
            if user and user.preferences:
                return user.preferences
            return self.default_preferences.copy()
        except Exception as e:
            print(f"Error loading user preferences from database: {e}")
            return self.default_preferences.copy()
        finally:
            db.close()
    
    # Utility Methods
    def get_categories(self) -> List[Dict]:
        """Get all categories"""
        if self.use_database:
            db = self._get_db()
            try:
                categories = db.query(Category).all()
                return [{"id": cat.id, "name": cat.name, "color": cat.color, "icon": cat.icon} for cat in categories]
            finally:
                db.close()
        else:
            # Return default categories for JSON mode
            return [
                {"name": "fruits", "color": "#4CAF50", "icon": "apple"},
                {"name": "vegetables", "color": "#8BC34A", "icon": "carrot"},
                {"name": "dairy", "color": "#2196F3", "icon": "milk"},
                {"name": "protein", "color": "#FF5722", "icon": "meat"},
                {"name": "grains", "color": "#FF9800", "icon": "bread"},
                {"name": "pantry", "color": "#795548", "icon": "storage"}
            ]
    
    def get_spending_analytics(self, days: int = 30) -> Dict:
        """Get spending analytics"""
        if self.use_database:
            db = self._get_db()
            try:
                since_date = datetime.now() - timedelta(days=days)
                
                # Total spending
                total_spent = db.query(func.sum(Purchase.total_price)).filter(
                    and_(Purchase.user_id == self.default_user_id, Purchase.purchase_date >= since_date)
                ).scalar() or 0.0
                
                # Category breakdown
                category_spending = db.query(
                    Category.name,
                    func.sum(Purchase.total_price).label('total')
                ).join(Item).join(Purchase).filter(
                    and_(Purchase.user_id == self.default_user_id, Purchase.purchase_date >= since_date)
                ).group_by(Category.name).all()
                
                return {
                    "total_spent": total_spent,
                    "period_days": days,
                    "category_breakdown": [{"category": cat, "amount": float(total)} for cat, total in category_spending]
                }
            finally:
                db.close()
        else:
            # Fallback to JSON-based calculation
            purchase_history = self._load_purchase_history_json()
            total_spent = sum(p.get('price', 0) * p.get('quantity', 1) for p in purchase_history.to_dict().get('purchases', []))
            return {"total_spent": total_spent, "period_days": days, "category_breakdown": []}
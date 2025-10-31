import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from ..models.shopping_list import ShoppingList
from ..models.purchase_history import PurchaseHistory

class DataManager:
    """
    Handles data persistence for the Smart Grocery Assistant
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.shopping_list_file = os.path.join(data_dir, "shopping_list.json")
        self.purchase_history_file = os.path.join(data_dir, "purchase_history.json")
        self.user_preferences_file = os.path.join(data_dir, "user_preferences.json")
        
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize default preferences
        self.default_preferences = {
            'expiration_reminder_days': 3,
            'suggestion_count': 10,
            'prefer_organic': False,
            'dietary_restrictions': [],
            'favorite_categories': [],
            'last_updated': datetime.now().isoformat()
        }
    
    def save_shopping_list(self, shopping_list: ShoppingList) -> bool:
        """
        Save shopping list to JSON file
        """
        try:
            data = shopping_list.to_dict()
            data['last_saved'] = datetime.now().isoformat()
            
            with open(self.shopping_list_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving shopping list: {e}")
            return False
    
    def load_shopping_list(self) -> ShoppingList:
        """
        Load shopping list from JSON file
        """
        try:
            if os.path.exists(self.shopping_list_file):
                with open(self.shopping_list_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return ShoppingList.from_dict(data)
            else:
                # Return empty shopping list if file doesn't exist
                return ShoppingList()
        except Exception as e:
            print(f"Error loading shopping list: {e}")
            return ShoppingList()
    
    def save_purchase_history(self, purchase_history: PurchaseHistory) -> bool:
        """
        Save purchase history to JSON file
        """
        try:
            data = purchase_history.to_dict()
            data['last_saved'] = datetime.now().isoformat()
            
            with open(self.purchase_history_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving purchase history: {e}")
            return False
    
    def load_purchase_history(self) -> PurchaseHistory:
        """
        Load purchase history from JSON file
        """
        try:
            if os.path.exists(self.purchase_history_file):
                with open(self.purchase_history_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return PurchaseHistory.from_dict(data)
            else:
                # Return empty history if file doesn't exist
                return PurchaseHistory()
        except Exception as e:
            print(f"Error loading purchase history: {e}")
            return PurchaseHistory()
    
    def save_user_preferences(self, preferences: Dict[str, Any]) -> bool:
        """
        Save user preferences to JSON file
        """
        try:
            # Merge with default preferences
            full_preferences = self.default_preferences.copy()
            full_preferences.update(preferences)
            full_preferences['last_updated'] = datetime.now().isoformat()
            
            with open(self.user_preferences_file, 'w', encoding='utf-8') as f:
                json.dump(full_preferences, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving user preferences: {e}")
            return False
    
    def load_user_preferences(self) -> Dict[str, Any]:
        """
        Load user preferences from JSON file
        """
        try:
            if os.path.exists(self.user_preferences_file):
                with open(self.user_preferences_file, 'r', encoding='utf-8') as f:
                    preferences = json.load(f)
                
                # Merge with defaults to ensure all keys exist
                full_preferences = self.default_preferences.copy()
                full_preferences.update(preferences)
                return full_preferences
            else:
                # Return default preferences if file doesn't exist
                return self.default_preferences.copy()
        except Exception as e:
            print(f"Error loading user preferences: {e}")
            return self.default_preferences.copy()
    
    def backup_data(self, backup_dir: str = "backups") -> bool:
        """
        Create backup copies of all data files
        """
        try:
            # Create backup directory
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(backup_dir, f"backup_{timestamp}")
            os.makedirs(backup_path, exist_ok=True)
            
            # Copy files to backup directory
            files_to_backup = [
                self.shopping_list_file,
                self.purchase_history_file,
                self.user_preferences_file
            ]
            
            for file_path in files_to_backup:
                if os.path.exists(file_path):
                    filename = os.path.basename(file_path)
                    backup_file = os.path.join(backup_path, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as source:
                        with open(backup_file, 'w', encoding='utf-8') as dest:
                            dest.write(source.read())
            
            print(f"Data backed up to: {backup_path}")
            return True
        
        except Exception as e:
            print(f"Error creating backup: {e}")
            return False
    
    def get_data_summary(self) -> Dict[str, Any]:
        """
        Get summary of all stored data
        """
        summary = {
            'files_exist': {},
            'file_sizes': {},
            'last_modified': {},
            'data_counts': {}
        }
        
        files = {
            'shopping_list': self.shopping_list_file,
            'purchase_history': self.purchase_history_file,
            'user_preferences': self.user_preferences_file
        }
        
        for file_type, file_path in files.items():
            summary['files_exist'][file_type] = os.path.exists(file_path)
            
            if os.path.exists(file_path):
                # File size
                summary['file_sizes'][file_type] = os.path.getsize(file_path)
                
                # Last modified time
                mod_time = os.path.getmtime(file_path)
                summary['last_modified'][file_type] = datetime.fromtimestamp(mod_time).isoformat()
                
                # Data counts
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    if file_type == 'shopping_list':
                        summary['data_counts'][file_type] = len(data.get('items', []))
                    elif file_type == 'purchase_history':
                        summary['data_counts'][file_type] = len(data.get('purchases', []))
                    elif file_type == 'user_preferences':
                        summary['data_counts'][file_type] = len(data.keys())
                        
                except Exception as e:
                    summary['data_counts'][file_type] = f"Error reading: {e}"
        
        return summary
    
    def clear_all_data(self, confirm: bool = False) -> bool:
        """
        Clear all stored data (with confirmation)
        """
        if not confirm:
            print("Warning: This will delete all stored data!")
            return False
        
        try:
            files_to_clear = [
                self.shopping_list_file,
                self.purchase_history_file,
                self.user_preferences_file
            ]
            
            for file_path in files_to_clear:
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            print("All data cleared successfully")
            return True
        
        except Exception as e:
            print(f"Error clearing data: {e}")
            return False
    
    def export_data(self, export_path: str) -> bool:
        """
        Export all data to a single JSON file
        """
        try:
            shopping_list = self.load_shopping_list()
            purchase_history = self.load_purchase_history()
            preferences = self.load_user_preferences()
            
            export_data = {
                'export_date': datetime.now().isoformat(),
                'shopping_list': shopping_list.to_dict(),
                'purchase_history': purchase_history.to_dict(),
                'user_preferences': preferences
            }
            
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            return True
        
        except Exception as e:
            print(f"Error exporting data: {e}")
            return False
    
    def import_data(self, import_path: str) -> bool:
        """
        Import data from a JSON file
        """
        try:
            with open(import_path, 'r', encoding='utf-8') as f:
                import_data = json.load(f)
            
            # Import shopping list
            if 'shopping_list' in import_data:
                shopping_list = ShoppingList.from_dict(import_data['shopping_list'])
                self.save_shopping_list(shopping_list)
            
            # Import purchase history
            if 'purchase_history' in import_data:
                purchase_history = PurchaseHistory.from_dict(import_data['purchase_history'])
                self.save_purchase_history(purchase_history)
            
            # Import preferences
            if 'user_preferences' in import_data:
                self.save_user_preferences(import_data['user_preferences'])
            
            return True
        
        except Exception as e:
            print(f"Error importing data: {e}")
            return False
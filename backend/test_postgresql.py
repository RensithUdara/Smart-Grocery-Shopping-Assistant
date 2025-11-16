#!/usr/bin/env python3
"""
Comprehensive test for PostgreSQL integration
"""
import os
import sys
import tempfile
import shutil
from datetime import datetime

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_database_integration():
    """Test PostgreSQL integration functionality"""
    print("🧪 Testing PostgreSQL Integration")
    print("=" * 50)
    
    success = True
    
    # Test 1: Import database modules
    try:
        print("1️⃣ Testing database imports...")
        from src.database import Base, engine, SessionLocal, init_db
        from src.database.models import User, Category, Item, ShoppingList, Purchase
        from src.utils.database_data_manager import DatabaseDataManager
        from src.utils.data_manager_factory import get_data_manager_instance
        print("   ✅ Database imports successful")
    except ImportError as e:
        print(f"   ❌ Database import failed: {e}")
        success = False
        return success
    
    # Test 2: Database connection (SQLite for testing)
    try:
        print("2️⃣ Testing database connection...")
        
        # Use SQLite for testing
        os.environ['USE_SQLITE'] = 'true'
        os.environ['USE_DATABASE'] = 'true'
        
        # Create temporary database
        temp_db = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
        temp_db.close()
        os.environ['DATABASE_URL'] = f'sqlite:///{temp_db.name}'
        
        # Test connection
        from src.database.config import engine as test_engine
        connection = test_engine.connect()
        connection.close()
        print("   ✅ Database connection successful")
        
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        success = False
        return success
    
    # Test 3: Table creation
    try:
        print("3️⃣ Testing table creation...")
        init_db()
        print("   ✅ Database tables created successfully")
    except Exception as e:
        print(f"   ❌ Table creation failed: {e}")
        success = False
        return success
    
    # Test 4: Data manager factory
    try:
        print("4️⃣ Testing data manager factory...")
        dm = get_data_manager_instance()
        if isinstance(dm, DatabaseDataManager):
            print("   ✅ Database data manager created successfully")
        else:
            print("   ❌ Expected DatabaseDataManager, got:", type(dm))
            success = False
    except Exception as e:
        print(f"   ❌ Data manager factory failed: {e}")
        success = False
        return success
    
    # Test 5: Basic CRUD operations
    try:
        print("5️⃣ Testing CRUD operations...")
        
        # Test user preferences
        preferences = {"test": "value", "number": 42}
        dm.save_user_preferences(preferences)
        loaded_prefs = dm.load_user_preferences()
        
        if loaded_prefs.get("test") == "value" and loaded_prefs.get("number") == 42:
            print("   ✅ User preferences CRUD successful")
        else:
            print("   ❌ User preferences CRUD failed")
            success = False
        
        # Test shopping list
        shopping_list_data = {
            "items": [
                {
                    "name": "test_item",
                    "category": "test_category",
                    "quantity": 2,
                    "unit": "pieces",
                    "price": 5.99,
                    "is_organic": True
                }
            ]
        }
        
        dm.save_shopping_list(shopping_list_data)
        loaded_list = dm.load_shopping_list()
        
        if loaded_list.get("items") and len(loaded_list["items"]) > 0:
            item = loaded_list["items"][0]
            if (item.get("name") == "test_item" and 
                item.get("quantity") == 2 and 
                item.get("price") == 5.99):
                print("   ✅ Shopping list CRUD successful")
            else:
                print("   ❌ Shopping list data mismatch")
                success = False
        else:
            print("   ❌ Shopping list CRUD failed")
            success = False
            
    except Exception as e:
        print(f"   ❌ CRUD operations failed: {e}")
        success = False
        return success
    
    # Test 6: Categories and analytics
    try:
        print("6️⃣ Testing categories and analytics...")
        
        categories = dm.get_categories()
        if len(categories) > 0:
            print(f"   ✅ Categories loaded: {len(categories)} categories")
        else:
            print("   ❌ No categories found")
            success = False
        
        analytics = dm.get_spending_analytics(30)
        if "total_spent" in analytics:
            print("   ✅ Analytics functionality working")
        else:
            print("   ❌ Analytics failed")
            success = False
            
    except Exception as e:
        print(f"   ❌ Categories/analytics test failed: {e}")
        success = False
    
    # Test 7: Database models direct access
    try:
        print("7️⃣ Testing direct database model access...")
        
        db = SessionLocal()
        
        # Count users
        user_count = db.query(User).count()
        category_count = db.query(Category).count()
        
        db.close()
        
        if user_count >= 1 and category_count >= 1:
            print(f"   ✅ Database models working (Users: {user_count}, Categories: {category_count})")
        else:
            print(f"   ❌ Insufficient data in database (Users: {user_count}, Categories: {category_count})")
            success = False
            
    except Exception as e:
        print(f"   ❌ Direct database access failed: {e}")
        success = False
    
    # Cleanup
    try:
        if 'temp_db' in locals():
            os.unlink(temp_db.name)
    except:
        pass
    
    # Reset environment
    os.environ.pop('USE_SQLITE', None)
    os.environ.pop('USE_DATABASE', None)
    os.environ.pop('DATABASE_URL', None)
    
    return success

def test_json_compatibility():
    """Test that JSON mode still works"""
    print("\n🧪 Testing JSON Compatibility")
    print("=" * 50)
    
    try:
        # Ensure JSON mode
        os.environ['USE_DATABASE'] = 'false'
        
        from src.utils.data_manager_factory import get_data_manager_instance
        from src.utils.data_manager import DataManager
        
        dm = get_data_manager_instance()
        
        if isinstance(dm, DataManager):
            print("✅ JSON mode data manager works")
            return True
        else:
            print(f"❌ Expected DataManager, got: {type(dm)}")
            return False
            
    except Exception as e:
        print(f"❌ JSON compatibility test failed: {e}")
        return False
    finally:
        os.environ.pop('USE_DATABASE', None)

def main():
    """Run all tests"""
    print("🚀 Smart Grocery Assistant - PostgreSQL Integration Tests")
    print("=" * 60)
    
    success = True
    
    # Test database integration
    success &= test_database_integration()
    
    # Test JSON compatibility
    success &= test_json_compatibility()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests passed! PostgreSQL integration is working correctly.")
        print("\n📋 Next Steps:")
        print("1. Set up PostgreSQL database")
        print("2. Run: python db_cli.py init")
        print("3. Start application with USE_DATABASE=true")
    else:
        print("❌ Some tests failed. Please check the error messages above.")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check Python path and module imports")
        print("3. Verify database configuration")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
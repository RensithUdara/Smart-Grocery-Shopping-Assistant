"""
Database setup and initialization script
"""
import os
import sys
from sqlalchemy.exc import OperationalError, ProgrammingError

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.database import init_db, drop_db, SessionLocal
from src.database.models import Category, User, Item, Store
from src.utils.database_data_manager import DatabaseDataManager

def create_database():
    """Create database tables"""
    try:
        print("🔧 Creating database tables...")
        init_db()
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return False

def seed_database():
    """Seed database with initial data"""
    try:
        print("🌱 Seeding database with initial data...")
        
        db = SessionLocal()
        
        # Create default user
        user = User(
            id=1,
            name="Default User",
            email="user@smartgrocery.local",
            preferences={
                'expiration_reminder_days': 3,
                'suggestion_count': 10,
                'prefer_organic': False,
                'dietary_restrictions': [],
                'favorite_categories': [],
                'notifications_enabled': True
            }
        )
        db.add(user)
        
        # Create categories
        categories = [
            Category(name="fruits", color="#4CAF50", icon="apple", description="Fresh fruits and berries"),
            Category(name="vegetables", color="#8BC34A", icon="carrot", description="Fresh vegetables and greens"),
            Category(name="dairy", color="#2196F3", icon="milk", description="Milk, cheese, yogurt and dairy products"),
            Category(name="protein", color="#FF5722", icon="meat", description="Meat, fish, eggs and protein sources"),
            Category(name="grains", color="#FF9800", icon="bread", description="Bread, rice, pasta and grain products"),
            Category(name="pantry", color="#795548", icon="storage", description="Canned goods, spices and pantry staples"),
            Category(name="beverages", color="#00BCD4", icon="drink", description="Drinks, juices and beverages"),
            Category(name="snacks", color="#9C27B0", icon="cookie", description="Snacks, sweets and treats"),
            Category(name="frozen", color="#607D8B", icon="frozen", description="Frozen foods and ice cream"),
            Category(name="bakery", color="#FFC107", icon="cake", description="Fresh bread, pastries and baked goods")
        ]
        
        for category in categories:
            db.add(category)
        
        # Create sample items
        sample_items = [
            # Fruits
            Item(name="apples", category_id=1, average_price=3.99, default_unit="kg", expiration_days=14),
            Item(name="bananas", category_id=1, average_price=2.49, default_unit="kg", expiration_days=7),
            Item(name="oranges", category_id=1, average_price=4.99, default_unit="kg", expiration_days=10),
            
            # Vegetables
            Item(name="carrots", category_id=2, average_price=2.99, default_unit="kg", expiration_days=21),
            Item(name="broccoli", category_id=2, average_price=3.49, default_unit="piece", expiration_days=7),
            Item(name="tomatoes", category_id=2, average_price=5.99, default_unit="kg", expiration_days=5),
            
            # Dairy
            Item(name="milk", category_id=3, average_price=3.99, default_unit="liter", expiration_days=7),
            Item(name="cheese", category_id=3, average_price=8.99, default_unit="package", expiration_days=30),
            Item(name="yogurt", category_id=3, average_price=1.99, default_unit="cup", expiration_days=14),
            
            # Protein
            Item(name="chicken breast", category_id=4, average_price=12.99, default_unit="kg", expiration_days=3),
            Item(name="eggs", category_id=4, average_price=4.99, default_unit="dozen", expiration_days=21),
            Item(name="salmon", category_id=4, average_price=19.99, default_unit="kg", expiration_days=2),
            
            # Grains
            Item(name="bread", category_id=5, average_price=2.99, default_unit="loaf", expiration_days=7),
            Item(name="rice", category_id=5, average_price=4.99, default_unit="kg", expiration_days=365),
            Item(name="pasta", category_id=5, average_price=1.99, default_unit="package", expiration_days=730),
            
            # Pantry
            Item(name="olive oil", category_id=6, average_price=8.99, default_unit="bottle", expiration_days=730),
            Item(name="salt", category_id=6, average_price=0.99, default_unit="package", expiration_days=1095),
            Item(name="black pepper", category_id=6, average_price=3.99, default_unit="package", expiration_days=365)
        ]
        
        for item in sample_items:
            db.add(item)
        
        # Create sample stores
        sample_stores = [
            Store(
                name="SuperMarket Plus",
                address="123 Main Street, Colombo",
                latitude=6.9271,
                longitude=79.8612,
                phone="+94 11 123 4567",
                store_type="supermarket",
                rating=4.5,
                is_active=True
            ),
            Store(
                name="Fresh Foods Market",
                address="456 Galle Road, Colombo",
                latitude=6.9147,
                longitude=79.8730,
                phone="+94 11 234 5678",
                store_type="grocery",
                rating=4.2,
                is_active=True
            ),
            Store(
                name="Organic Corner",
                address="789 Kandy Road, Colombo",
                latitude=6.9344,
                longitude=79.8428,
                phone="+94 11 345 6789",
                store_type="organic",
                rating=4.7,
                is_active=True
            )
        ]
        
        for store in sample_stores:
            db.add(store)
        
        db.commit()
        db.close()
        
        print("✅ Database seeded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()
        return False

def migrate_json_data():
    """Migrate existing JSON data to database"""
    try:
        print("📦 Migrating existing JSON data to database...")
        
        # Create database data manager
        json_dm = DatabaseDataManager(use_database=False)
        db_dm = DatabaseDataManager(use_database=True)
        
        # Migrate shopping list
        shopping_list = json_dm.load_shopping_list()
        if hasattr(shopping_list, 'to_dict'):
            shopping_list_data = shopping_list.to_dict()
        else:
            shopping_list_data = shopping_list
            
        if shopping_list_data.get('items'):
            db_dm.save_shopping_list(shopping_list_data)
            print(f"  ✅ Migrated {len(shopping_list_data['items'])} shopping list items")
        
        # Migrate purchase history
        purchase_history = json_dm.load_purchase_history()
        if hasattr(purchase_history, 'to_dict'):
            purchase_history_data = purchase_history.to_dict()
        else:
            purchase_history_data = purchase_history
            
        if purchase_history_data.get('purchases'):
            db_dm.save_purchase_history(purchase_history_data)
            print(f"  ✅ Migrated {len(purchase_history_data['purchases'])} purchase records")
        
        # Migrate user preferences
        preferences = json_dm.load_user_preferences()
        if preferences:
            db_dm.save_user_preferences(preferences)
            print("  ✅ Migrated user preferences")
        
        print("✅ JSON data migration completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error migrating JSON data: {e}")
        return False

def reset_database():
    """Reset database (drop and recreate)"""
    try:
        print("🔄 Resetting database...")
        drop_db()
        print("  ✅ Dropped existing tables")
        
        if create_database() and seed_database():
            print("✅ Database reset completed successfully")
            return True
        else:
            print("❌ Database reset failed")
            return False
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

def check_database_connection():
    """Check if database connection is working"""
    try:
        print("🔍 Checking database connection...")
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Make sure PostgreSQL is running and the database exists")
        return False

def main():
    """Main setup function"""
    print("🚀 Smart Grocery Assistant - Database Setup")
    print("=" * 50)
    
    # Check database connection
    if not check_database_connection():
        print("\n💡 Database Setup Instructions:")
        print("1. Install PostgreSQL")
        print("2. Create database: CREATE DATABASE smart_grocery_db;")
        print("3. Update DATABASE_URL in .env file")
        print("4. Or set USE_SQLITE=true for SQLite development")
        return False
    
    # Create tables
    if not create_database():
        return False
    
    # Seed with initial data
    if not seed_database():
        return False
    
    # Try to migrate existing JSON data
    migrate_json_data()
    
    print("\n🎉 Database setup completed successfully!")
    print("You can now run the application with database support enabled.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
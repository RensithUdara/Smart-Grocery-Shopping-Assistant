"""
Database connection test script
"""
import os
from src.database import SessionLocal
from src.database.models import User, Category, Item
from sqlalchemy import text

def test_database_connection():
    """Test database connection and basic operations"""
    print("🧪 Testing database connection...")
    
    try:
        # Test connection
        db = SessionLocal()
        result = db.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"✅ PostgreSQL Version: {version}")
        
        # Test table queries
        users = db.query(User).all()
        categories = db.query(Category).all()
        items = db.query(Item).all()
        
        print(f"📊 Database Statistics:")
        print(f"  - Users: {len(users)}")
        print(f"  - Categories: {len(categories)}")
        print(f"  - Items: {len(items)}")
        
        # Show sample data
        if users:
            user = users[0]
            print(f"  - Sample User: {user.name} ({user.email})")
        
        if categories:
            print(f"  - Sample Categories: {', '.join([cat.name for cat in categories[:5]])}")
        
        db.close()
        print("✅ Database connection test completed successfully!")
        
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")

if __name__ == "__main__":
    test_database_connection()
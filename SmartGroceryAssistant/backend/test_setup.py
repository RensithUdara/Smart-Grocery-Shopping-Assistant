#!/usr/bin/env python3
"""
Test script to verify backend setup is working correctly
"""

import sys
import os
import json

def test_imports():
    """Test that all modules can be imported correctly"""
    print("🧪 Testing Backend Setup...")
    print("=" * 40)
    
    # Test Flask imports
    try:
        from flask import Flask
        from flask_cors import CORS
        print("✅ Flask imports successful")
    except ImportError as e:
        print(f"❌ Flask import failed: {e}")
        return False
    
    # Test core model imports
    try:
        from src.models.grocery_item import GroceryItem
        from src.models.shopping_list import ShoppingList
        from src.models.purchase_history import PurchaseHistory
        print("✅ Model imports successful")
    except ImportError as e:
        print(f"❌ Model import failed: {e}")
        return False
    
    # Test engine imports
    try:
        from src.engines.rule_engine import RuleEngine
        from src.engines.recommendation_engine import RecommendationEngine
        print("✅ Engine imports successful")
    except ImportError as e:
        print(f"❌ Engine import failed: {e}")
        return False
    
    # Test utility imports
    try:
        from src.utils.data_manager import DataManager
        from src.utils.expiration_tracker import ExpirationTracker
        print("✅ Utility imports successful")
    except ImportError as e:
        print(f"❌ Utility import failed: {e}")
        return False
    
    return True

def test_data_directories():
    """Test that data directories exist"""
    print("\n📁 Testing Data Directories...")
    print("=" * 40)
    
    directories = ['data', 'config']
    for directory in directories:
        if os.path.exists(directory):
            print(f"✅ {directory}/ directory exists")
        else:
            print(f"❌ {directory}/ directory missing")
            os.makedirs(directory, exist_ok=True)
            print(f"📁 Created {directory}/ directory")

def test_basic_functionality():
    """Test basic functionality"""
    print("\n⚙️ Testing Basic Functionality...")
    print("=" * 40)
    
    try:
        from src.models.grocery_item import GroceryItem
        from src.models.shopping_list import ShoppingList
        
        # Create a test item
        item = GroceryItem("test item", "test category", 1, "pieces")
        print(f"✅ Created test item: {item.name}")
        
        # Create a test shopping list
        shopping_list = ShoppingList()
        shopping_list.add_item(item)
        print(f"✅ Added item to shopping list")
        
        # Test item count
        assert shopping_list.item_count == 1
        print(f"✅ Shopping list item count correct: {shopping_list.item_count}")
        
        return True
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Smart Grocery Assistant Backend Test Suite")
    print("=" * 50)
    
    # Change to backend directory if not already there
    if os.path.basename(os.getcwd()) != 'backend':
        backend_path = os.path.join(os.getcwd(), 'backend')
        if os.path.exists(backend_path):
            os.chdir(backend_path)
            print(f"📂 Changed to backend directory: {backend_path}")
    
    # Add current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    success = True
    
    # Run tests
    success &= test_imports()
    test_data_directories()
    success &= test_basic_functionality()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Backend setup is working correctly.")
        print("\nNext steps:")
        print("  📱 Start web server: python run.py")
        print("  🖥️  Start CLI app: python cli.py")
        print("  🌐 Full stack: ../start.bat (Windows) or ../start.sh (Unix)")
    else:
        print("❌ Some tests failed. Please check the error messages above.")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
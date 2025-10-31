#!/usr/bin/env python3
"""
Test Script for Smart Grocery Shopping Assistant
Tests all major functionality to ensure everything works correctly
"""

import os
import sys
import json
from datetime import datetime, timedelta

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.grocery_item import GroceryItem
from src.models.shopping_list import ShoppingList
from src.models.purchase_history import PurchaseHistory
from src.engines.rule_engine import RuleEngine
from src.engines.recommendation_engine import RecommendationEngine
from src.utils.data_manager import DataManager
from src.utils.expiration_tracker import ExpirationTracker

def test_grocery_item():
    """Test GroceryItem class functionality"""
    print("🧪 Testing GroceryItem...")
    
    # Create a grocery item
    item = GroceryItem(
        name="Milk",
        category="dairy",
        quantity=2,
        unit="liters",
        is_organic=True
    )
    
    assert item.name == "milk"  # Should be normalized to lowercase
    assert item.category == "dairy"
    assert item.quantity == 2
    assert item.is_organic == True
    assert item.days_until_expiry > 0  # Should not be expired immediately
    
    # Test serialization
    item_dict = item.to_dict()
    assert isinstance(item_dict, dict)
    
    # Test deserialization
    item2 = GroceryItem.from_dict(item_dict)
    assert item.name == item2.name
    assert item.category == item2.category
    
    print("✅ GroceryItem tests passed!")

def test_shopping_list():
    """Test ShoppingList class functionality"""
    print("🧪 Testing ShoppingList...")
    
    shopping_list = ShoppingList()
    
    # Test empty list
    assert len(shopping_list) == 0
    assert shopping_list.item_count == 0
    
    # Add items
    item1 = GroceryItem("bread", "grains", 1, "loaf")
    item2 = GroceryItem("milk", "dairy", 2, "liters")
    
    shopping_list.add_item(item1)
    shopping_list.add_item(item2)
    
    assert shopping_list.item_count == 2
    assert shopping_list.total_quantity == 3
    
    # Test finding items
    found_item = shopping_list.find_item("bread")
    assert found_item is not None
    assert found_item.name == "bread"
    
    # Test removing items
    success = shopping_list.remove_item("bread")
    assert success == True
    assert shopping_list.item_count == 1
    
    # Test serialization
    list_dict = shopping_list.to_dict()
    assert isinstance(list_dict, dict)
    
    print("✅ ShoppingList tests passed!")

def test_purchase_history():
    """Test PurchaseHistory class functionality"""
    print("🧪 Testing PurchaseHistory...")
    
    history = PurchaseHistory()
    
    # Test empty history
    assert history.total_purchases == 0
    
    # Add purchases
    item1 = GroceryItem("bread", "grains", 1, "loaf")
    item2 = GroceryItem("milk", "dairy", 2, "liters")
    
    history.add_purchase(item1)
    history.add_purchase(item2)
    
    assert history.total_purchases == 2
    
    # Test frequency analysis
    freq_data = history.get_purchase_frequency("bread")
    assert freq_data['total_purchases'] == 1
    
    # Test most purchased items
    most_purchased = history.get_most_purchased_items(5)
    assert len(most_purchased) <= 2
    
    print("✅ PurchaseHistory tests passed!")

def test_rule_engine():
    """Test RuleEngine class functionality"""
    print("🧪 Testing RuleEngine...")
    
    rule_engine = RuleEngine()
    shopping_list = ShoppingList()
    purchase_history = PurchaseHistory()
    
    # Add some test data
    shopping_list.add_item(GroceryItem("pasta", "grains", 1, "box"))
    purchase_history.add_purchase(GroceryItem("milk", "dairy", 1, "liter"))
    
    # Test suggestions
    suggestions = rule_engine.generate_suggestions(shopping_list, purchase_history)
    assert isinstance(suggestions, list)
    
    # Test pattern analysis
    patterns = rule_engine.analyze_shopping_patterns(purchase_history)
    assert isinstance(patterns, dict)
    
    print("✅ RuleEngine tests passed!")

def test_recommendation_engine():
    """Test RecommendationEngine class functionality"""
    print("🧪 Testing RecommendationEngine...")
    
    rec_engine = RecommendationEngine()
    
    # Test healthy alternatives
    alternative = rec_engine.get_healthy_alternative("white bread")
    assert alternative is not None
    assert len(alternative['alternatives']) > 0
    
    # Test shopping list health rating
    shopping_list = ShoppingList()
    shopping_list.add_item(GroceryItem("white bread", "grains", 1, "loaf"))
    shopping_list.add_item(GroceryItem("apples", "fruits", 6, "pieces"))
    
    health_rating = rec_engine.rate_shopping_list_healthiness(shopping_list)
    assert isinstance(health_rating['overall_score'], (int, float))
    assert health_rating['health_grade'] in ['A', 'B', 'C', 'D', 'F']
    
    print("✅ RecommendationEngine tests passed!")

def test_expiration_tracker():
    """Test ExpirationTracker class functionality"""
    print("🧪 Testing ExpirationTracker...")
    
    tracker = ExpirationTracker()
    purchase_history = PurchaseHistory()
    
    # Add some items with different expiration dates
    recent_item = GroceryItem("milk", "dairy", 1, "liter")
    recent_item.purchase_date = datetime.now() - timedelta(days=5)  # 5 days old
    
    old_item = GroceryItem("bread", "grains", 1, "loaf")
    old_item.purchase_date = datetime.now() - timedelta(days=10)  # 10 days old
    
    purchase_history.add_purchase(recent_item)
    purchase_history.add_purchase(old_item)
    
    # Test expiring items check
    expiring_items = tracker.check_expiring_items(purchase_history)
    assert isinstance(expiring_items, dict)
    assert 'expired' in expiring_items
    
    # Test reminders
    reminders = tracker.get_expiration_reminders(purchase_history)
    assert isinstance(reminders, list)
    
    print("✅ ExpirationTracker tests passed!")

def test_data_manager():
    """Test DataManager class functionality"""
    print("🧪 Testing DataManager...")
    
    # Use a test data directory
    test_data_dir = "test_data"
    data_manager = DataManager(test_data_dir)
    
    # Test shopping list save/load
    shopping_list = ShoppingList()
    shopping_list.add_item(GroceryItem("test_item", "test_category", 1, "piece"))
    
    success = data_manager.save_shopping_list(shopping_list)
    assert success == True
    
    loaded_list = data_manager.load_shopping_list()
    assert loaded_list.item_count == 1
    assert loaded_list.find_item("test_item") is not None
    
    # Test purchase history save/load
    purchase_history = PurchaseHistory()
    purchase_history.add_purchase(GroceryItem("test_purchase", "test_category", 1, "piece"))
    
    success = data_manager.save_purchase_history(purchase_history)
    assert success == True
    
    loaded_history = data_manager.load_purchase_history()
    assert loaded_history.total_purchases == 1
    
    # Clean up test files
    import shutil
    if os.path.exists(test_data_dir):
        shutil.rmtree(test_data_dir)
    
    print("✅ DataManager tests passed!")

def create_demo_data():
    """Create demonstration data for the application"""
    print("🧪 Creating demo data...")
    
    data_manager = DataManager()
    
    # Create sample shopping list
    shopping_list = ShoppingList()
    sample_items = [
        GroceryItem("whole wheat bread", "grains", 1, "loaf", is_organic=True),
        GroceryItem("low-fat milk", "dairy", 2, "liters"),
        GroceryItem("chicken breast", "protein", 1, "kg"),
        GroceryItem("broccoli", "vegetables", 2, "heads"),
        GroceryItem("bananas", "fruits", 6, "pieces"),
    ]
    
    for item in sample_items:
        shopping_list.add_item(item)
    
    # Create sample purchase history
    purchase_history = PurchaseHistory()
    base_date = datetime.now()
    
    sample_purchases = [
        ("milk", "dairy", 1, "liter", 7),
        ("bread", "grains", 1, "loaf", 14),
        ("eggs", "protein", 12, "pieces", 21),
        ("apples", "fruits", 6, "pieces", 10),
        ("rice", "grains", 2, "kg", 28),
        ("chicken", "protein", 1, "kg", 5),
        ("tomatoes", "vegetables", 1, "kg", 12),
        ("pasta", "grains", 2, "boxes", 18),
        ("yogurt", "dairy", 4, "cups", 3),
        ("onions", "vegetables", 1, "kg", 25),
    ]
    
    for name, category, quantity, unit, days_ago in sample_purchases:
        item = GroceryItem(name, category, quantity, unit)
        item.purchase_date = base_date - timedelta(days=days_ago)
        purchase_history.add_purchase(item)
    
    # Save the demo data
    data_manager.save_shopping_list(shopping_list)
    data_manager.save_purchase_history(purchase_history)
    
    print("✅ Demo data created successfully!")
    print(f"   • Shopping list: {shopping_list.item_count} items")
    print(f"   • Purchase history: {purchase_history.total_purchases} purchases")

def run_all_tests():
    """Run all test functions"""
    print("🚀 Starting Smart Grocery Shopping Assistant Tests")
    print("=" * 60)
    
    try:
        test_grocery_item()
        test_shopping_list()
        test_purchase_history()
        test_rule_engine()
        test_recommendation_engine()
        test_expiration_tracker()
        test_data_manager()
        create_demo_data()
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS PASSED! 🎉")
        print("The Smart Grocery Shopping Assistant is ready to use!")
        print("\n📋 To start the application, run: python main.py")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    run_all_tests()
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from datetime import datetime, timedelta
import json

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.grocery_item import GroceryItem
from src.models.shopping_list import ShoppingList
from src.models.purchase_history import PurchaseHistory
from src.engines.rule_engine import RuleEngine
from src.engines.recommendation_engine import RecommendationEngine
from src.utils.data_manager import DataManager
from src.utils.expiration_tracker import ExpirationTracker

app = Flask(__name__)
CORS(app)

# Initialize components
data_manager = DataManager()
rule_engine = RuleEngine()
recommendation_engine = RecommendationEngine()
expiration_tracker = ExpirationTracker()

def serialize_datetime(obj):
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object {obj} is not JSON serializable")

@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({'error': str(error)}), 500

# Shopping List Endpoints
@app.route('/api/shopping-list', methods=['GET'])
def get_shopping_list():
    shopping_list = data_manager.load_shopping_list()
    return jsonify(shopping_list.to_dict())

@app.route('/api/shopping-list/items', methods=['POST'])
def add_item_to_list():
    data = request.get_json()
    
    item = GroceryItem(
        name=data['name'],
        category=data['category'],
        quantity=data.get('quantity', 1),
        unit=data.get('unit', 'pieces'),
        expiration_days=data.get('expiration_days', 7),
        price=data.get('price', 0.0),
        is_organic=data.get('is_organic', False)
    )
    
    shopping_list = data_manager.load_shopping_list()
    shopping_list.add_item(item)
    data_manager.save_shopping_list(shopping_list)
    
    return jsonify({'message': 'Item added successfully', 'item': item.to_dict()})

@app.route('/api/shopping-list/items/<item_name>', methods=['DELETE'])
def remove_item_from_list(item_name):
    data = request.get_json() or {}
    category = data.get('category')
    
    shopping_list = data_manager.load_shopping_list()
    success = shopping_list.remove_item(item_name, category)
    
    if success:
        data_manager.save_shopping_list(shopping_list)
        return jsonify({'message': 'Item removed successfully'})
    else:
        return jsonify({'error': 'Item not found'}), 404

@app.route('/api/shopping-list/items/<item_name>/quantity', methods=['PUT'])
def update_item_quantity(item_name):
    data = request.get_json()
    new_quantity = data['quantity']
    category = data.get('category')
    
    shopping_list = data_manager.load_shopping_list()
    success = shopping_list.update_quantity(item_name, new_quantity, category)
    
    if success:
        data_manager.save_shopping_list(shopping_list)
        return jsonify({'message': 'Quantity updated successfully'})
    else:
        return jsonify({'error': 'Item not found'}), 404

@app.route('/api/shopping-list/clear', methods=['DELETE'])
def clear_shopping_list():
    shopping_list = data_manager.load_shopping_list()
    shopping_list.clear_list()
    data_manager.save_shopping_list(shopping_list)
    return jsonify({'message': 'Shopping list cleared'})

# Purchase History Endpoints
@app.route('/api/purchase-history', methods=['GET'])
def get_purchase_history():
    history = data_manager.load_purchase_history()
    return jsonify(history.to_dict())

@app.route('/api/purchase-history/items', methods=['POST'])
def add_purchase():
    data = request.get_json()
    
    item = GroceryItem(
        name=data['name'],
        category=data['category'],
        quantity=data.get('quantity', 1),
        unit=data.get('unit', 'pieces'),
        expiration_days=data.get('expiration_days', 7),
        price=data.get('price', 0.0),
        is_organic=data.get('is_organic', False)
    )
    
    # Set purchase date if provided
    if data.get('purchase_date'):
        item.purchase_date = datetime.fromisoformat(data['purchase_date'])
    
    history = data_manager.load_purchase_history()
    history.add_purchase(item)
    data_manager.save_purchase_history(history)
    
    return jsonify({'message': 'Purchase added successfully'})

@app.route('/api/purchase-history/mark-purchased', methods=['POST'])
def mark_items_as_purchased():
    """Mark shopping list items as purchased and move to history"""
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    # Move all items from shopping list to purchase history
    for item in shopping_list.items:
        history.add_purchase(item)
    
    # Clear shopping list
    shopping_list.clear_list()
    
    # Save both
    data_manager.save_shopping_list(shopping_list)
    data_manager.save_purchase_history(history)
    
    return jsonify({'message': 'Items marked as purchased'})

@app.route('/api/purchase-history/stats', methods=['GET'])
def get_purchase_stats():
    history = data_manager.load_purchase_history()
    stats = history.get_summary_stats()
    
    # Convert datetime objects to ISO format
    if stats.get('date_range'):
        start_date, end_date = stats['date_range']
        stats['date_range'] = {
            'start': start_date.isoformat(),
            'end': end_date.isoformat()
        }
    
    return jsonify(stats)

# Suggestions Endpoints
@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    suggestions = rule_engine.generate_suggestions(shopping_list, history)
    return jsonify(suggestions)

@app.route('/api/suggestions/patterns', methods=['GET'])
def get_shopping_patterns():
    history = data_manager.load_purchase_history()
    patterns = rule_engine.analyze_shopping_patterns(history)
    return jsonify(patterns)

# Health Recommendations Endpoints
@app.route('/api/health/alternatives/<item_name>', methods=['GET'])
def get_healthy_alternative(item_name):
    alternative = recommendation_engine.get_healthy_alternative(item_name)
    if alternative:
        return jsonify(alternative)
    else:
        return jsonify({'message': 'No healthy alternative found'}), 404

@app.route('/api/health/list-rating', methods=['GET'])
def get_list_health_rating():
    shopping_list = data_manager.load_shopping_list()
    rating = recommendation_engine.rate_shopping_list_healthiness(shopping_list)
    return jsonify(rating)

@app.route('/api/health/suggestions', methods=['GET'])
def get_health_suggestions():
    shopping_list = data_manager.load_shopping_list()
    suggestions = recommendation_engine.suggest_healthier_shopping_list(shopping_list)
    return jsonify(suggestions)

@app.route('/api/health/nutrient-boosters', methods=['GET'])
def get_nutrient_boosters():
    shopping_list = data_manager.load_shopping_list()
    boosters = recommendation_engine.suggest_nutrient_boosters(shopping_list)
    return jsonify(boosters)

# Expiration Tracking Endpoints
@app.route('/api/expiration/check', methods=['GET'])
def check_expiring_items():
    days_ahead = request.args.get('days', 7, type=int)
    history = data_manager.load_purchase_history()
    
    expiring_items = expiration_tracker.check_expiring_items(history, days_ahead)
    
    # Convert items to dict format
    result = {}
    for category, items in expiring_items.items():
        result[category] = [item.to_dict() for item in items]
    
    return jsonify(result)

@app.route('/api/expiration/reminders', methods=['GET'])
def get_expiration_reminders():
    history = data_manager.load_purchase_history()
    reminders = expiration_tracker.get_expiration_reminders(history)
    
    # Convert items to dict format
    for reminder in reminders:
        if 'item' in reminder:
            reminder['item'] = reminder['item'].to_dict()
    
    return jsonify(reminders)

@app.route('/api/expiration/meal-suggestions', methods=['GET'])
def get_meal_suggestions():
    history = data_manager.load_purchase_history()
    expiring_items = expiration_tracker.check_expiring_items(history, 7)
    
    # Combine all expiring items
    all_expiring = []
    for items in expiring_items.values():
        all_expiring.extend(items)
    
    meal_suggestions = expiration_tracker.suggest_meal_planning(all_expiring)
    
    # Convert items to dict format
    for suggestion in meal_suggestions:
        if 'ingredients' in suggestion:
            suggestion['ingredients'] = [item.to_dict() for item in suggestion['ingredients']]
    
    return jsonify(meal_suggestions)

@app.route('/api/expiration/summary', methods=['GET'])
def get_expiration_summary():
    history = data_manager.load_purchase_history()
    summary = expiration_tracker.get_expiration_summary(history)
    return jsonify(summary)

# Data Management Endpoints
@app.route('/api/data/summary', methods=['GET'])
def get_data_summary():
    summary = data_manager.get_data_summary()
    return jsonify(summary)

@app.route('/api/data/backup', methods=['POST'])
def backup_data():
    success = data_manager.backup_data()
    if success:
        return jsonify({'message': 'Data backed up successfully'})
    else:
        return jsonify({'error': 'Backup failed'}), 500

@app.route('/api/data/clear', methods=['DELETE'])
def clear_all_data():
    success = data_manager.clear_all_data(confirm=True)
    if success:
        return jsonify({'message': 'All data cleared'})
    else:
        return jsonify({'error': 'Failed to clear data'}), 500

@app.route('/api/data/sample', methods=['POST'])
def add_sample_data():
    """Add sample data for demo purposes"""
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
    history = PurchaseHistory()
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
        history.add_purchase(item)
    
    # Save the sample data
    data_manager.save_shopping_list(shopping_list)
    data_manager.save_purchase_history(history)
    
    return jsonify({
        'message': 'Sample data added successfully',
        'shopping_list_items': shopping_list.item_count,
        'purchase_history_items': history.total_purchases
    })

# User Preferences Endpoints
@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    preferences = data_manager.load_user_preferences()
    return jsonify(preferences)

@app.route('/api/preferences', methods=['PUT'])
def update_preferences():
    data = request.get_json()
    success = data_manager.save_user_preferences(data)
    
    if success:
        return jsonify({'message': 'Preferences updated successfully'})
    else:
        return jsonify({'error': 'Failed to update preferences'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
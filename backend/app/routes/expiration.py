from flask import Blueprint, request, jsonify
import sys
import os
from datetime import datetime, timedelta

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.expiration_tracker import ExpirationTracker
from src.utils.data_manager import DataManager

expiration_bp = Blueprint('expiration', __name__)
data_manager = DataManager()
expiration_tracker = ExpirationTracker()

@expiration_bp.route('/expiration/check', methods=['GET'])
def check_expiring_items():
    """Check for expiring items"""
    days_ahead = request.args.get('days', 7, type=int)
    history = data_manager.load_purchase_history()
    
    expiring_items = expiration_tracker.check_expiring_items(history, days_ahead)
    
    # Convert items to dict format
    result = {}
    for category, items in expiring_items.items():
        result[category] = [item.to_dict() for item in items]
    
    return jsonify(result)

@expiration_bp.route('/expiration/reminders', methods=['GET'])
def get_expiration_reminders():
    """Get expiration reminders"""
    history = data_manager.load_purchase_history()
    reminders = expiration_tracker.get_expiration_reminders(history)
    
    # Convert items to dict format
    for reminder in reminders:
        if 'item' in reminder:
            reminder['item'] = reminder['item'].to_dict()
    
    return jsonify(reminders)

@expiration_bp.route('/expiration/meal-suggestions', methods=['GET'])
def get_meal_suggestions():
    """Get meal suggestions based on expiring items"""
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

@expiration_bp.route('/expiration/items', methods=['GET'])
def get_expiring_items_detailed():
    """Get detailed list of expiring items with enhanced data for frontend"""
    history = data_manager.load_purchase_history()
    
    # Get all items from history and calculate expiration
    items_with_expiration = []
    
    for item in history.items:
        if hasattr(item, 'purchase_date') and item.purchase_date:
            expiration_date = item.purchase_date + timedelta(days=item.expiration_days)
            days_until_expiration = (expiration_date - datetime.now()).days
            
            item_data = item.to_dict()
            item_data.update({
                'expiration_date': expiration_date.isoformat(),
                'days_until_expiration': days_until_expiration,
                'id': f"{item.name}_{item.category}_{item.purchase_date.strftime('%Y%m%d')}"
            })
            items_with_expiration.append(item_data)
    
    return jsonify(items_with_expiration)

@expiration_bp.route('/expiration/meals', methods=['GET'])
def get_meal_plans():
    """Get meal plans based on available/expiring ingredients"""
    history = data_manager.load_purchase_history()
    
    # Mock meal suggestions for now
    meal_suggestions = [
        {
            'name': 'Quick Vegetable Stir Fry',
            'description': 'Use up fresh vegetables before they expire',
            'ingredients': ['broccoli', 'carrots', 'bell peppers', 'onions']
        },
        {
            'name': 'Fruit Smoothie Bowl',
            'description': 'Perfect for overripe bananas and berries',
            'ingredients': ['bananas', 'berries', 'yogurt', 'honey']
        },
        {
            'name': 'Hearty Soup',
            'description': 'Great way to use various vegetables',
            'ingredients': ['potatoes', 'carrots', 'celery', 'onions']
        }
    ]
    
    return jsonify(meal_suggestions)
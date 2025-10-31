from flask import Blueprint, request, jsonify
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.engines.rule_engine import RuleEngine
from src.utils.data_manager import DataManager

suggestions_bp = Blueprint('suggestions', __name__)
data_manager = DataManager()
rule_engine = RuleEngine()

@suggestions_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Get AI-generated shopping suggestions"""
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    suggestions = rule_engine.generate_suggestions(shopping_list, history)
    return jsonify(suggestions)

@suggestions_bp.route('/suggestions/patterns', methods=['GET'])
def get_shopping_patterns():
    """Get analysis of shopping patterns"""
    history = data_manager.load_purchase_history()
    patterns = rule_engine.analyze_shopping_patterns(history)
    return jsonify(patterns)

@suggestions_bp.route('/suggestions/refresh', methods=['POST'])
def refresh_suggestions():
    """Force refresh of suggestions"""
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    # Clear any cached suggestions and regenerate
    suggestions = rule_engine.generate_suggestions(shopping_list, history)
    return jsonify({
        'message': 'Suggestions refreshed',
        'suggestions': suggestions
    })

@suggestions_bp.route('/purchase-history', methods=['GET'])
def get_purchase_history():
    """Get purchase history"""
    history = data_manager.load_purchase_history()
    return jsonify(history.to_dict())

@suggestions_bp.route('/purchase-history/items', methods=['POST'])
def add_purchase():
    """Add item to purchase history"""
    from datetime import datetime
    from src.models.grocery_item import GroceryItem
    
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

@suggestions_bp.route('/purchase-history/mark-purchased', methods=['POST'])
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

@suggestions_bp.route('/purchase-history/stats', methods=['GET'])
def get_purchase_stats():
    """Get purchase history statistics"""
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
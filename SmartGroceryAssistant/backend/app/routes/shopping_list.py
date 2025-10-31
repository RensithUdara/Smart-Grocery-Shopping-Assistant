from flask import Blueprint, request, jsonify
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.models.grocery_item import GroceryItem
from src.utils.data_manager import DataManager

shopping_bp = Blueprint('shopping', __name__)
data_manager = DataManager()

@shopping_bp.route('/shopping-list', methods=['GET'])
def get_shopping_list():
    """Get current shopping list"""
    shopping_list = data_manager.load_shopping_list()
    return jsonify(shopping_list.to_dict())

@shopping_bp.route('/shopping-list/items', methods=['POST'])
def add_item_to_list():
    """Add item to shopping list"""
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

@shopping_bp.route('/shopping-list/items/<item_name>', methods=['DELETE'])
def remove_item_from_list(item_name):
    """Remove item from shopping list"""
    data = request.get_json() or {}
    category = data.get('category')
    
    shopping_list = data_manager.load_shopping_list()
    success = shopping_list.remove_item(item_name, category)
    
    if success:
        data_manager.save_shopping_list(shopping_list)
        return jsonify({'message': 'Item removed successfully'})
    else:
        return jsonify({'error': 'Item not found'}), 404

@shopping_bp.route('/shopping-list/items/<item_name>/quantity', methods=['PUT'])
def update_item_quantity(item_name):
    """Update item quantity in shopping list"""
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

@shopping_bp.route('/shopping-list/clear', methods=['DELETE'])
def clear_shopping_list():
    """Clear entire shopping list"""
    shopping_list = data_manager.load_shopping_list()
    shopping_list.clear_list()
    data_manager.save_shopping_list(shopping_list)
    return jsonify({'message': 'Shopping list cleared'})

@shopping_bp.route('/shopping-list/summary', methods=['GET'])
def get_shopping_list_summary():
    """Get shopping list summary with statistics"""
    shopping_list = data_manager.load_shopping_list()
    items = shopping_list.items
    
    summary = {
        'total_items': len(items),
        'total_quantity': sum(item.quantity for item in items),
        'estimated_total': sum(item.price * item.quantity for item in items),
        'categories': {},
        'organic_count': len([item for item in items if item.is_organic])
    }
    
    # Count by category
    for item in items:
        if item.category not in summary['categories']:
            summary['categories'][item.category] = 0
        summary['categories'][item.category] += item.quantity
    
    return jsonify(summary)
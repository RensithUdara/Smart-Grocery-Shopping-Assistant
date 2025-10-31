from flask import Blueprint, request, jsonify
import sys
import os
from datetime import datetime, timedelta

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.data_manager import DataManager
from src.models.shopping_list import ShoppingList
from src.models.purchase_history import PurchaseHistory
from src.models.grocery_item import GroceryItem

analytics_bp = Blueprint('analytics', __name__)
data_manager = DataManager()

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get comprehensive analytics data"""
    history = data_manager.load_purchase_history()
    shopping_list = data_manager.load_shopping_list()
    
    # Calculate analytics
    items = history.items
    if not items:
        return jsonify({
            'total_spent': 0,
            'total_items': 0,
            'shopping_trips': 0,
            'avg_per_trip': 0,
            'message': 'No purchase history available'
        })
    
    # Basic metrics
    total_spent = sum(item.price * item.quantity for item in items)
    total_items = len(items)
    
    # Group by purchase dates to count shopping trips
    purchase_dates = set()
    for item in items:
        if hasattr(item, 'purchase_date') and item.purchase_date:
            purchase_dates.add(item.purchase_date.date())
    
    shopping_trips = len(purchase_dates)
    avg_per_trip = total_spent / shopping_trips if shopping_trips > 0 else 0
    
    # Category breakdown
    category_breakdown = {}
    for item in items:
        if item.category not in category_breakdown:
            category_breakdown[item.category] = {'amount': 0, 'items': 0}
        category_breakdown[item.category]['amount'] += item.price * item.quantity
        category_breakdown[item.category]['items'] += 1
    
    # Convert to list format for charts
    category_list = []
    for category, data in category_breakdown.items():
        category_list.append({
            'name': category,
            'amount': data['amount'],
            'items': data['items']
        })
    
    # Monthly spending trend (mock data for now)
    monthly_spending = []
    current_date = datetime.now()
    for i in range(6):
        month_date = current_date - timedelta(days=30 * i)
        month_name = month_date.strftime('%b %Y')
        # Mock spending based on historical pattern
        amount = total_spent * (0.8 + 0.4 * (i % 3)) / 6
        monthly_spending.insert(0, {
            'month': month_name,
            'amount': round(amount, 2)
        })
    
    # Weekly spending pattern
    weekly_spending = [
        {'day': 'Mon', 'amount': total_spent * 0.1},
        {'day': 'Tue', 'amount': total_spent * 0.08},
        {'day': 'Wed', 'amount': total_spent * 0.12},
        {'day': 'Thu', 'amount': total_spent * 0.15},
        {'day': 'Fri', 'amount': total_spent * 0.18},
        {'day': 'Sat', 'amount': total_spent * 0.25},
        {'day': 'Sun', 'amount': total_spent * 0.12}
    ]
    
    # Organic vs regular analysis
    organic_items = [item for item in items if item.is_organic]
    organic_spending = sum(item.price * item.quantity for item in organic_items)
    organic_percentage = (len(organic_items) / len(items)) * 100 if items else 0
    
    analytics_data = {
        'total_spent': round(total_spent, 2),
        'total_items': total_items,
        'shopping_trips': shopping_trips,
        'avg_per_trip': round(avg_per_trip, 2),
        'spending_trend': 'up',  # Mock trend
        'category_breakdown': category_list,
        'monthly_spending': monthly_spending,
        'weekly_spending': weekly_spending,
        'highest_purchase': max(item.price * item.quantity for item in items) if items else 0,
        'daily_average': round(total_spent / 30, 2),  # Assume 30 days
        'budget_efficiency': 85,  # Mock percentage
        'organic_vs_regular': {
            'organic_percentage': round(organic_percentage, 1),
            'organic_spending': round(organic_spending, 2),
            'organic_premium': 1.5  # Mock premium
        },
        'seasonal_trends': {
            'spring': {'avg_spending': total_spent * 0.2, 'popular_category': 'fruits'},
            'summer': {'avg_spending': total_spent * 0.3, 'popular_category': 'vegetables'},
            'fall': {'avg_spending': total_spent * 0.25, 'popular_category': 'grains'},
            'winter': {'avg_spending': total_spent * 0.25, 'popular_category': 'protein'}
        },
        'growth_metrics': {
            'monthly_growth': 5.2,  # Mock percentage
            'item_diversity': 75.0,  # Mock percentage
            'efficiency_score': 8.5   # Items per trip
        },
        'predictions': {
            'next_month': round(total_spent * 1.1, 2),
            'potential_savings': round(total_spent * 0.15, 2)
        }
    }
    
    return jsonify(analytics_data)

@analytics_bp.route('/data/summary', methods=['GET'])
def get_data_summary():
    """Get data summary"""
    summary = data_manager.get_data_summary()
    return jsonify(summary)

@analytics_bp.route('/data/backup', methods=['POST'])
def backup_data():
    """Create data backup"""
    success = data_manager.backup_data()
    if success:
        return jsonify({'message': 'Data backed up successfully'})
    else:
        return jsonify({'error': 'Backup failed'}), 500

@analytics_bp.route('/data/clear', methods=['DELETE'])
def clear_all_data():
    """Clear all data"""
    success = data_manager.clear_all_data(confirm=True)
    if success:
        return jsonify({'message': 'All data cleared'})
    else:
        return jsonify({'error': 'Failed to clear data'}), 500

@analytics_bp.route('/data/sample', methods=['POST'])
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
        ("milk", "dairy", 1, "liter", 7, 3.50),
        ("bread", "grains", 1, "loaf", 14, 2.99),
        ("eggs", "protein", 12, "pieces", 21, 4.25),
        ("apples", "fruits", 6, "pieces", 10, 5.99),
        ("rice", "grains", 2, "kg", 28, 8.50),
        ("chicken", "protein", 1, "kg", 5, 12.99),
        ("tomatoes", "vegetables", 1, "kg", 12, 4.50),
        ("pasta", "grains", 2, "boxes", 18, 6.98),
        ("yogurt", "dairy", 4, "cups", 3, 7.96),
        ("onions", "vegetables", 1, "kg", 25, 2.75),
    ]
    
    for name, category, quantity, unit, days_ago, price in sample_purchases:
        item = GroceryItem(name, category, quantity, unit, price=price)
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

@analytics_bp.route('/preferences', methods=['GET'])
def get_preferences():
    """Get user preferences"""
    preferences = data_manager.load_user_preferences()
    return jsonify(preferences)

@analytics_bp.route('/preferences', methods=['PUT'])
def update_preferences():
    """Update user preferences"""
    data = request.get_json()
    success = data_manager.save_user_preferences(data)
    
    if success:
        return jsonify({'message': 'Preferences updated successfully'})
    else:
        return jsonify({'error': 'Failed to update preferences'}), 500
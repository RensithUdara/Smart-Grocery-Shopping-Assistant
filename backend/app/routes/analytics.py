from flask import Blueprint, request, jsonify
import sys
import os
from datetime import datetime, timedelta

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.data_manager import DataManager
from src.utils.advanced_analytics import AdvancedAnalytics
from src.models.shopping_list import ShoppingList
from src.models.purchase_history import PurchaseHistory
from src.models.grocery_item import GroceryItem

analytics_bp = Blueprint('analytics', __name__)
data_manager = DataManager()
advanced_analytics = AdvancedAnalytics()

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

# Enhanced Analytics Endpoints

@analytics_bp.route('/analytics/enhanced/spending-trends', methods=['GET'])
def get_enhanced_spending_trends():
    """Get enhanced spending trends and patterns"""
    try:
        days = int(request.args.get('days', 30))
        trends_data = advanced_analytics.get_spending_trends(days)
        
        return jsonify({
            'status': 'success',
            'data': trends_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get spending trends: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/nutritional-analysis', methods=['GET'])
def get_enhanced_nutritional_analysis():
    """Get nutritional analysis and health insights"""
    try:
        days = int(request.args.get('days', 30))
        nutrition_data = advanced_analytics.get_nutritional_analysis(days)
        
        return jsonify({
            'status': 'success',
            'data': nutrition_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get nutritional analysis: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/seasonal-patterns', methods=['GET'])
def get_enhanced_seasonal_patterns():
    """Get seasonal shopping patterns and recommendations"""
    try:
        patterns_data = advanced_analytics.get_seasonal_patterns()
        
        return jsonify({
            'status': 'success',
            'data': patterns_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get seasonal patterns: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/waste-reduction', methods=['GET'])
def get_enhanced_waste_reduction():
    """Get waste reduction metrics and efficiency analysis"""
    try:
        waste_data = advanced_analytics.get_waste_reduction_metrics()
        
        return jsonify({
            'status': 'success',
            'data': waste_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get waste reduction metrics: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/predictive-insights', methods=['GET'])
def get_enhanced_predictive_insights():
    """Get enhanced predictive insights for future shopping needs"""
    try:
        insights_data = advanced_analytics.get_predictive_insights()
        
        return jsonify({
            'status': 'success',
            'data': insights_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get predictive insights: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/comprehensive-report', methods=['GET'])
def get_enhanced_comprehensive_report():
    """Get comprehensive enhanced analytics report"""
    try:
        comprehensive_data = advanced_analytics.generate_comprehensive_report()
        
        return jsonify({
            'status': 'success',
            'data': comprehensive_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to generate comprehensive report: {str(e)}'
        }), 500

@analytics_bp.route('/analytics/enhanced/dashboard-summary', methods=['GET'])
def get_enhanced_dashboard_summary():
    """Get summary data for enhanced analytics dashboard"""
    try:
        # Get key metrics for dashboard
        spending_trends = advanced_analytics.get_spending_trends(30)
        nutritional_analysis = advanced_analytics.get_nutritional_analysis(30)
        waste_metrics = advanced_analytics.get_waste_reduction_metrics()
        predictive_insights = advanced_analytics.get_predictive_insights()
        
        summary = {
            'spending': {
                'total_30_days': spending_trends['total_spent'],
                'daily_average': spending_trends['average_daily'],
                'trend': spending_trends['trend_analysis']['trend'],
                'change_percent': spending_trends['trend_analysis']['change_percent']
            },
            'nutrition': {
                'health_score': nutritional_analysis['health_score']['overall_score'],
                'protein_score': nutritional_analysis['health_score']['protein_score'],
                'fiber_score': nutritional_analysis['health_score']['fiber_score'],
                'recommendations_count': len(nutritional_analysis['recommendations'])
            },
            'efficiency': {
                'waste_rate': waste_metrics['waste_rate_percentage'],
                'efficiency_score': waste_metrics['efficiency_score'],
                'waste_cost': waste_metrics['estimated_waste_cost'],
                'items_tracked': waste_metrics['total_items_tracked']
            },
            'predictions': {
                'items_predicted': len(predictive_insights['predicted_needs']),
                'high_confidence': len([p for p in predictive_insights['predicted_needs'] if p['confidence'] > 80]),
                'shopping_frequency': predictive_insights['shopping_patterns'].get('average_days_between_trips', 0)
            },
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'data': summary
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get dashboard summary: {str(e)}'
        }), 500
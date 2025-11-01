from flask import Blueprint, request, jsonify
import sys
import os
from datetime import datetime

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.budget_manager import BudgetManager
from src.utils.data_manager import DataManager

budget_bp = Blueprint('budget', __name__)
data_manager = DataManager()
budget_manager = BudgetManager()

@budget_bp.route('/budget/set', methods=['POST'])
def set_budget():
    """Set monthly budget limit"""
    data = request.get_json()
    amount = data.get('amount', 0)
    
    result = budget_manager.set_monthly_budget(amount)
    return jsonify(result)

@budget_bp.route('/budget/summary', methods=['GET'])
def get_budget_summary():
    """Get budget spending summary"""
    days = request.args.get('days', 30, type=int)
    history = data_manager.load_purchase_history()
    
    summary = budget_manager.get_spending_summary(history, days)
    return jsonify(summary)

@budget_bp.route('/budget/alerts', methods=['GET'])
def get_budget_alerts():
    """Get budget alerts and warnings"""
    history = data_manager.load_purchase_history()
    alerts = budget_manager.check_budget_alerts(history)
    return jsonify(alerts)

@budget_bp.route('/budget/optimizations', methods=['GET'])
def get_cost_optimizations():
    """Get cost optimization suggestions"""
    history = data_manager.load_purchase_history()
    suggestions = budget_manager.suggest_cost_optimizations(history)
    return jsonify(suggestions)

@budget_bp.route('/budget/price-analysis', methods=['GET'])
def get_price_analysis():
    """Get price per unit analysis"""
    history = data_manager.load_purchase_history()
    analysis = budget_manager.get_price_per_unit_analysis(history)
    return jsonify(analysis)

@budget_bp.route('/budget/recommendations', methods=['GET'])
def get_budget_recommendations():
    """Get personalized budget recommendations"""
    history = data_manager.load_purchase_history()
    recommendations = budget_manager.get_budget_recommendations(history)
    return jsonify(recommendations)

@budget_bp.route('/budget/category-breakdown', methods=['GET'])
def get_category_breakdown():
    """Get detailed category spending breakdown"""
    days = request.args.get('days', 30, type=int)
    history = data_manager.load_purchase_history()
    
    summary = budget_manager.get_spending_summary(history, days)
    category_spending = summary.get('category_spending', {})
    
    # Calculate percentages and add budget limits
    total_spent = summary.get('total_spent', 0)
    monthly_budget = budget_manager.default_monthly_budget
    
    breakdown = []
    for category, amount in category_spending.items():
        percentage = (amount / total_spent * 100) if total_spent > 0 else 0
        category_budget = monthly_budget * budget_manager.category_budget_percentages.get(category, 0.05)
        
        breakdown.append({
            'category': category,
            'amount_spent': amount,
            'percentage_of_total': round(percentage, 1),
            'category_budget': category_budget,
            'budget_usage': round((amount / category_budget * 100), 1) if category_budget > 0 else 0,
            'status': 'over' if amount > category_budget else 'under'
        })
    
    return jsonify({
        'breakdown': sorted(breakdown, key=lambda x: x['amount_spent'], reverse=True),
        'total_spent': total_spent,
        'monthly_budget': monthly_budget,
        'days_analyzed': days
    })

@budget_bp.route('/budget/trends', methods=['GET'])
def get_spending_trends():
    """Get spending trends over time"""
    history = data_manager.load_purchase_history()
    
    # Get spending for different periods
    weekly_summary = budget_manager.get_spending_summary(history, 7)
    monthly_summary = budget_manager.get_spending_summary(history, 30)
    quarterly_summary = budget_manager.get_spending_summary(history, 90)
    
    return jsonify({
        'weekly': weekly_summary,
        'monthly': monthly_summary,
        'quarterly': quarterly_summary,
        'trends': {
            'weekly_average': weekly_summary.get('average_daily_spend', 0),
            'monthly_projection': weekly_summary.get('average_daily_spend', 0) * 30,
            'budget_on_track': monthly_summary.get('budget_percentage', 0) <= 75
        }
    })
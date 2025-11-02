#!/usr/bin/env python3
"""
Advanced Budget Management API Routes

Flask Blueprint for budget forecasting, spending analysis, price alerts,
bulk purchase recommendations, and financial goal tracking.

Endpoints:
- POST /api/budget/forecast - Generate budget forecasts
- GET /api/budget/spending-analysis - Analyze spending patterns
- GET /api/budget/price-alerts - Get price drop alerts
- POST /api/budget/bulk-recommendations - Get bulk purchase recommendations
- GET /api/budget/goals - Track budget goal progress
- GET /api/budget/savings-opportunities - Get savings opportunities
- POST /api/budget/goals - Create or update budget goals
- GET /api/budget/transactions - Get transaction history
- POST /api/budget/transactions - Add new transaction
- DELETE /api/budget/transactions/<id> - Delete transaction
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import json
import os
import sys

# Try relative import from src.utils
try:
    from ...src.utils.budget_engine import BudgetManagementEngine, SpendingTransaction, SpendingCategory, BudgetGoal
except Exception:
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'utils'))
    from budget_engine import BudgetManagementEngine, SpendingTransaction, SpendingCategory, BudgetGoal

budget_bp = Blueprint('budget', __name__)
budget_engine = BudgetManagementEngine()


@budget_bp.route('/api/budget/forecast', methods=['POST'])
def generate_budget_forecast():
    """Generate budget forecasts based on historical spending patterns."""
    try:
        data = request.get_json() or {}
        time_period = data.get('time_period', 'monthly')  # weekly, monthly, yearly
        
        if time_period not in ['weekly', 'monthly', 'yearly']:
            return jsonify({
                'success': False,
                'error': 'Invalid time period. Use weekly, monthly, or yearly.'
            }), 400
        
        forecast = budget_engine.forecast_budget_needs(time_period)
        
        return jsonify({
            'success': True,
            'data': forecast
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/spending-analysis', methods=['GET'])
def get_spending_analysis():
    """Get comprehensive spending pattern analysis."""
    try:
        analysis = budget_engine.analyze_spending_patterns()
        
        return jsonify({
            'success': True,
            'data': analysis
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/price-alerts', methods=['GET'])
def get_price_alerts():
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
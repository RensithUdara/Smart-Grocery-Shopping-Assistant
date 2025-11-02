#!/usr/bin/env python3
"""
Advanced Budget Management API Routes

Flask Blueprint for budget forecasting, spending analysis, price alerts,
bulk purchase recommendations, and financial goal tracking.
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
        time_period = data.get('time_period', 'monthly')
        
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
    """Get current price drop alerts."""
    try:
        alerts = budget_engine.detect_price_drops()
        
        alert_data = []
        for alert in alerts:
            alert_data.append({
                'item': alert.item,
                'target_price': alert.target_price,
                'current_price': alert.current_price,
                'store': alert.store,
                'savings_amount': alert.savings_amount,
                'alert_type': alert.alert_type,
                'savings_percentage': round(((alert.target_price - alert.current_price) / alert.target_price) * 100, 1),
                'created_at': alert.created_at.isoformat() if alert.created_at else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'alerts': alert_data,
                'count': len(alert_data)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/bulk-recommendations', methods=['POST'])
def get_bulk_recommendations():
    """Get bulk purchase recommendations for shopping list."""
    try:
        data = request.get_json() or {}
        shopping_list = data.get('shopping_list', [])
        
        if not shopping_list:
            return jsonify({
                'success': False,
                'error': 'Shopping list is required'
            }), 400
        
        recommendations = budget_engine.recommend_bulk_purchases(shopping_list)
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations,
                'count': len(recommendations)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/goals', methods=['GET'])
def get_budget_goals():
    """Get current budget goal tracking status."""
    try:
        goal_status = budget_engine.track_budget_goals()
        
        return jsonify({
            'success': True,
            'data': goal_status
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/goals', methods=['POST'])
def create_budget_goal():
    """Create or update a budget goal."""
    try:
        data = request.get_json() or {}
        
        required_fields = ['category', 'target_amount', 'time_period']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        category = data['category']
        target_amount = float(data['target_amount'])
        time_period = data['time_period']
        current_spent = float(data.get('current_spent', 0.0))
        
        if time_period not in ['weekly', 'monthly', 'yearly']:
            return jsonify({
                'success': False,
                'error': 'Invalid time period. Use weekly, monthly, or yearly.'
            }), 400
        
        # Create/update budget goal
        budget_engine.budget_goals[category] = BudgetGoal(
            category=category,
            target_amount=target_amount,
            time_period=time_period,
            current_spent=current_spent
        )
        
        return jsonify({
            'success': True,
            'message': f'Budget goal for {category} created/updated successfully'
        })
    except ValueError as e:
        return jsonify({'success': False, 'error': 'Invalid numeric value'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/savings-opportunities', methods=['GET'])
def get_savings_opportunities():
    """Get personalized savings opportunities."""
    try:
        opportunities = budget_engine.generate_savings_opportunities()
        
        return jsonify({
            'success': True,
            'data': {
                'opportunities': opportunities,
                'count': len(opportunities)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/transactions', methods=['GET'])
def get_transactions():
    """Get transaction history."""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        transaction_data = []
        for transaction in budget_engine.transaction_history[-limit:]:
            transaction_data.append({
                'item': transaction.item,
                'category': transaction.category.value,
                'amount': transaction.amount,
                'date': transaction.date.isoformat(),
                'store': transaction.store,
                'quantity': transaction.quantity,
                'unit_price': transaction.unit_price
            })
        
        return jsonify({
            'success': True,
            'data': {
                'transactions': transaction_data,
                'count': len(transaction_data),
                'total_amount': sum(t.amount for t in budget_engine.transaction_history[-limit:])
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/transactions', methods=['POST'])
def add_transaction():
    """Add a new spending transaction."""
    try:
        data = request.get_json() or {}
        
        required_fields = ['item', 'category', 'amount', 'store']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate category
        try:
            category = SpendingCategory(data['category'].lower())
        except ValueError:
            valid_categories = [c.value for c in SpendingCategory]
            return jsonify({
                'success': False,
                'error': f'Invalid category. Valid options: {valid_categories}'
            }), 400
        
        # Create new transaction
        transaction = SpendingTransaction(
            item=data['item'],
            category=category,
            amount=float(data['amount']),
            date=datetime.now(),
            store=data['store'],
            quantity=int(data.get('quantity', 1))
        )
        
        # Add to transaction history
        budget_engine.transaction_history.append(transaction)
        
        # Update relevant budget goal
        if category.value in budget_engine.budget_goals:
            budget_engine.budget_goals[category.value].current_spent += transaction.amount
        
        # Update total budget goal
        if 'total' in budget_engine.budget_goals:
            budget_engine.budget_goals['total'].current_spent += transaction.amount
        
        return jsonify({
            'success': True,
            'message': 'Transaction added successfully',
            'transaction': {
                'item': transaction.item,
                'category': transaction.category.value,
                'amount': transaction.amount,
                'date': transaction.date.isoformat(),
                'store': transaction.store,
                'quantity': transaction.quantity
            }
        })
    except ValueError as e:
        return jsonify({'success': False, 'error': 'Invalid numeric value'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@budget_bp.route('/api/budget/summary', methods=['GET'])
def get_budget_summary():
    """Get a comprehensive budget management summary."""
    try:
        # Get all the key metrics
        goals = budget_engine.track_budget_goals()
        spending_analysis = budget_engine.analyze_spending_patterns()
        price_alerts = budget_engine.detect_price_drops()
        savings_opportunities = budget_engine.generate_savings_opportunities()
        forecast = budget_engine.forecast_budget_needs('monthly')
        
        # Calculate summary metrics
        total_budget = sum(goal.target_amount for goal in budget_engine.budget_goals.values() if goal.category != 'total')
        total_spent = sum(goal.current_spent for goal in budget_engine.budget_goals.values() if goal.category != 'total')
        budget_utilization = (total_spent / total_budget * 100) if total_budget > 0 else 0
        
        summary = {
            'budget_overview': {
                'total_budget': total_budget,
                'total_spent': round(total_spent, 2),
                'remaining_budget': round(total_budget - total_spent, 2),
                'utilization_percentage': round(budget_utilization, 1)
            },
            'goal_summary': {
                'total_goals': len([g for g in goals.keys() if g != 'total']),
                'on_track': len([g for g in goals.values() if g['status'] == 'on_track']),
                'warning': len([g for g in goals.values() if g['status'] == 'warning']),
                'over_budget': len([g for g in goals.values() if g['status'] == 'over_budget'])
            },
            'alerts_summary': {
                'price_alerts': len(price_alerts),
                'savings_opportunities': len(savings_opportunities),
                'total_potential_savings': sum(
                    alert.savings_amount for alert in price_alerts
                ) + len(savings_opportunities) * 5  # Estimated average savings per opportunity
            },
            'top_categories': spending_analysis.get('top_spending_categories', [])[:3],
            'monthly_forecast': forecast.get('total_forecast', 0)
        }
        
        return jsonify({
            'success': True,
            'data': summary
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
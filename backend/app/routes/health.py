from flask import Blueprint, request, jsonify
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.engines.recommendation_engine import RecommendationEngine
from src.utils.data_manager import DataManager

health_bp = Blueprint('health', __name__)
data_manager = DataManager()
recommendation_engine = RecommendationEngine()

@health_bp.route('/health/alternatives/<item_name>', methods=['GET'])
def get_healthy_alternative(item_name):
    """Get healthy alternative for a specific item"""
    alternative = recommendation_engine.get_healthy_alternative(item_name)
    if alternative:
        return jsonify(alternative)
    else:
        return jsonify({'message': 'No healthy alternative found'}), 404

@health_bp.route('/health/list-rating', methods=['GET'])
def get_list_health_rating():
    """Get health rating for current shopping list"""
    shopping_list = data_manager.load_shopping_list()
    rating = recommendation_engine.rate_shopping_list_healthiness(shopping_list)
    return jsonify(rating)

@health_bp.route('/health/suggestions', methods=['GET'])
def get_health_suggestions():
    """Get healthier shopping list suggestions"""
    shopping_list = data_manager.load_shopping_list()
    suggestions = recommendation_engine.suggest_healthier_shopping_list(shopping_list)
    return jsonify(suggestions)

@health_bp.route('/health/nutrient-boosters', methods=['GET'])
def get_nutrient_boosters():
    """Get suggestions to boost nutrients in shopping list"""
    shopping_list = data_manager.load_shopping_list()
    boosters = recommendation_engine.suggest_nutrient_boosters(shopping_list)
    return jsonify(boosters)

@health_bp.route('/health/score', methods=['GET'])
def get_health_score():
    """Get overall health score"""
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    # Calculate health score based on shopping patterns
    rating = recommendation_engine.rate_shopping_list_healthiness(shopping_list)
    
    # Mock additional health metrics for frontend
    health_data = {
        'health_score': rating.get('overall_score', 75),
        'nutritional_analysis': {
            'category_balance': rating.get('category_balance', 'Good'),
            'organic_percentage': rating.get('organic_percentage', 25),
            'nutrients': {
                'protein': {'current': 80, 'recommended': 100, 'unit': 'g'},
                'fiber': {'current': 60, 'recommended': 100, 'unit': 'g'},
                'vitamins': {'current': 70, 'recommended': 100, 'unit': '%'},
                'minerals': {'current': 85, 'recommended': 100, 'unit': '%'}
            },
            'category_distribution': rating.get('category_breakdown', {}),
            'health_alerts': []
        }
    }
    
    # Add health alerts based on score
    if health_data['health_score'] < 60:
        health_data['nutritional_analysis']['health_alerts'].append({
            'severity': 'high',
            'title': 'Low Health Score',
            'description': 'Consider adding more fruits, vegetables, and whole grains to your diet.'
        })
    
    return jsonify(health_data)

@health_bp.route('/health/alternatives', methods=['GET'])
def get_all_alternatives():
    """Get healthy alternatives for all items in shopping list"""
    shopping_list = data_manager.load_shopping_list()
    alternatives = []
    
    for item in shopping_list.items:
        alternative = recommendation_engine.get_healthy_alternative(item.name)
        if alternative:
            alternatives.append({
                'original_name': item.name,
                'original_category': item.category,
                'alternative_name': alternative['name'],
                'category': alternative.get('category', item.category),
                'health_improvement': alternative.get('health_score_improvement', 10),
                'benefits': alternative.get('benefits', ['Lower calories', 'More nutrients']),
                'nutritional_comparison': alternative.get('nutritional_comparison', {}),
                'price_difference': alternative.get('price_difference', 0)
            })
    
    return jsonify(alternatives)

@health_bp.route('/health/analysis', methods=['GET'])
def get_nutritional_analysis():
    """Get detailed nutritional analysis"""
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    # Get basic rating
    rating = recommendation_engine.rate_shopping_list_healthiness(shopping_list)
    
    # Enhanced analysis for frontend
    analysis = {
        'category_balance': rating.get('category_balance', 'Good'),
        'organic_percentage': rating.get('organic_percentage', 25),
        'nutrients': {
            'protein': {'current': 80, 'recommended': 100, 'unit': 'g'},
            'carbohydrates': {'current': 90, 'recommended': 100, 'unit': 'g'},
            'fats': {'current': 70, 'recommended': 100, 'unit': 'g'},
            'fiber': {'current': 60, 'recommended': 100, 'unit': 'g'},
            'vitamins': {'current': 70, 'recommended': 100, 'unit': '%'},
            'minerals': {'current': 85, 'recommended': 100, 'unit': '%'}
        },
        'category_distribution': rating.get('category_breakdown', {}),
        'health_alerts': []
    }
    
    return jsonify(analysis)
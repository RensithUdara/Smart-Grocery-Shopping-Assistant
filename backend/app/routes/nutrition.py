#!/usr/bin/env python3
"""
Nutrition Blueprint

Routes to expose nutrition & health intelligence features from `NutritionEngine`.
"""
from flask import Blueprint, jsonify, request
import os
import sys

# Try relative import from src.utils
try:
    from ...src.utils.nutrition_engine import NutritionEngine
except Exception:
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'utils'))
    from nutrition_engine import NutritionEngine

nutrition_bp = Blueprint('nutrition', __name__)
engine = NutritionEngine()


@nutrition_bp.route('/api/nutrition/analyze', methods=['POST'])
def analyze_items():
    data = request.get_json() or {}
    items = data.get('items', [])

    if not items:
        return jsonify({'success': False, 'error': 'items required (name, servings)'}), 400

    try:
        result = engine.analyze_items(items)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@nutrition_bp.route('/api/nutrition/check-allergens', methods=['POST'])
def check_allergens():
    data = request.get_json() or {}
    items = data.get('items', [])
    allergies = data.get('allergies', [])

    if not items or not allergies:
        return jsonify({'success': False, 'error': 'items and allergies required'}), 400

    try:
        result = engine.check_allergens(items, allergies)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@nutrition_bp.route('/api/nutrition/substitutions', methods=['POST'])
def substitutions():
    data = request.get_json() or {}
    item = data.get('item')

    if not item:
        return jsonify({'success': False, 'error': 'item required'}), 400

    try:
        result = engine.suggest_substitutions(item)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@nutrition_bp.route('/api/nutrition/healthy-swaps', methods=['POST'])
def healthy_swaps():
    data = request.get_json() or {}
    items = data.get('items', [])

    try:
        result = engine.recommend_healthy_swaps(items)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@nutrition_bp.route('/api/nutrition/meal-compliance', methods=['POST'])
def meal_compliance():
    data = request.get_json() or {}
    items = data.get('items', [])
    goals = data.get('goals', {})

    if not items or not goals:
        return jsonify({'success': False, 'error': 'items and goals required'}), 400

    try:
        result = engine.evaluate_meal_compliance(items, goals)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

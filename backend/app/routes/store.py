#!/usr/bin/env python3
"""
Store Integration API Routes

Flask Blueprint for store integration, price comparison, and shopping optimization features.
Provides endpoints for store discovery, price comparison, route optimization, and shopping strategies.

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import json
import os

# Import the store integration engine
try:
    from ...src.utils.store_integration import StoreIntegrationEngine
except ImportError:
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'utils'))
    from store_integration import StoreIntegrationEngine

store_bp = Blueprint('store', __name__)
store_engine = StoreIntegrationEngine()

@store_bp.route('/api/stores/nearby', methods=['GET'])
def get_nearby_stores():
    """Get nearby stores within specified distance"""
    try:
        max_distance = request.args.get('max_distance', 10.0, type=float)
        
        nearby_stores = store_engine.find_nearby_stores(max_distance)
        
        return jsonify({
            'success': True,
            'data': {
                'stores': nearby_stores,
                'count': len(nearby_stores),
                'search_radius': max_distance
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/compare-prices', methods=['POST'])
def compare_prices():
    """Compare prices across stores for shopping list"""
    try:
        data = request.get_json()
        shopping_list = data.get('shopping_list', [])
        
        if not shopping_list:
            return jsonify({
                'success': False,
                'error': 'Shopping list is required'
            }), 400
        
        price_comparison = store_engine.compare_prices(shopping_list)
        
        return jsonify({
            'success': True,
            'data': price_comparison
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/recommendations', methods=['POST'])
def get_store_recommendations():
    """Get personalized store recommendations"""
    try:
        data = request.get_json()
        shopping_list = data.get('shopping_list', [])
        preferences = data.get('preferences', {})
        
        if not shopping_list:
            return jsonify({
                'success': False,
                'error': 'Shopping list is required'
            }), 400
        
        recommendations = store_engine.get_store_recommendations(shopping_list, preferences)
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations,
                'count': len(recommendations)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/optimize-route', methods=['POST'])
def optimize_shopping_route():
    """Optimize route for visiting multiple stores"""
    try:
        data = request.get_json()
        selected_stores = data.get('selected_stores', [])
        
        if not selected_stores:
            return jsonify({
                'success': False,
                'error': 'Selected stores are required'
            }), 400
        
        optimized_route = store_engine.optimize_shopping_route(selected_stores)
        
        return jsonify({
            'success': True,
            'data': optimized_route
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/price-history/<item_name>', methods=['GET'])
def get_price_history(item_name):
    """Get price history for an item across stores"""
    try:
        days = request.args.get('days', 30, type=int)
        
        price_history = store_engine.track_price_history(item_name, days)
        
        return jsonify({
            'success': True,
            'data': {
                'item_name': item_name,
                'price_history': price_history,
                'analysis_period': days
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/shopping-strategy', methods=['POST'])
def get_shopping_strategy():
    """Generate optimal shopping strategy"""
    try:
        data = request.get_json()
        shopping_list = data.get('shopping_list', [])
        budget = data.get('budget')
        
        if not shopping_list:
            return jsonify({
                'success': False,
                'error': 'Shopping list is required'
            }), 400
        
        strategy = store_engine.generate_shopping_strategy(shopping_list, budget)
        
        return jsonify({
            'success': True,
            'data': strategy
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/<store_id>/details', methods=['GET'])
def get_store_details(store_id):
    """Get detailed information about a specific store"""
    try:
        store = store_engine.stores.get(store_id)
        
        if not store:
            return jsonify({
                'success': False,
                'error': 'Store not found'
            }), 404
        
        # Calculate distance from user location
        distance = store_engine.calculate_distance(
            store_engine.user_location['lat'],
            store_engine.user_location['lng'],
            store.lat,
            store.lng
        )
        
        store_details = store.to_dict()
        store_details['distance'] = round(distance, 2)
        store_details['inventory_count'] = len(store.inventory)
        
        return jsonify({
            'success': True,
            'data': store_details
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/<store_id>/inventory', methods=['GET'])
def get_store_inventory(store_id):
    """Get inventory for a specific store"""
    try:
        store = store_engine.stores.get(store_id)
        
        if not store:
            return jsonify({
                'success': False,
                'error': 'Store not found'
            }), 404
        
        # Filter inventory based on query parameters
        category = request.args.get('category')
        in_stock_only = request.args.get('in_stock_only', 'false').lower() == 'true'
        
        filtered_inventory = {}
        for item_key, item_data in store.inventory.items():
            # Category filter
            if category and item_data.get('category', '').lower() != category.lower():
                continue
            
            # Stock filter
            if in_stock_only and not item_data.get('in_stock', False):
                continue
            
            filtered_inventory[item_key] = item_data
        
        return jsonify({
            'success': True,
            'data': {
                'store_id': store_id,
                'store_name': store.name,
                'inventory': filtered_inventory,
                'total_items': len(filtered_inventory)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/search', methods=['GET'])
def search_stores():
    """Search stores by name or location"""
    try:
        query = request.args.get('q', '').lower()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        matching_stores = []
        
        for store in store_engine.stores.values():
            if (query in store.name.lower() or 
                query in store.address.lower()):
                
                # Calculate distance
                distance = store_engine.calculate_distance(
                    store_engine.user_location['lat'],
                    store_engine.user_location['lng'],
                    store.lat,
                    store.lng
                )
                
                store_data = store.to_dict()
                store_data['distance'] = round(distance, 2)
                matching_stores.append(store_data)
        
        # Sort by distance
        matching_stores.sort(key=lambda x: x['distance'])
        
        return jsonify({
            'success': True,
            'data': {
                'stores': matching_stores,
                'count': len(matching_stores),
                'query': query
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/user-location', methods=['POST'])
def update_user_location():
    """Update user location for distance calculations"""
    try:
        data = request.get_json()
        lat = data.get('lat')
        lng = data.get('lng')
        
        if lat is None or lng is None:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        store_engine.user_location = {'lat': float(lat), 'lng': float(lng)}
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'User location updated successfully',
                'location': store_engine.user_location
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/categories', methods=['GET'])
def get_item_categories():
    """Get all available item categories across stores"""
    try:
        categories = set()
        
        for store in store_engine.stores.values():
            for item_data in store.inventory.values():
                if 'category' in item_data:
                    categories.add(item_data['category'])
        
        return jsonify({
            'success': True,
            'data': {
                'categories': sorted(list(categories))
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@store_bp.route('/api/stores/deals', methods=['GET'])
def get_current_deals():
    """Get current deals and promotions across stores"""
    try:
        deals = []
        
        for store_id, store in store_engine.stores.items():
            store_deals = []
            
            # Find items with good prices (simulated deals)
            for item_key, item_data in store.inventory.items():
                if item_data.get('in_stock', False):
                    # Simulate deal detection (items with prices ending in .99 or low stock)
                    price = item_data.get('price', 0)
                    stock_level = item_data.get('stock_level', 0)
                    
                    is_deal = (
                        str(price).endswith('.99') or 
                        stock_level < 20 or  # Clearance items
                        price < 2.00  # Low-priced items
                    )
                    
                    if is_deal:
                        deal_type = 'clearance' if stock_level < 20 else 'special_price'
                        store_deals.append({
                            'item_name': item_data['name'],
                            'category': item_data['category'],
                            'price': price,
                            'unit': item_data['unit'],
                            'deal_type': deal_type,
                            'stock_level': stock_level
                        })
            
            if store_deals:
                deals.append({
                    'store_id': store_id,
                    'store_name': store.name,
                    'deals': store_deals[:5],  # Limit to 5 deals per store
                    'deals_count': len(store_deals)
                })
        
        return jsonify({
            'success': True,
            'data': {
                'deals_by_store': deals,
                'total_stores_with_deals': len(deals)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
#!/usr/bin/env python3
"""
Store Integration and Price Comparison Engine

Provides multiple store price comparison, inventory availability checking,
optimized shopping route planning, and digital receipt integration.

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import math
import random

class Store:
    """Represents a grocery store with location and inventory data"""
    
    def __init__(self, store_id: str, name: str, address: str, lat: float, lng: float):
        self.store_id = store_id
        self.name = name
        self.address = address
        self.lat = lat
        self.lng = lng
        self.inventory = {}
        self.price_history = {}
        self.operating_hours = {
            'monday': {'open': '08:00', 'close': '22:00'},
            'tuesday': {'open': '08:00', 'close': '22:00'},
            'wednesday': {'open': '08:00', 'close': '22:00'},
            'thursday': {'open': '08:00', 'close': '22:00'},
            'friday': {'open': '08:00', 'close': '22:00'},
            'saturday': {'open': '08:00', 'close': '23:00'},
            'sunday': {'open': '09:00', 'close': '21:00'}
        }
        self.ratings = 4.2  # Average rating out of 5
        
    def to_dict(self) -> Dict:
        return {
            'store_id': self.store_id,
            'name': self.name,
            'address': self.address,
            'lat': self.lat,
            'lng': self.lng,
            'operating_hours': self.operating_hours,
            'ratings': self.ratings
        }

class StoreIntegrationEngine:
    """
    Advanced store integration system for price comparison and shopping optimization
    """
    
    def __init__(self):
        self.stores: Dict[str, Store] = {}
        self.user_location = {'lat': 40.7128, 'lng': -74.0060}  # Default: NYC
        self._initialize_sample_stores()
        self._initialize_sample_inventory()
    
    def _initialize_sample_stores(self):
        """Initialize sample stores for demonstration"""
        stores_data = [
            {
                'store_id': 'walmart_001',
                'name': 'Walmart Supercenter',
                'address': '123 Main St, Anytown, NY 10001',
                'lat': 40.7128,
                'lng': -74.0060
            },
            {
                'store_id': 'target_001',
                'name': 'Target',
                'address': '456 Oak Ave, Anytown, NY 10002',
                'lat': 40.7180,
                'lng': -74.0020
            },
            {
                'store_id': 'wholefoods_001',
                'name': 'Whole Foods Market',
                'address': '789 Green Blvd, Anytown, NY 10003',
                'lat': 40.7200,
                'lng': -74.0080
            },
            {
                'store_id': 'kroger_001',
                'name': 'Kroger',
                'address': '321 Pine St, Anytown, NY 10004',
                'lat': 40.7100,
                'lng': -74.0100
            },
            {
                'store_id': 'costco_001',
                'name': 'Costco Wholesale',
                'address': '654 Valley Rd, Anytown, NY 10005',
                'lat': 40.7050,
                'lng': -74.0150
            }
        ]
        
        for store_data in stores_data:
            store = Store(**store_data)
            self.stores[store.store_id] = store
    
    def _initialize_sample_inventory(self):
        """Initialize sample inventory and prices"""
        sample_items = [
            {'name': 'Bananas', 'category': 'Fruits', 'unit': 'lb'},
            {'name': 'Apples', 'category': 'Fruits', 'unit': 'lb'},
            {'name': 'Milk', 'category': 'Dairy', 'unit': 'gallon'},
            {'name': 'Bread', 'category': 'Bakery', 'unit': 'loaf'},
            {'name': 'Eggs', 'category': 'Dairy', 'unit': 'dozen'},
            {'name': 'Chicken Breast', 'category': 'Meat', 'unit': 'lb'},
            {'name': 'Rice', 'category': 'Grains', 'unit': 'lb'},
            {'name': 'Pasta', 'category': 'Grains', 'unit': 'box'},
            {'name': 'Tomatoes', 'category': 'Vegetables', 'unit': 'lb'},
            {'name': 'Onions', 'category': 'Vegetables', 'unit': 'lb'},
            {'name': 'Olive Oil', 'category': 'Condiments', 'unit': 'bottle'},
            {'name': 'Yogurt', 'category': 'Dairy', 'unit': 'container'},
        ]
        
        # Base prices for different store types
        store_price_multipliers = {
            'walmart_001': 0.85,      # Walmart - lowest prices
            'target_001': 0.95,       # Target - competitive
            'wholefoods_001': 1.25,   # Whole Foods - premium
            'kroger_001': 0.90,       # Kroger - good value
            'costco_001': 0.80        # Costco - bulk pricing
        }
        
        base_prices = {
            'Bananas': 1.20,
            'Apples': 2.50,
            'Milk': 3.80,
            'Bread': 2.00,
            'Eggs': 3.50,
            'Chicken Breast': 6.99,
            'Rice': 1.99,
            'Pasta': 1.50,
            'Tomatoes': 2.99,
            'Onions': 1.49,
            'Olive Oil': 8.99,
            'Yogurt': 1.25
        }
        
        for store_id, store in self.stores.items():
            multiplier = store_price_multipliers.get(store_id, 1.0)
            
            for item in sample_items:
                item_key = f"{item['name']}_{item['category']}"
                base_price = base_prices.get(item['name'], 5.00)
                
                # Add some price variation
                price_variation = random.uniform(0.90, 1.10)
                final_price = base_price * multiplier * price_variation
                
                store.inventory[item_key] = {
                    'name': item['name'],
                    'category': item['category'],
                    'unit': item['unit'],
                    'price': round(final_price, 2),
                    'in_stock': random.choice([True, True, True, False]),  # 75% in stock
                    'stock_level': random.randint(0, 100),
                    'last_updated': datetime.now().isoformat()
                }
    
    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 3959  # Earth's radius in miles
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def find_nearby_stores(self, max_distance: float = 10.0) -> List[Dict]:
        """Find stores within specified distance from user location"""
        nearby_stores = []
        
        for store in self.stores.values():
            distance = self.calculate_distance(
                self.user_location['lat'], self.user_location['lng'],
                store.lat, store.lng
            )
            
            if distance <= max_distance:
                store_info = store.to_dict()
                store_info['distance'] = round(distance, 2)
                nearby_stores.append(store_info)
        
        # Sort by distance
        nearby_stores.sort(key=lambda x: x['distance'])
        return nearby_stores
    
    def compare_prices(self, shopping_list: List[str]) -> Dict:
        """Compare prices across all stores for given shopping list"""
        price_comparison = {
            'items': {},
            'store_totals': {},
            'best_deals': {},
            'availability': {}
        }
        
        for item_name in shopping_list:
            price_comparison['items'][item_name] = {}
            price_comparison['availability'][item_name] = {}
            
            item_prices = []
            
            for store_id, store in self.stores.items():
                # Search for item in store inventory
                item_found = None
                for inv_key, inv_item in store.inventory.items():
                    if inv_item['name'].lower() == item_name.lower():
                        item_found = inv_item
                        break
                
                if item_found:
                    price_comparison['items'][item_name][store_id] = {
                        'price': item_found['price'],
                        'in_stock': item_found['in_stock'],
                        'store_name': store.name
                    }
                    price_comparison['availability'][item_name][store_id] = item_found['in_stock']
                    
                    if item_found['in_stock']:
                        item_prices.append((store_id, item_found['price']))
                else:
                    price_comparison['items'][item_name][store_id] = {
                        'price': None,
                        'in_stock': False,
                        'store_name': store.name
                    }
                    price_comparison['availability'][item_name][store_id] = False
            
            # Find best deal for this item
            if item_prices:
                best_store, best_price = min(item_prices, key=lambda x: x[1])
                price_comparison['best_deals'][item_name] = {
                    'store_id': best_store,
                    'store_name': self.stores[best_store].name,
                    'price': best_price
                }
        
        # Calculate store totals
        for store_id in self.stores:
            total = 0
            items_available = 0
            
            for item_name in shopping_list:
                if (item_name in price_comparison['items'] and 
                    store_id in price_comparison['items'][item_name]):
                    item_data = price_comparison['items'][item_name][store_id]
                    if item_data['price'] and item_data['in_stock']:
                        total += item_data['price']
                        items_available += 1
            
            price_comparison['store_totals'][store_id] = {
                'total': round(total, 2),
                'items_available': items_available,
                'items_missing': len(shopping_list) - items_available,
                'store_name': self.stores[store_id].name
            }
        
        return price_comparison
    
    def optimize_shopping_route(self, selected_stores: List[str]) -> Dict:
        """Optimize route for visiting multiple stores"""
        if not selected_stores:
            return {'route': [], 'total_distance': 0, 'estimated_time': 0}
        
        # Simple nearest neighbor algorithm for route optimization
        user_loc = self.user_location
        current_location = user_loc
        remaining_stores = selected_stores.copy()
        optimized_route = []
        total_distance = 0
        
        while remaining_stores:
            nearest_store = None
            min_distance = float('inf')
            
            for store_id in remaining_stores:
                store = self.stores[store_id]
                distance = self.calculate_distance(
                    current_location['lat'], current_location['lng'],
                    store.lat, store.lng
                )
                
                if distance < min_distance:
                    min_distance = distance
                    nearest_store = store_id
            
            if nearest_store:
                store = self.stores[nearest_store]
                optimized_route.append({
                    'store_id': nearest_store,
                    'store_name': store.name,
                    'address': store.address,
                    'distance_from_previous': round(min_distance, 2)
                })
                
                total_distance += min_distance
                current_location = {'lat': store.lat, 'lng': store.lng}
                remaining_stores.remove(nearest_store)
        
        # Add return distance to starting point
        if optimized_route:
            last_store = self.stores[optimized_route[-1]['store_id']]
            return_distance = self.calculate_distance(
                last_store.lat, last_store.lng,
                user_loc['lat'], user_loc['lng']
            )
            total_distance += return_distance
        
        # Estimate time (assume 30 mph average speed + 20 min per store)
        travel_time = (total_distance / 30) * 60  # minutes
        shopping_time = len(selected_stores) * 20  # minutes per store
        total_time = travel_time + shopping_time
        
        return {
            'route': optimized_route,
            'total_distance': round(total_distance, 2),
            'estimated_time': round(total_time, 0),
            'return_distance': round(return_distance, 2) if optimized_route else 0
        }
    
    def get_store_recommendations(self, shopping_list: List[str], preferences: Dict = None) -> List[Dict]:
        """Get personalized store recommendations based on shopping list and preferences"""
        if preferences is None:
            preferences = {'priority': 'price', 'max_distance': 10}
        
        price_comparison = self.compare_prices(shopping_list)
        nearby_stores = self.find_nearby_stores(preferences.get('max_distance', 10))
        
        recommendations = []
        
        for store_data in nearby_stores:
            store_id = store_data['store_id']
            store_totals = price_comparison['store_totals'].get(store_id, {})
            
            # Calculate recommendation score
            score = 0
            
            # Price factor (40% weight)
            if store_totals.get('total', 0) > 0:
                min_total = min([st.get('total', float('inf')) 
                               for st in price_comparison['store_totals'].values()
                               if st.get('total', 0) > 0])
                price_score = (min_total / store_totals['total']) * 40 if min_total > 0 else 0
                score += price_score
            
            # Availability factor (30% weight)
            availability_score = (store_totals.get('items_available', 0) / len(shopping_list)) * 30
            score += availability_score
            
            # Distance factor (20% weight)
            max_distance = max([s['distance'] for s in nearby_stores])
            distance_score = (1 - (store_data['distance'] / max_distance)) * 20 if max_distance > 0 else 20
            score += distance_score
            
            # Rating factor (10% weight)
            rating_score = (store_data.get('ratings', 0) / 5) * 10
            score += rating_score
            
            recommendation = {
                **store_data,
                'recommendation_score': round(score, 1),
                'total_cost': store_totals.get('total', 0),
                'items_available': store_totals.get('items_available', 0),
                'items_missing': store_totals.get('items_missing', len(shopping_list)),
                'pros': [],
                'cons': []
            }
            
            # Generate pros and cons
            if store_totals.get('total', 0) == min([st.get('total', float('inf')) 
                                                  for st in price_comparison['store_totals'].values()
                                                  if st.get('total', 0) > 0]):
                recommendation['pros'].append("Lowest total price")
            
            if store_data['distance'] <= 2:
                recommendation['pros'].append("Very close to you")
            elif store_data['distance'] <= 5:
                recommendation['pros'].append("Reasonably close")
            
            if store_totals.get('items_available', 0) == len(shopping_list):
                recommendation['pros'].append("All items available")
            
            if store_data.get('ratings', 0) >= 4.5:
                recommendation['pros'].append("Highly rated")
            
            if store_totals.get('items_missing', 0) > 2:
                recommendation['cons'].append(f"{store_totals['items_missing']} items not available")
            
            if store_data['distance'] > 8:
                recommendation['cons'].append("Far from your location")
            
            recommendations.append(recommendation)
        
        # Sort by recommendation score
        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return recommendations
    
    def track_price_history(self, item_name: str, days: int = 30) -> Dict:
        """Get price history for an item across stores"""
        # Simulate price history data
        price_history = {}
        
        for store_id, store in self.stores.items():
            # Find current price
            current_price = None
            for inv_key, inv_item in store.inventory.items():
                if inv_item['name'].lower() == item_name.lower():
                    current_price = inv_item['price']
                    break
            
            if current_price:
                # Generate historical prices
                history = []
                for i in range(days):
                    date = datetime.now() - timedelta(days=i)
                    # Simulate price variations (±10% from current price)
                    price_variation = random.uniform(0.90, 1.10)
                    historical_price = round(current_price * price_variation, 2)
                    
                    history.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': historical_price
                    })
                
                history.reverse()  # Oldest first
                
                price_history[store_id] = {
                    'store_name': store.name,
                    'current_price': current_price,
                    'history': history,
                    'price_trend': self._calculate_price_trend(history),
                    'lowest_price': min([h['price'] for h in history]),
                    'highest_price': max([h['price'] for h in history])
                }
        
        return price_history
    
    def _calculate_price_trend(self, price_history: List[Dict]) -> str:
        """Calculate price trend from history"""
        if len(price_history) < 2:
            return 'stable'
        
        recent_prices = [h['price'] for h in price_history[-7:]]  # Last 7 days
        older_prices = [h['price'] for h in price_history[-14:-7]]  # Previous 7 days
        
        if not older_prices:
            return 'stable'
        
        recent_avg = sum(recent_prices) / len(recent_prices)
        older_avg = sum(older_prices) / len(older_prices)
        
        change_percent = ((recent_avg - older_avg) / older_avg) * 100
        
        if change_percent > 5:
            return 'increasing'
        elif change_percent < -5:
            return 'decreasing'
        else:
            return 'stable'
    
    def generate_shopping_strategy(self, shopping_list: List[str], budget: float = None) -> Dict:
        """Generate optimal shopping strategy"""
        price_comparison = self.compare_prices(shopping_list)
        recommendations = self.get_store_recommendations(shopping_list)
        
        strategy = {
            'recommended_approach': '',
            'primary_store': None,
            'secondary_stores': [],
            'total_savings': 0,
            'budget_status': 'within_budget',
            'shopping_plan': []
        }
        
        # Single store strategy
        best_single_store = min(
            [(store_id, data) for store_id, data in price_comparison['store_totals'].items() 
             if data.get('total', 0) > 0],
            key=lambda x: x[1]['total'],
            default=(None, None)
        )
        
        # Multi-store strategy (best deals approach)
        multi_store_total = sum([
            deal_info['price'] for deal_info in price_comparison['best_deals'].values()
        ])
        
        if best_single_store[0] and best_single_store[1]:
            single_store_total = best_single_store[1]['total']
            potential_savings = single_store_total - multi_store_total
            
            if potential_savings > 5:  # Worth visiting multiple stores if savings > $5
                strategy['recommended_approach'] = 'multi_store'
                strategy['total_savings'] = round(potential_savings, 2)
                
                # Group items by best store
                store_items = {}
                for item, deal in price_comparison['best_deals'].items():
                    store_id = deal['store_id']
                    if store_id not in store_items:
                        store_items[store_id] = []
                    store_items[store_id].append({
                        'item': item,
                        'price': deal['price']
                    })
                
                # Create shopping plan
                for store_id, items in store_items.items():
                    store = self.stores[store_id]
                    plan_item = {
                        'store_id': store_id,
                        'store_name': store.name,
                        'address': store.address,
                        'items': items,
                        'store_total': sum([item['price'] for item in items])
                    }
                    strategy['shopping_plan'].append(plan_item)
                
            else:
                strategy['recommended_approach'] = 'single_store'
                strategy['primary_store'] = {
                    'store_id': best_single_store[0],
                    'store_name': self.stores[best_single_store[0]].name,
                    'total': single_store_total
                }
        
        # Budget analysis
        if budget:
            estimated_total = multi_store_total if strategy['recommended_approach'] == 'multi_store' else (single_store_total if best_single_store[1] else 0)
            
            if estimated_total > budget:
                strategy['budget_status'] = 'over_budget'
                strategy['budget_overage'] = round(estimated_total - budget, 2)
            elif estimated_total > budget * 0.9:
                strategy['budget_status'] = 'close_to_budget'
            else:
                strategy['budget_status'] = 'within_budget'
                strategy['budget_remaining'] = round(budget - estimated_total, 2)
        
        return strategy
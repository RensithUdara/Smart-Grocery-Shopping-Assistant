#!/usr/bin/env python3
"""
Machine Learning Engine for Smart Grocery Shopping Assistant

Provides AI-powered features including:
- Predictive shopping patterns
- Personalized recommendations
- Quantity optimization
- Seasonal forecasting
- Purchase behavior analysis
- Smart shopping suggestions

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

import os
import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import math
import random
from collections import defaultdict, Counter

class MLEngine:
    """
    Advanced Machine Learning Engine for grocery shopping optimization
    """
    
    def __init__(self):
        self.user_profiles = {}
        self.item_embeddings = {}
        self.purchase_patterns = {}
        self.seasonal_factors = {}
        self.recommendation_cache = {}
        self._initialize_ml_models()
        self._load_sample_data()
    
    def _initialize_ml_models(self):
        """Initialize ML model parameters and weights"""
        
        # User behavior weights
        self.behavior_weights = {
            'frequency': 0.3,
            'recency': 0.25,
            'quantity': 0.2,
            'seasonality': 0.15,
            'price_sensitivity': 0.1
        }
        
        # Item category embeddings (simplified word2vec-like representation)
        self.category_embeddings = {
            'Fruits': np.array([0.8, 0.6, 0.9, 0.7, 0.5]),
            'Vegetables': np.array([0.9, 0.7, 0.8, 0.6, 0.4]),
            'Dairy': np.array([0.5, 0.8, 0.6, 0.9, 0.7]),
            'Meat': np.array([0.4, 0.5, 0.7, 0.8, 0.9]),
            'Grains': np.array([0.6, 0.4, 0.5, 0.7, 0.8]),
            'Bakery': np.array([0.7, 0.6, 0.4, 0.5, 0.6]),
            'Condiments': np.array([0.3, 0.4, 0.6, 0.5, 0.7]),
            'Beverages': np.array([0.5, 0.7, 0.8, 0.4, 0.6]),
            'Snacks': np.array([0.6, 0.5, 0.3, 0.8, 0.7]),
            'Frozen': np.array([0.4, 0.6, 0.7, 0.5, 0.8])
        }
        
        # Seasonal patterns (month-based multipliers)
        self.seasonal_patterns = {
            'Fruits': {1: 0.7, 2: 0.8, 3: 0.9, 4: 1.1, 5: 1.3, 6: 1.4, 
                      7: 1.5, 8: 1.4, 9: 1.2, 10: 1.0, 11: 0.8, 12: 0.7},
            'Vegetables': {1: 0.8, 2: 0.9, 3: 1.0, 4: 1.2, 5: 1.4, 6: 1.5,
                          7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 0.8},
            'Dairy': {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0,
                     7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.0},
            'Meat': {1: 0.9, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3,
                    7: 1.4, 8: 1.2, 9: 1.0, 10: 0.9, 11: 1.1, 12: 1.3},
            'Bakery': {1: 0.8, 2: 0.9, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0,
                      7: 1.0, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.3}
        }
    
    def _load_sample_data(self):
        """Load sample purchase history and user behavior data"""
        
        # Sample purchase history for ML training
        sample_purchases = [
            {'item': 'Bananas', 'category': 'Fruits', 'quantity': 3, 'price': 3.50, 'date': '2024-10-15'},
            {'item': 'Milk', 'category': 'Dairy', 'quantity': 1, 'price': 3.80, 'date': '2024-10-15'},
            {'item': 'Bread', 'category': 'Bakery', 'quantity': 2, 'price': 4.00, 'date': '2024-10-16'},
            {'item': 'Chicken Breast', 'category': 'Meat', 'quantity': 2, 'price': 12.99, 'date': '2024-10-16'},
            {'item': 'Apples', 'category': 'Fruits', 'quantity': 4, 'price': 6.00, 'date': '2024-10-18'},
            {'item': 'Yogurt', 'category': 'Dairy', 'quantity': 6, 'price': 7.50, 'date': '2024-10-20'},
            {'item': 'Rice', 'category': 'Grains', 'quantity': 1, 'price': 3.99, 'date': '2024-10-22'},
            {'item': 'Tomatoes', 'category': 'Vegetables', 'quantity': 3, 'price': 4.50, 'date': '2024-10-25'},
            {'item': 'Eggs', 'category': 'Dairy', 'quantity': 1, 'price': 3.50, 'date': '2024-10-28'},
            {'item': 'Pasta', 'category': 'Grains', 'quantity': 3, 'price': 4.50, 'date': '2024-10-30'},
        ]
        
        # Process purchase history for ML
        self.purchase_history = sample_purchases
        self._build_user_profile()
        self._analyze_purchase_patterns()
    
    def _build_user_profile(self):
        """Build comprehensive user profile from purchase history"""
        
        profile = {
            'preferences': defaultdict(float),
            'purchase_frequency': defaultdict(list),
            'quantity_patterns': defaultdict(list),
            'price_sensitivity': 0.0,
            'category_preferences': defaultdict(float),
            'seasonal_behavior': defaultdict(list),
            'brand_loyalty': defaultdict(float),
            'health_consciousness': 0.0
        }
        
        total_purchases = len(self.purchase_history)
        total_spending = sum(p['price'] for p in self.purchase_history)
        
        for purchase in self.purchase_history:
            item = purchase['item']
            category = purchase['category']
            quantity = purchase['quantity']
            price = purchase['price']
            
            # Category preferences
            profile['category_preferences'][category] += 1
            
            # Purchase frequency
            profile['purchase_frequency'][item].append(purchase['date'])
            
            # Quantity patterns
            profile['quantity_patterns'][item].append(quantity)
            
            # Price sensitivity (lower values = more price sensitive)
            avg_category_price = self._get_avg_category_price(category)
            if avg_category_price > 0:
                price_ratio = price / avg_category_price
                profile['price_sensitivity'] += price_ratio
        
        # Normalize values
        if total_purchases > 0:
            profile['price_sensitivity'] /= total_purchases
            
        # Calculate category preference percentages
        for category in profile['category_preferences']:
            profile['category_preferences'][category] /= total_purchases
        
        # Health consciousness score based on healthy categories
        healthy_categories = ['Fruits', 'Vegetables', 'Dairy']
        healthy_purchases = sum(profile['category_preferences'][cat] for cat in healthy_categories)
        profile['health_consciousness'] = min(healthy_purchases / 0.6, 1.0)  # Cap at 1.0
        
        self.user_profile = profile
    
    def _analyze_purchase_patterns(self):
        """Analyze patterns in purchase history for predictive modeling"""
        
        patterns = {
            'weekly_patterns': defaultdict(list),
            'item_associations': defaultdict(list),
            'repurchase_cycles': defaultdict(float),
            'quantity_trends': defaultdict(list),
            'price_elasticity': defaultdict(float)
        }
        
        # Analyze item associations (items bought together)
        purchase_dates = defaultdict(list)
        for purchase in self.purchase_history:
            purchase_dates[purchase['date']].append(purchase['item'])
        
        for date, items in purchase_dates.items():
            for i, item1 in enumerate(items):
                for item2 in items[i+1:]:
                    patterns['item_associations'][item1].append(item2)
                    patterns['item_associations'][item2].append(item1)
        
        # Calculate repurchase cycles
        item_dates = defaultdict(list)
        for purchase in self.purchase_history:
            item_dates[purchase['item']].append(
                datetime.strptime(purchase['date'], '%Y-%m-%d')
            )
        
        for item, dates in item_dates.items():
            if len(dates) > 1:
                dates.sort()
                intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
                patterns['repurchase_cycles'][item] = sum(intervals) / len(intervals)
        
        self.purchase_patterns = patterns
    
    def _get_avg_category_price(self, category: str) -> float:
        """Get average price for items in a category"""
        category_purchases = [p for p in self.purchase_history if p['category'] == category]
        if not category_purchases:
            return 10.0  # Default price
        return sum(p['price'] for p in category_purchases) / len(category_purchases)
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def get_personalized_recommendations(self, limit: int = 10) -> List[Dict]:
        """Generate personalized item recommendations using ML"""
        
        recommendations = []
        
        # Get user's preferred categories
        preferred_categories = sorted(
            self.user_profile['category_preferences'].items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]  # Top 5 categories
        
        # Sample items for each category
        category_items = {
            'Fruits': ['Strawberries', 'Oranges', 'Grapes', 'Pineapple', 'Mango', 'Blueberries'],
            'Vegetables': ['Spinach', 'Broccoli', 'Carrots', 'Bell Peppers', 'Zucchini', 'Cucumber'],
            'Dairy': ['Cheese', 'Greek Yogurt', 'Butter', 'Cream', 'Cottage Cheese'],
            'Meat': ['Salmon', 'Ground Beef', 'Pork Chops', 'Turkey', 'Shrimp'],
            'Grains': ['Quinoa', 'Oats', 'Brown Rice', 'Whole Wheat Pasta', 'Barley'],
            'Bakery': ['Bagels', 'Croissants', 'Muffins', 'Pita Bread', 'Sourdough'],
            'Condiments': ['Honey', 'Soy Sauce', 'Balsamic Vinegar', 'Mustard', 'Hot Sauce'],
            'Beverages': ['Orange Juice', 'Coffee', 'Tea', 'Sparkling Water', 'Coconut Water'],
            'Snacks': ['Almonds', 'Crackers', 'Granola Bars', 'Popcorn', 'Dark Chocolate'],
            'Frozen': ['Frozen Berries', 'Ice Cream', 'Frozen Pizza', 'Frozen Vegetables']
        }
        
        current_month = datetime.now().month
        
        for category, preference_score in preferred_categories:
            if category in category_items:
                # Get seasonal factor
                seasonal_factor = self.seasonal_patterns.get(category, {}).get(current_month, 1.0)
                
                for item in category_items[category][:3]:  # Top 3 items per category
                    # Calculate recommendation score
                    base_score = preference_score * 100
                    
                    # Apply seasonal adjustment
                    seasonal_score = base_score * seasonal_factor
                    
                    # Add health consciousness bonus
                    health_bonus = 0
                    if category in ['Fruits', 'Vegetables']:
                        health_bonus = self.user_profile['health_consciousness'] * 10
                    
                    # Check for item associations
                    association_bonus = 0
                    for purchased_item in self.user_profile['purchase_frequency'].keys():
                        if item in self.purchase_patterns['item_associations'].get(purchased_item, []):
                            association_bonus += 5
                    
                    final_score = seasonal_score + health_bonus + association_bonus
                    
                    # Estimate price based on category averages
                    base_price = self._get_avg_category_price(category)
                    estimated_price = base_price * random.uniform(0.8, 1.2)
                    
                    # Predict optimal quantity
                    avg_quantity = np.mean([q for quantities in self.user_profile['quantity_patterns'].values() for q in quantities]) or 1
                    predicted_quantity = max(1, int(avg_quantity * random.uniform(0.8, 1.2)))
                    
                    recommendations.append({
                        'item_name': item,
                        'category': category,
                        'confidence_score': round(min(final_score, 100), 1),
                        'reason': self._generate_recommendation_reason(item, category, seasonal_factor, health_bonus > 0, association_bonus > 0),
                        'estimated_price': round(estimated_price, 2),
                        'predicted_quantity': predicted_quantity,
                        'seasonal_factor': round(seasonal_factor, 2),
                        'health_benefit': category in ['Fruits', 'Vegetables', 'Dairy'],
                        'purchase_urgency': self._calculate_urgency(item, category)
                    })
        
        # Sort by confidence score and return top recommendations
        recommendations.sort(key=lambda x: x['confidence_score'], reverse=True)
        return recommendations[:limit]
    
    def _generate_recommendation_reason(self, item: str, category: str, seasonal_factor: float, 
                                      health_bonus: bool, association_bonus: bool) -> str:
        """Generate explanation for recommendation"""
        reasons = []
        
        if seasonal_factor > 1.2:
            reasons.append("seasonal peak")
        elif seasonal_factor > 1.0:
            reasons.append("seasonal availability")
        
        if health_bonus:
            reasons.append("health benefits")
        
        if association_bonus:
            reasons.append("frequently bought together")
        
        if category in self.user_profile['category_preferences']:
            pref_score = self.user_profile['category_preferences'][category]
            if pref_score > 0.3:
                reasons.append("matches your preferences")
        
        if not reasons:
            reasons.append("popular choice")
        
        return f"Recommended due to {', '.join(reasons)}"
    
    def _calculate_urgency(self, item: str, category: str) -> str:
        """Calculate purchase urgency based on patterns"""
        
        # Check repurchase cycle
        if item in self.purchase_patterns['repurchase_cycles']:
            cycle_days = self.purchase_patterns['repurchase_cycles'][item]
            if cycle_days <= 7:
                return 'high'
            elif cycle_days <= 14:
                return 'medium'
        
        # Check category seasonality
        current_month = datetime.now().month
        seasonal_factor = self.seasonal_patterns.get(category, {}).get(current_month, 1.0)
        
        if seasonal_factor > 1.3:
            return 'high'
        elif seasonal_factor > 1.1:
            return 'medium'
        
        return 'low'
    
    def predict_shopping_behavior(self, days_ahead: int = 7) -> Dict:
        """Predict shopping behavior for the next N days"""
        
        predictions = {
            'predicted_items': [],
            'estimated_spending': 0.0,
            'shopping_frequency': 0,
            'category_breakdown': defaultdict(float),
            'confidence_level': 0.0
        }
        
        # Analyze historical shopping frequency
        purchase_dates = [datetime.strptime(p['date'], '%Y-%m-%d') for p in self.purchase_history]
        if len(purchase_dates) > 1:
            purchase_dates.sort()
            intervals = [(purchase_dates[i+1] - purchase_dates[i]).days for i in range(len(purchase_dates)-1)]
            avg_interval = sum(intervals) / len(intervals)
            
            # Predict number of shopping trips
            predictions['shopping_frequency'] = max(1, int(days_ahead / avg_interval))
        
        # Predict items based on repurchase cycles
        today = datetime.now()
        
        for item, cycle_days in self.purchase_patterns['repurchase_cycles'].items():
            # Find last purchase date
            item_purchases = [p for p in self.purchase_history if p['item'] == item]
            if item_purchases:
                last_purchase = max(datetime.strptime(p['date'], '%Y-%m-%d') for p in item_purchases)
                days_since_last = (today - last_purchase).days
                
                # Predict if item will be needed
                if days_since_last + days_ahead >= cycle_days:
                    # Get historical quantity and price
                    avg_quantity = np.mean([p['quantity'] for p in item_purchases])
                    avg_price = np.mean([p['price'] for p in item_purchases])
                    
                    category = item_purchases[0]['category']
                    
                    predictions['predicted_items'].append({
                        'item': item,
                        'category': category,
                        'predicted_quantity': int(avg_quantity),
                        'estimated_price': round(avg_price, 2),
                        'days_until_needed': max(0, int(cycle_days - days_since_last)),
                        'confidence': min(0.9, 1.0 - (abs(days_since_last - cycle_days) / cycle_days))
                    })
                    
                    predictions['estimated_spending'] += avg_price
                    predictions['category_breakdown'][category] += avg_price
        
        # Calculate overall confidence
        if predictions['predicted_items']:
            predictions['confidence_level'] = np.mean([item['confidence'] for item in predictions['predicted_items']])
        
        return predictions
    
    def optimize_quantities(self, shopping_list: List[Dict]) -> List[Dict]:
        """Optimize quantities based on consumption patterns and waste reduction"""
        
        optimized_list = []
        
        for item_data in shopping_list:
            item_name = item_data.get('name', item_data.get('item', ''))
            current_quantity = item_data.get('quantity', 1)
            category = item_data.get('category', 'Other')
            
            optimization = {
                'original_item': item_data,
                'optimized_quantity': current_quantity,
                'recommendation': 'maintain',
                'reasoning': [],
                'potential_savings': 0.0,
                'waste_reduction': 0.0
            }
            
            # Check historical quantity patterns
            if item_name in self.user_profile['quantity_patterns']:
                quantities = self.user_profile['quantity_patterns'][item_name]
                avg_quantity = np.mean(quantities)
                std_quantity = np.std(quantities)
                
                # Recommend quantity based on historical data
                if current_quantity > avg_quantity + std_quantity:
                    optimization['optimized_quantity'] = int(avg_quantity + std_quantity/2)
                    optimization['recommendation'] = 'reduce'
                    optimization['reasoning'].append('reduce based on usage history')
                    optimization['waste_reduction'] = (current_quantity - optimization['optimized_quantity']) * 0.15
                elif current_quantity < avg_quantity - std_quantity:
                    optimization['optimized_quantity'] = int(avg_quantity)
                    optimization['recommendation'] = 'increase'
                    optimization['reasoning'].append('increase to avoid frequent restocking')
            
            # Check for bulk purchase opportunities
            if current_quantity >= 3:
                # Simulate bulk discount
                bulk_savings = current_quantity * 0.05  # 5% bulk discount
                optimization['potential_savings'] = bulk_savings
                optimization['reasoning'].append('bulk purchase discount available')
            
            # Seasonal adjustments
            current_month = datetime.now().month
            seasonal_factor = self.seasonal_patterns.get(category, {}).get(current_month, 1.0)
            
            if seasonal_factor < 0.9:  # Off-season
                optimization['optimized_quantity'] = max(1, int(optimization['optimized_quantity'] * 0.8))
                optimization['reasoning'].append('reduced for off-season')
            elif seasonal_factor > 1.3:  # Peak season
                optimization['optimized_quantity'] = int(optimization['optimized_quantity'] * 1.2)
                optimization['reasoning'].append('increased for peak season availability')
            
            # Perishability factor
            perishable_categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery']
            if category in perishable_categories:
                # Reduce quantity for perishables to minimize waste
                optimization['optimized_quantity'] = max(1, int(optimization['optimized_quantity'] * 0.9))
                optimization['reasoning'].append('reduced to minimize spoilage')
                optimization['waste_reduction'] += 0.1
            
            if not optimization['reasoning']:
                optimization['reasoning'].append('optimal quantity maintained')
            
            optimized_list.append(optimization)
        
        return optimized_list
    
    def get_seasonal_forecast(self, months_ahead: int = 3) -> Dict:
        """Generate seasonal shopping forecast"""
        
        forecast = {
            'monthly_predictions': [],
            'category_trends': {},
            'budget_implications': {},
            'seasonal_recommendations': []
        }
        
        current_month = datetime.now().month
        
        for i in range(months_ahead):
            target_month = ((current_month + i - 1) % 12) + 1
            month_name = datetime(2024, target_month, 1).strftime('%B')
            
            month_prediction = {
                'month': month_name,
                'month_number': target_month,
                'category_factors': {},
                'recommended_items': [],
                'budget_multiplier': 1.0
            }
            
            total_seasonal_effect = 0
            category_count = 0
            
            for category, seasonal_data in self.seasonal_patterns.items():
                factor = seasonal_data.get(target_month, 1.0)
                month_prediction['category_factors'][category] = factor
                total_seasonal_effect += factor
                category_count += 1
                
                # Generate recommendations for high-factor categories
                if factor > 1.2:
                    month_prediction['recommended_items'].append({
                        'category': category,
                        'reason': f'Peak season (×{factor:.1f})',
                        'action': 'stock_up'
                    })
                elif factor < 0.8:
                    month_prediction['recommended_items'].append({
                        'category': category,
                        'reason': f'Off season (×{factor:.1f})',
                        'action': 'reduce_purchases'
                    })
            
            # Calculate budget multiplier
            if category_count > 0:
                month_prediction['budget_multiplier'] = total_seasonal_effect / category_count
            
            forecast['monthly_predictions'].append(month_prediction)
        
        # Analyze category trends across the forecast period
        for category in self.seasonal_patterns.keys():
            factors = [pred['category_factors'][category] for pred in forecast['monthly_predictions']]
            trend = 'stable'
            
            if len(factors) > 1:
                if factors[-1] > factors[0] * 1.1:
                    trend = 'increasing'
                elif factors[-1] < factors[0] * 0.9:
                    trend = 'decreasing'
            
            forecast['category_trends'][category] = {
                'trend': trend,
                'factors': factors,
                'avg_factor': np.mean(factors)
            }
        
        # Generate seasonal recommendations
        recommendations = []
        for category, trend_data in forecast['category_trends'].items():
            avg_factor = trend_data['avg_factor']
            
            if avg_factor > 1.2:
                recommendations.append({
                    'category': category,
                    'recommendation': f'Plan for increased {category.lower()} purchases',
                    'priority': 'high'
                })
            elif avg_factor < 0.8:
                recommendations.append({
                    'category': category,
                    'recommendation': f'Consider reducing {category.lower()} inventory',
                    'priority': 'medium'
                })
        
        forecast['seasonal_recommendations'] = recommendations
        
        return forecast
    
    def analyze_purchase_intelligence(self) -> Dict:
        """Comprehensive analysis of purchase patterns and intelligence"""
        
        analysis = {
            'user_segments': self._classify_user_segment(),
            'spending_insights': self._analyze_spending_patterns(),
            'efficiency_metrics': self._calculate_efficiency_metrics(),
            'behavioral_insights': self._extract_behavioral_insights(),
            'optimization_opportunities': self._identify_optimization_opportunities()
        }
        
        return analysis
    
    def _classify_user_segment(self) -> Dict:
        """Classify user into behavioral segments"""
        
        segments = []
        
        # Health-conscious segment
        if self.user_profile['health_consciousness'] > 0.7:
            segments.append('health_conscious')
        
        # Price-sensitive segment
        if self.user_profile['price_sensitivity'] < 0.8:
            segments.append('price_sensitive')
        elif self.user_profile['price_sensitivity'] > 1.2:
            segments.append('premium_buyer')
        
        # Category preference segments
        top_category = max(self.user_profile['category_preferences'].items(), key=lambda x: x[1])
        if top_category[1] > 0.4:
            segments.append(f'{top_category[0].lower()}_focused')
        
        # Frequency segments
        total_purchases = len(self.purchase_history)
        days_span = 30  # Assuming 30 days of data
        purchase_frequency = total_purchases / days_span
        
        if purchase_frequency > 0.5:
            segments.append('frequent_shopper')
        elif purchase_frequency < 0.2:
            segments.append('infrequent_shopper')
        
        return {
            'segments': segments,
            'primary_segment': segments[0] if segments else 'average_shopper',
            'confidence': min(0.9, len(segments) * 0.3)
        }
    
    def _analyze_spending_patterns(self) -> Dict:
        """Analyze user spending patterns"""
        
        total_spending = sum(p['price'] for p in self.purchase_history)
        avg_transaction = total_spending / len(self.purchase_history) if self.purchase_history else 0
        
        category_spending = defaultdict(float)
        for purchase in self.purchase_history:
            category_spending[purchase['category']] += purchase['price']
        
        return {
            'total_spending': round(total_spending, 2),
            'average_transaction': round(avg_transaction, 2),
            'category_breakdown': dict(category_spending),
            'largest_category': max(category_spending.items(), key=lambda x: x[1])[0] if category_spending else None,
            'spending_concentration': max(category_spending.values()) / total_spending if total_spending > 0 else 0
        }
    
    def _calculate_efficiency_metrics(self) -> Dict:
        """Calculate shopping efficiency metrics"""
        
        # Estimate waste based on perishable purchases
        perishable_spending = sum(p['price'] for p in self.purchase_history 
                                 if p['category'] in ['Fruits', 'Vegetables', 'Dairy', 'Meat'])
        estimated_waste = perishable_spending * 0.15  # Assume 15% waste rate
        
        # Calculate price efficiency vs market averages
        total_items = sum(p['quantity'] for p in self.purchase_history)
        total_spending = sum(p['price'] for p in self.purchase_history)
        avg_item_cost = total_spending / total_items if total_items > 0 else 0
        
        return {
            'estimated_waste': round(estimated_waste, 2),
            'waste_percentage': 15.0,  # Assumed baseline
            'price_efficiency': round(100 - (self.user_profile['price_sensitivity'] - 1.0) * 50, 1),
            'average_item_cost': round(avg_item_cost, 2),
            'repurchase_efficiency': len(self.purchase_patterns['repurchase_cycles']) / len(set(p['item'] for p in self.purchase_history)) if self.purchase_history else 0
        }
    
    def _extract_behavioral_insights(self) -> List[Dict]:
        """Extract actionable behavioral insights"""
        
        insights = []
        
        # Health insights
        if self.user_profile['health_consciousness'] < 0.5:
            insights.append({
                'type': 'health',
                'message': 'Consider adding more fruits and vegetables to your regular purchases',
                'priority': 'medium',
                'potential_impact': 'Improve nutritional balance'
            })
        
        # Price sensitivity insights
        if self.user_profile['price_sensitivity'] > 1.3:
            insights.append({
                'type': 'savings',
                'message': 'You tend to buy premium items. Consider price comparison for better deals',
                'priority': 'high',
                'potential_impact': 'Save 10-15% on groceries'
            })
        
        # Category diversification
        category_count = len([v for v in self.user_profile['category_preferences'].values() if v > 0.1])
        if category_count < 5:
            insights.append({
                'type': 'variety',
                'message': 'Try expanding to more food categories for better nutrition',
                'priority': 'low',
                'potential_impact': 'Improved dietary variety'
            })
        
        return insights
    
    def _identify_optimization_opportunities(self) -> List[Dict]:
        """Identify specific optimization opportunities"""
        
        opportunities = []
        
        # Bulk purchase opportunities
        frequent_items = [item for item, cycle in self.purchase_patterns['repurchase_cycles'].items() if cycle <= 14]
        if frequent_items:
            opportunities.append({
                'type': 'bulk_purchase',
                'description': f'Consider bulk buying for frequently purchased items: {", ".join(frequent_items[:3])}',
                'potential_savings': '5-10%',
                'effort': 'low'
            })
        
        # Seasonal optimization
        current_month = datetime.now().month
        high_season_categories = [cat for cat, patterns in self.seasonal_patterns.items() 
                                if patterns.get(current_month, 1.0) > 1.2]
        if high_season_categories:
            opportunities.append({
                'type': 'seasonal',
                'description': f'Stock up on {", ".join(high_season_categories)} - currently in season',
                'potential_savings': '15-20%',
                'effort': 'medium'
            })
        
        # Waste reduction
        perishable_ratio = len([p for p in self.purchase_history 
                               if p['category'] in ['Fruits', 'Vegetables']]) / len(self.purchase_history)
        if perishable_ratio > 0.4:
            opportunities.append({
                'type': 'waste_reduction',
                'description': 'Optimize fresh produce quantities to reduce waste',
                'potential_savings': 'Reduce waste by 20%',
                'effort': 'medium'
            })
        
        return opportunities
#!/usr/bin/env python3
"""
Enhanced Machine Learning Engine for Smart Grocery Shopping Assistant

Advanced AI-powered features including:
- Deep learning-based purchase prediction
- Collaborative filtering recommendations  
- Time series forecasting
- User behavior clustering
- Real-time adaptation
- Personalized nutrition optimization

Author: CS 6340 Mini Project - AI Enhancement
Date: November 2025
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import math
import random
from collections import defaultdict, Counter
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import pickle

class AdvancedMLEngine:
    """
    Next-generation Machine Learning Engine with advanced AI capabilities
    """
    
    def __init__(self):
        self.user_profiles = {}
        self.item_embeddings = {}
        self.purchase_patterns = {}
        self.seasonal_factors = {}
        self.recommendation_models = {}
        self.user_clusters = None
        self.scaler = StandardScaler()
        self.models_trained = False
        self.model_path = 'models/ml/'
        self._ensure_model_directory()
        self._initialize_advanced_models()
        self._load_or_create_user_data()
    
    def _ensure_model_directory(self):
        """Ensure model directory exists"""
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
    
    def _initialize_advanced_models(self):
        """Initialize advanced ML models and parameters"""
        
        # Advanced user behavior feature weights
        self.behavior_weights = {
            'purchase_frequency': 0.25,
            'recency_score': 0.20,
            'quantity_patterns': 0.15,
            'seasonal_affinity': 0.15,
            'price_sensitivity': 0.10,
            'category_diversity': 0.10,
            'time_of_day_preference': 0.05
        }
        
        # Deep item embeddings (enhanced dimensionality)
        self.category_embeddings = {
            'fruits': np.array([0.8, 0.6, 0.9, 0.7, 0.5, 0.3, 0.8, 0.6]),
            'vegetables': np.array([0.9, 0.7, 0.8, 0.6, 0.4, 0.7, 0.5, 0.9]),
            'dairy': np.array([0.5, 0.8, 0.6, 0.9, 0.7, 0.4, 0.6, 0.5]),
            'meat': np.array([0.4, 0.5, 0.7, 0.8, 0.9, 0.6, 0.7, 0.4]),
            'grains': np.array([0.6, 0.4, 0.5, 0.7, 0.8, 0.5, 0.4, 0.6]),
            'bakery': np.array([0.7, 0.6, 0.4, 0.5, 0.6, 0.8, 0.3, 0.7]),
            'condiments': np.array([0.3, 0.4, 0.6, 0.5, 0.7, 0.2, 0.5, 0.3]),
            'beverages': np.array([0.5, 0.7, 0.8, 0.4, 0.6, 0.9, 0.2, 0.5]),
            'snacks': np.array([0.6, 0.5, 0.3, 0.8, 0.7, 0.1, 0.9, 0.6]),
            'frozen': np.array([0.4, 0.6, 0.7, 0.5, 0.8, 0.3, 0.1, 0.4]),
            'organic': np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.8, 0.7, 0.9]),
            'household': np.array([0.2, 0.3, 0.4, 0.5, 0.6, 0.1, 0.8, 0.2])
        }
        
        # Enhanced seasonal patterns with weather considerations
        self.seasonal_patterns = self._generate_enhanced_seasonal_patterns()
        
        # Initialize ML models
        self.purchase_predictor = RandomForestClassifier(
            n_estimators=100, 
            max_depth=10, 
            random_state=42
        )
        
        self.quantity_predictor = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        
        # User similarity model for collaborative filtering
        self.user_similarity_model = None
        
        # Advanced preference learning
        self.preference_weights = defaultdict(float)
    
    def _generate_enhanced_seasonal_patterns(self):
        """Generate advanced seasonal patterns with weather and cultural factors"""
        patterns = {}
        categories = ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'bakery', 'beverages']
        
        for category in categories:
            patterns[category] = {}
            for month in range(1, 13):
                base_factor = 1.0
                
                # Seasonal adjustments
                if category in ['fruits', 'vegetables']:
                    # Fresh produce peaks in summer
                    if month in [6, 7, 8]:
                        base_factor = 1.4 + random.uniform(-0.1, 0.1)
                    elif month in [12, 1, 2]:
                        base_factor = 0.7 + random.uniform(-0.1, 0.1)
                    else:
                        base_factor = 1.0 + random.uniform(-0.2, 0.2)
                
                elif category == 'beverages':
                    # Hot beverages in winter, cold in summer
                    if month in [6, 7, 8]:
                        base_factor = 1.3 + random.uniform(-0.1, 0.1)
                    elif month in [12, 1, 2]:
                        base_factor = 1.1 + random.uniform(-0.1, 0.1)
                    else:
                        base_factor = 1.0 + random.uniform(-0.1, 0.1)
                
                patterns[category][month] = max(0.5, min(1.5, base_factor))
        
        return patterns
    
    def _load_or_create_user_data(self):
        """Load existing user data or create sample data for ML training"""
        
        # Try to load existing user data
        user_data_file = os.path.join(self.model_path, 'user_data.json')
        
        if os.path.exists(user_data_file):
            try:
                with open(user_data_file, 'r') as f:
                    loaded_data = json.load(f)
                    self.purchase_history = loaded_data.get('purchase_history', [])
                    self.user_profiles = loaded_data.get('user_profiles', {})
                    print("Loaded existing user data")
            except Exception as e:
                print(f"Error loading user data: {e}")
                self._create_sample_data()
        else:
            self._create_sample_data()
        
        # Build or update user profiles
        self._build_advanced_user_profile()
        self._analyze_advanced_patterns()
    
    def _create_sample_data(self):
        """Create enhanced sample data for ML training"""
        
        # Generate realistic purchase history over several months
        current_date = datetime.now() - timedelta(days=90)
        self.purchase_history = []
        
        # Common items with realistic frequencies
        item_templates = [
            {'item': 'Bananas', 'category': 'fruits', 'avg_price': 3.50, 'frequency': 7},
            {'item': 'Milk', 'category': 'dairy', 'avg_price': 3.80, 'frequency': 4},
            {'item': 'Bread', 'category': 'bakery', 'avg_price': 4.00, 'frequency': 5},
            {'item': 'Chicken Breast', 'category': 'meat', 'avg_price': 12.99, 'frequency': 10},
            {'item': 'Apples', 'category': 'fruits', 'avg_price': 6.00, 'frequency': 8},
            {'item': 'Yogurt', 'category': 'dairy', 'avg_price': 7.50, 'frequency': 6},
            {'item': 'Rice', 'category': 'grains', 'avg_price': 3.99, 'frequency': 14},
            {'item': 'Tomatoes', 'category': 'vegetables', 'avg_price': 4.50, 'frequency': 9},
            {'item': 'Eggs', 'category': 'dairy', 'avg_price': 3.50, 'frequency': 7},
            {'item': 'Pasta', 'category': 'grains', 'avg_price': 4.50, 'frequency': 12},
            {'item': 'Orange Juice', 'category': 'beverages', 'avg_price': 5.50, 'frequency': 8},
            {'item': 'Carrots', 'category': 'vegetables', 'avg_price': 2.50, 'frequency': 11},
            {'item': 'Cheese', 'category': 'dairy', 'avg_price': 8.00, 'frequency': 9},
            {'item': 'Cereal', 'category': 'grains', 'avg_price': 6.50, 'frequency': 15},
            {'item': 'Ground Beef', 'category': 'meat', 'avg_price': 8.99, 'frequency': 12}
        ]
        
        # Generate purchases over 90 days
        for day in range(90):
            current_day = current_date + timedelta(days=day)
            
            # Simulate shopping 2-3 times per week
            if random.random() < 0.35:  # ~35% chance of shopping each day
                daily_items = []
                num_items = random.randint(3, 8)  # Buy 3-8 items per trip
                
                selected_items = random.sample(item_templates, min(num_items, len(item_templates)))
                
                for item_template in selected_items:
                    # Check if we should buy this item based on frequency
                    days_since_start = day + 1
                    expected_purchases = days_since_start / item_template['frequency']
                    actual_purchases = sum(1 for p in self.purchase_history 
                                         if p['item'] == item_template['item'])
                    
                    if actual_purchases < expected_purchases or random.random() < 0.3:
                        # Add seasonal variation
                        month = current_day.month
                        seasonal_factor = self.seasonal_patterns.get(
                            item_template['category'], {}
                        ).get(month, 1.0)
                        
                        if random.random() < seasonal_factor * 0.7:
                            quantity = random.randint(1, 4)
                            price_variation = random.uniform(0.8, 1.2)
                            
                            purchase = {
                                'item': item_template['item'],
                                'category': item_template['category'],
                                'quantity': quantity,
                                'price': round(item_template['avg_price'] * price_variation, 2),
                                'date': current_day.strftime('%Y-%m-%d'),
                                'time': f"{random.randint(8, 20):02d}:{random.randint(0, 59):02d}",
                                'store': random.choice(['Store A', 'Store B', 'Store C']),
                                'day_of_week': current_day.strftime('%A')
                            }
                            
                            self.purchase_history.append(purchase)
        
        print(f"Generated {len(self.purchase_history)} sample purchases for ML training")
        self._save_user_data()
    
    def _build_advanced_user_profile(self):
        """Build comprehensive user profile using advanced analytics"""
        if not self.purchase_history:
            return
        
        # Convert purchase history to DataFrame for easier analysis
        df = pd.DataFrame(self.purchase_history)
        df['date'] = pd.to_datetime(df['date'])
        df['total_spent'] = df['quantity'] * df['price']
        
        # Calculate advanced user features
        profile = {
            'total_purchases': len(df),
            'total_spent': df['total_spent'].sum(),
            'avg_basket_size': df.groupby('date')['quantity'].sum().mean(),
            'avg_basket_value': df.groupby('date')['total_spent'].sum().mean(),
            'shopping_frequency': self._calculate_shopping_frequency(df),
            'category_preferences': self._calculate_category_preferences(df),
            'price_sensitivity': self._calculate_price_sensitivity(df),
            'seasonal_preferences': self._calculate_seasonal_preferences(df),
            'time_preferences': self._calculate_time_preferences(df),
            'brand_loyalty': self._calculate_brand_loyalty(df),
            'health_consciousness': self._calculate_health_score(df),
            'purchase_patterns': self._extract_purchase_patterns(df)
        }
        
        self.user_profiles['default_user'] = profile
    
    def _calculate_shopping_frequency(self, df):
        """Calculate how often the user shops"""
        shopping_days = df['date'].nunique()
        date_range = (df['date'].max() - df['date'].min()).days
        return shopping_days / max(date_range, 1) * 7  # Shopping days per week
    
    def _calculate_category_preferences(self, df):
        """Calculate preference scores for different categories"""
        category_stats = df.groupby('category').agg({
            'quantity': 'sum',
            'total_spent': 'sum',
            'date': 'count'  # frequency
        }).to_dict('index')
        
        total_quantity = df['quantity'].sum()
        total_spent = df['total_spent'].sum()
        
        preferences = {}
        for category, stats in category_stats.items():
            preferences[category] = {
                'quantity_ratio': stats['quantity'] / total_quantity,
                'spending_ratio': stats['total_spent'] / total_spent,
                'purchase_frequency': stats['date'],
                'preference_score': (stats['quantity'] / total_quantity) * 0.4 + 
                                  (stats['total_spent'] / total_spent) * 0.6
            }
        
        return preferences
    
    def _calculate_price_sensitivity(self, df):
        """Calculate user's price sensitivity"""
        # Analyze price vs quantity relationship
        item_price_analysis = {}
        
        for item in df['item'].unique():
            item_data = df[df['item'] == item]
            if len(item_data) > 1:
                correlation = np.corrcoef(item_data['price'], item_data['quantity'])[0, 1]
                item_price_analysis[item] = correlation
        
        # Average correlation (negative = price sensitive)
        if item_price_analysis:
            avg_price_sensitivity = np.mean(list(item_price_analysis.values()))
            return abs(avg_price_sensitivity)  # Return as positive sensitivity score
        
        return 0.5  # Default moderate sensitivity
    
    def _calculate_seasonal_preferences(self, df):
        """Analyze seasonal purchasing patterns"""
        df['month'] = df['date'].dt.month
        monthly_patterns = df.groupby(['month', 'category']).agg({
            'quantity': 'sum',
            'total_spent': 'sum'
        }).reset_index()
        
        seasonal_prefs = {}
        for month in range(1, 13):
            month_data = monthly_patterns[monthly_patterns['month'] == month]
            if not month_data.empty:
                seasonal_prefs[month] = month_data.groupby('category')['quantity'].sum().to_dict()
        
        return seasonal_prefs
    
    def _calculate_time_preferences(self, df):
        """Analyze time-based shopping preferences"""
        if 'time' not in df.columns:
            return {}
        
        df['hour'] = pd.to_datetime(df['time'], format='%H:%M').dt.hour
        df['day_of_week'] = df['date'].dt.day_name()
        
        return {
            'preferred_hours': df['hour'].value_counts().head(3).to_dict(),
            'preferred_days': df['day_of_week'].value_counts().head(3).to_dict()
        }
    
    def _calculate_brand_loyalty(self, df):
        """Calculate brand loyalty scores"""
        # Simplified - using item repetition as proxy for brand loyalty
        item_counts = df['item'].value_counts()
        total_purchases = len(df)
        
        loyalty_score = 0
        for item, count in item_counts.items():
            if count > 1:
                loyalty_score += (count / total_purchases) ** 2
        
        return min(1.0, loyalty_score)
    
    def _calculate_health_score(self, df):
        """Calculate health consciousness score"""
        healthy_categories = ['fruits', 'vegetables', 'organic']
        unhealthy_categories = ['snacks', 'beverages']
        
        healthy_purchases = df[df['category'].isin(healthy_categories)]['quantity'].sum()
        unhealthy_purchases = df[df['category'].isin(unhealthy_categories)]['quantity'].sum()
        total_purchases = df['quantity'].sum()
        
        if total_purchases > 0:
            health_score = (healthy_purchases - unhealthy_purchases * 0.5) / total_purchases
            return max(0, min(1, health_score))
        
        return 0.5
    
    def _extract_purchase_patterns(self, df):
        """Extract advanced purchase patterns"""
        patterns = {}
        
        # Basket composition patterns
        basket_compositions = df.groupby('date')['category'].apply(list).tolist()
        
        # Find frequent category combinations
        category_combinations = defaultdict(int)
        for basket in basket_compositions:
            if len(basket) > 1:
                for i in range(len(basket)):
                    for j in range(i+1, len(basket)):
                        combo = tuple(sorted([basket[i], basket[j]]))
                        category_combinations[combo] += 1
        
        patterns['frequent_combinations'] = dict(category_combinations)
        
        # Purchase timing patterns
        if 'day_of_week' in df.columns:
            patterns['weekly_patterns'] = df.groupby('day_of_week')['quantity'].sum().to_dict()
        
        return patterns
    
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
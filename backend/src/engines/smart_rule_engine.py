from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import json
import numpy as np
from collections import defaultdict, Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import pickle
import os
try:
    from ..models.grocery_item import GroceryItem
    from ..models.shopping_list import ShoppingList
    from ..models.purchase_history import PurchaseHistory
except ImportError:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))
    from grocery_item import GroceryItem
    from shopping_list import ShoppingList
    from purchase_history import PurchaseHistory

class SmartRuleEngine:
    """
    AI-enhanced rule engine that learns from user behavior and adapts recommendations
    """
    
    def __init__(self):
        self.user_preferences = {}
        self.item_associations = {}
        self.seasonal_patterns = {}
        self.category_preferences = {}
        self.purchase_patterns = {}
        self.item_clusters = None
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.model_path = 'models/'
        self._load_or_initialize_models()
        
    def _load_or_initialize_models(self):
        """Load existing models or initialize new ones"""
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
            
        # Try to load existing models
        try:
            with open(f'{self.model_path}user_preferences.json', 'r') as f:
                self.user_preferences = json.load(f)
            with open(f'{self.model_path}item_associations.json', 'r') as f:
                self.item_associations = json.load(f)
            with open(f'{self.model_path}seasonal_patterns.json', 'r') as f:
                self.seasonal_patterns = json.load(f)
        except FileNotFoundError:
            # Initialize with empty models if files don't exist
            self.user_preferences = {}
            self.item_associations = {}
            self.seasonal_patterns = {}

    def learn_from_purchase_history(self, purchase_history: PurchaseHistory):
        """
        Learn user patterns from their purchase history using machine learning
        """
        if not purchase_history.all_purchases:
            return
            
        # Learn item associations using market basket analysis
        self._learn_item_associations(purchase_history)
        
        # Learn seasonal patterns
        self._learn_seasonal_patterns(purchase_history)
        
        # Learn category preferences with time weighting
        self._learn_category_preferences(purchase_history)
        
        # Learn purchase frequency patterns
        self._learn_purchase_patterns(purchase_history)
        
        # Cluster similar items for better recommendations
        self._cluster_similar_items(purchase_history)
        
        # Save learned models
        self._save_models()
        
    def _learn_item_associations(self, purchase_history: PurchaseHistory):
        """
        Learn which items are frequently bought together using Apriori-like algorithm
        """
        # Group purchases by date (same day = same basket)
        baskets = defaultdict(list)
        for item in purchase_history.all_purchases:
            date_key = item.purchase_date.strftime('%Y-%m-%d')
            baskets[date_key].append(item.name.lower())
        
        # Calculate item co-occurrence
        item_cooccurrence = defaultdict(lambda: defaultdict(int))
        item_counts = defaultdict(int)
        
        for basket_items in baskets.values():
            # Count individual items
            for item in basket_items:
                item_counts[item] += 1
            
            # Count pairs
            for i, item1 in enumerate(basket_items):
                for item2 in basket_items[i+1:]:
                    item_cooccurrence[item1][item2] += 1
                    item_cooccurrence[item2][item1] += 1
        
        # Calculate association strength (confidence)
        min_support = 2  # Minimum occurrences
        for item1, cooccurrences in item_cooccurrence.items():
            if item_counts[item1] >= min_support:
                self.item_associations[item1] = {}
                for item2, count in cooccurrences.items():
                    if count >= min_support:
                        # Calculate confidence: P(item2|item1)
                        confidence = count / item_counts[item1]
                        if confidence > 0.3:  # Minimum confidence threshold
                            self.item_associations[item1][item2] = {
                                'confidence': confidence,
                                'support': count,
                                'lift': confidence / (item_counts[item2] / len(baskets))
                            }

    def _learn_seasonal_patterns(self, purchase_history: PurchaseHistory):
        """
        Learn seasonal purchasing patterns from user's history
        """
        monthly_purchases = defaultdict(lambda: defaultdict(int))
        
        for item in purchase_history.all_purchases:
            month = item.purchase_date.month
            monthly_purchases[month][item.name.lower()] += 1
        
        # Calculate seasonal preference scores
        for month, items in monthly_purchases.items():
            total_items = sum(items.values())
            if total_items > 0:
                self.seasonal_patterns[str(month)] = {}
                for item, count in items.items():
                    preference_score = count / total_items
                    if preference_score > 0.1:  # Only significant preferences
                        self.seasonal_patterns[str(month)][item] = preference_score

    def _learn_category_preferences(self, purchase_history: PurchaseHistory):
        """
        Learn category preferences with recency weighting
        """
        category_weights = defaultdict(float)
        total_weight = 0
        
        current_time = datetime.now()
        
        for item in purchase_history.all_purchases:
            # Weight recent purchases more heavily
            days_ago = (current_time - item.purchase_date).days
            weight = 1.0 / (1.0 + days_ago * 0.01)  # Exponential decay
            
            category_weights[item.category] += weight
            total_weight += weight
        
        # Normalize to get preferences
        if total_weight > 0:
            for category, weight in category_weights.items():
                self.category_preferences[category] = weight / total_weight

    def _learn_purchase_patterns(self, purchase_history: PurchaseHistory):
        """
        Learn individual item purchase patterns and predict next purchase
        """
        item_purchases = defaultdict(list)
        
        for item in purchase_history.all_purchases:
            item_purchases[item.name.lower()].append(item.purchase_date)
        
        for item_name, dates in item_purchases.items():
            if len(dates) > 1:
                dates.sort()
                intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
                
                avg_interval = np.mean(intervals)
                std_interval = np.std(intervals) if len(intervals) > 1 else avg_interval * 0.2
                last_purchase = dates[-1]
                days_since_last = (datetime.now() - last_purchase).days
                
                # Predict next purchase probability
                expected_next = avg_interval
                probability = max(0, min(1, days_since_last / expected_next))
                
                self.purchase_patterns[item_name] = {
                    'avg_interval': avg_interval,
                    'std_interval': std_interval,
                    'last_purchase': last_purchase.isoformat(),
                    'next_purchase_probability': probability,
                    'purchase_count': len(dates)
                }

    def _cluster_similar_items(self, purchase_history: PurchaseHistory):
        """
        Cluster similar items using text similarity and purchase patterns
        """
        items = list(set(item.name.lower() for item in purchase_history.all_purchases))
        
        if len(items) < 3:
            return
            
        try:
            # Create feature vectors from item names
            tfidf_matrix = self.vectorizer.fit_transform(items)
            
            # Determine optimal number of clusters
            n_clusters = min(5, max(2, len(items) // 3))
            
            # Perform clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            clusters = kmeans.fit_predict(tfidf_matrix)
            
            # Store clustering results
            self.item_clusters = {}
            for i, item in enumerate(items):
                cluster_id = int(clusters[i])
                if cluster_id not in self.item_clusters:
                    self.item_clusters[cluster_id] = []
                self.item_clusters[cluster_id].append(item)
                
        except Exception as e:
            print(f"Clustering failed: {e}")
            self.item_clusters = None

    def generate_smart_suggestions(self, shopping_list: ShoppingList, 
                                 purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Generate AI-enhanced suggestions based on learned patterns
        """
        # First, update our learning from the latest data
        self.learn_from_purchase_history(purchase_history)
        
        suggestions = []
        
        # 1. Pattern-based suggestions using learned purchase patterns
        pattern_suggestions = self._get_smart_pattern_suggestions(shopping_list, purchase_history)
        suggestions.extend(pattern_suggestions)
        
        # 2. Association-based suggestions using learned associations
        association_suggestions = self._get_smart_association_suggestions(shopping_list)
        suggestions.extend(association_suggestions)
        
        # 3. Seasonal suggestions using learned seasonal patterns
        seasonal_suggestions = self._get_smart_seasonal_suggestions(shopping_list)
        suggestions.extend(seasonal_suggestions)
        
        # 4. Category-based suggestions using learned preferences
        category_suggestions = self._get_smart_category_suggestions(shopping_list)
        suggestions.extend(category_suggestions)
        
        # 5. Cluster-based suggestions
        cluster_suggestions = self._get_cluster_suggestions(shopping_list)
        suggestions.extend(cluster_suggestions)
        
        # Remove duplicates and items already in shopping list
        unique_suggestions = self._deduplicate_suggestions(suggestions, shopping_list)
        
        # Sort by AI confidence score
        unique_suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return unique_suggestions[:15]  # Return top 15 suggestions

    def _get_smart_pattern_suggestions(self, shopping_list: ShoppingList, 
                                     purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Smart pattern suggestions using learned purchase patterns
        """
        suggestions = []
        
        for item_name, pattern in self.purchase_patterns.items():
            # Skip if already in shopping list
            if shopping_list.find_item(item_name):
                continue
                
            probability = pattern['next_purchase_probability']
            
            if probability > 0.7:  # High probability of needing this item
                # Get item details from history
                recent_items = [item for item in purchase_history.all_purchases 
                              if item.name.lower() == item_name]
                
                if recent_items:
                    recent_item = recent_items[-1]
                    
                    suggestions.append({
                        'name': recent_item.name,
                        'category': recent_item.category,
                        'reason': f"AI Pattern: You typically buy this every {pattern['avg_interval']:.0f} days (Probability: {probability:.1%})",
                        'confidence': min(0.95, probability * 0.9),
                        'rule_type': 'smart_pattern',
                        'ai_insights': {
                            'purchase_frequency': pattern['avg_interval'],
                            'prediction_confidence': probability,
                            'purchase_count': pattern['purchase_count']
                        }
                    })
        
        return suggestions

    def _get_smart_association_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Smart association suggestions using learned item relationships
        """
        suggestions = []
        
        for item in shopping_list.items:
            item_name = item.name.lower()
            
            if item_name in self.item_associations:
                for associated_item, stats in self.item_associations[item_name].items():
                    # Skip if already in shopping list
                    if shopping_list.find_item(associated_item):
                        continue
                    
                    # Use confidence and lift for scoring
                    confidence_score = stats['confidence'] * stats['lift']
                    
                    if confidence_score > 0.4:  # Significant association
                        suggestions.append({
                            'name': associated_item.title(),
                            'category': self._guess_category(associated_item),
                            'reason': f"AI Association: {confidence_score:.1%} chance you buy this with {item.name}",
                            'confidence': min(0.85, confidence_score * 0.8),
                            'rule_type': 'smart_association',
                            'ai_insights': {
                                'confidence': stats['confidence'],
                                'support': stats['support'],
                                'lift': stats['lift']
                            }
                        })
        
        return suggestions

    def _get_smart_seasonal_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Smart seasonal suggestions using learned seasonal patterns
        """
        suggestions = []
        current_month = str(datetime.now().month)
        
        if current_month in self.seasonal_patterns:
            seasonal_items = self.seasonal_patterns[current_month]
            
            for item_name, preference_score in seasonal_items.items():
                # Skip if already in shopping list
                if shopping_list.find_item(item_name):
                    continue
                
                if preference_score > 0.2:  # Significant seasonal preference
                    suggestions.append({
                        'name': item_name.title(),
                        'category': self._guess_category(item_name),
                        'reason': f"AI Seasonal: You buy this {preference_score:.1%} of the time in {datetime.now().strftime('%B')}",
                        'confidence': min(0.7, preference_score * 0.8),
                        'rule_type': 'smart_seasonal',
                        'ai_insights': {
                            'seasonal_preference': preference_score,
                            'month': datetime.now().strftime('%B')
                        }
                    })
        
        return suggestions

    def _get_smart_category_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Smart category suggestions using learned category preferences
        """
        suggestions = []
        
        # Get current categories in shopping list
        current_categories = set(item.category for item in shopping_list.items)
        
        # Suggest items from preferred categories not in current list
        for category, preference in self.category_preferences.items():
            if category not in current_categories and preference > 0.1:
                # Find popular items from this category in user's history
                # This would require additional item tracking by category
                suggestions.append({
                    'name': f"Popular {category} item",  # Placeholder - would be actual item
                    'category': category,
                    'reason': f"AI Category: You prefer {category} items ({preference:.1%} of purchases)",
                    'confidence': min(0.6, preference * 0.7),
                    'rule_type': 'smart_category',
                    'ai_insights': {
                        'category_preference': preference
                    }
                })
        
        return suggestions

    def _get_cluster_suggestions(self, shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """
        Suggest items from same clusters as items in shopping list
        """
        suggestions = []
        
        if not self.item_clusters:
            return suggestions
        
        # Find clusters of items in shopping list
        list_item_clusters = set()
        for item in shopping_list.items:
            item_name = item.name.lower()
            for cluster_id, items in self.item_clusters.items():
                if item_name in items:
                    list_item_clusters.add(cluster_id)
        
        # Suggest other items from same clusters
        for cluster_id in list_item_clusters:
            cluster_items = self.item_clusters[cluster_id]
            for item_name in cluster_items[:2]:  # Top 2 from each cluster
                if not shopping_list.find_item(item_name):
                    suggestions.append({
                        'name': item_name.title(),
                        'category': self._guess_category(item_name),
                        'reason': f"AI Cluster: Similar to items you're buying",
                        'confidence': 0.5,
                        'rule_type': 'cluster_similarity'
                    })
        
        return suggestions

    def _deduplicate_suggestions(self, suggestions: List[Dict[str, any]], 
                               shopping_list: ShoppingList) -> List[Dict[str, any]]:
        """Remove duplicate suggestions and items already in shopping list"""
        seen_items = set()
        unique_suggestions = []
        
        for suggestion in suggestions:
            item_name = suggestion['name'].lower().strip()
            
            if item_name in seen_items or shopping_list.find_item(item_name):
                continue
            
            seen_items.add(item_name)
            unique_suggestions.append(suggestion)
        
        return unique_suggestions

    def _guess_category(self, item_name: str) -> str:
        """Improved category guessing using learned patterns"""
        item_name = item_name.lower()
        
        # First check learned category preferences
        for category in self.category_preferences.keys():
            if category.lower() in item_name:
                return category
        
        # Fallback to keyword matching
        category_keywords = {
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
            'fruits': ['apple', 'banana', 'orange', 'berry', 'grape', 'lemon', 'peach'],
            'vegetables': ['tomato', 'onion', 'carrot', 'potato', 'lettuce', 'spinach', 'broccoli'],
            'protein': ['chicken', 'beef', 'fish', 'egg', 'bean', 'tofu'],
            'grains': ['bread', 'rice', 'pasta', 'oat', 'cereal'],
            'beverages': ['juice', 'soda', 'tea', 'coffee', 'water'],
            'condiments': ['sauce', 'dressing', 'spice', 'salt', 'pepper', 'oil'],
            'snacks': ['chip', 'cookie', 'cracker', 'nut']
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in item_name:
                    return category
        
        return 'other'

    def _save_models(self):
        """Save learned models to disk"""
        try:
            with open(f'{self.model_path}user_preferences.json', 'w') as f:
                json.dump(self.user_preferences, f)
            with open(f'{self.model_path}item_associations.json', 'w') as f:
                json.dump(self.item_associations, f)
            with open(f'{self.model_path}seasonal_patterns.json', 'w') as f:
                json.dump(self.seasonal_patterns, f)
            with open(f'{self.model_path}purchase_patterns.json', 'w') as f:
                json.dump(self.purchase_patterns, f, default=str)
        except Exception as e:
            print(f"Error saving models: {e}")

    def get_ai_insights(self) -> Dict[str, any]:
        """Get insights about learned user patterns"""
        return {
            'learned_associations': len(self.item_associations),
            'seasonal_patterns': len(self.seasonal_patterns),
            'category_preferences': self.category_preferences,
            'tracked_items': len(self.purchase_patterns),
            'item_clusters': len(self.item_clusters) if self.item_clusters else 0,
            'top_associations': {
                item: {assoc: stats['confidence'] for assoc, stats in associations.items()}
                for item, associations in list(self.item_associations.items())[:5]
            }
        }
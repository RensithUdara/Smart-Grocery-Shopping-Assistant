from typing import List, Dict, Optional, Tuple
import json
from ..models.grocery_item import GroceryItem

class RecommendationEngine:
    """
    Recommendation engine for healthy alternatives and substitutions
    """
    
    def __init__(self):
        # Healthy alternatives database
        self.healthy_alternatives = {
            # Bread and Grains
            'white bread': {
                'alternatives': ['whole wheat bread', 'multigrain bread', 'sourdough bread'],
                'reason': 'Higher fiber and nutrients',
                'health_score': 8
            },
            'white rice': {
                'alternatives': ['brown rice', 'quinoa', 'wild rice'],
                'reason': 'More fiber and protein',
                'health_score': 7
            },
            'regular pasta': {
                'alternatives': ['whole wheat pasta', 'quinoa pasta', 'lentil pasta'],
                'reason': 'Higher protein and fiber',
                'health_score': 7
            },
            
            # Dairy Products
            'whole milk': {
                'alternatives': ['low-fat milk', 'almond milk', 'oat milk'],
                'reason': 'Lower calories and saturated fat',
                'health_score': 6
            },
            'regular cheese': {
                'alternatives': ['low-fat cheese', 'cottage cheese', 'ricotta cheese'],
                'reason': 'Less saturated fat, more protein',
                'health_score': 6
            },
            'butter': {
                'alternatives': ['olive oil', 'avocado oil', 'coconut oil'],
                'reason': 'Healthier fats',
                'health_score': 8
            },
            'ice cream': {
                'alternatives': ['frozen yogurt', 'nice cream', 'sorbet'],
                'reason': 'Lower calories and sugar',
                'health_score': 7
            },
            
            # Proteins
            'red meat': {
                'alternatives': ['chicken breast', 'fish', 'tofu', 'legumes'],
                'reason': 'Lower saturated fat, heart-healthy',
                'health_score': 9
            },
            'processed meat': {
                'alternatives': ['fresh chicken', 'turkey', 'fish', 'plant protein'],
                'reason': 'Avoid preservatives and excess sodium',
                'health_score': 9
            },
            'fried chicken': {
                'alternatives': ['grilled chicken', 'baked chicken', 'air-fried chicken'],
                'reason': 'Much lower in unhealthy fats',
                'health_score': 8
            },
            
            # Snacks and Sweets
            'potato chips': {
                'alternatives': ['baked chips', 'air-popped popcorn', 'nuts', 'vegetable chips'],
                'reason': 'Lower in trans fats and sodium',
                'health_score': 7
            },
            'candy': {
                'alternatives': ['dark chocolate', 'dried fruits', 'nuts'],
                'reason': 'Natural sugars and added nutrients',
                'health_score': 8
            },
            'cookies': {
                'alternatives': ['oatmeal cookies', 'fruit bars', 'homemade cookies'],
                'reason': 'Less processed ingredients',
                'health_score': 6
            },
            'soda': {
                'alternatives': ['sparkling water', 'fruit-infused water', 'herbal tea'],
                'reason': 'No added sugars or artificial ingredients',
                'health_score': 9
            },
            
            # Cooking Oils and Condiments
            'vegetable oil': {
                'alternatives': ['olive oil', 'avocado oil', 'coconut oil'],
                'reason': 'Better fatty acid profile',
                'health_score': 7
            },
            'mayonnaise': {
                'alternatives': ['avocado', 'greek yogurt', 'hummus'],
                'reason': 'Lower calories, more nutrients',
                'health_score': 7
            },
            'ketchup': {
                'alternatives': ['salsa', 'tomato paste', 'hot sauce'],
                'reason': 'Less sugar and preservatives',
                'health_score': 6
            },
            
            # Breakfast Items
            'sugary cereal': {
                'alternatives': ['oatmeal', 'whole grain cereal', 'muesli'],
                'reason': 'Less sugar, more fiber',
                'health_score': 8
            },
            'pancake mix': {
                'alternatives': ['whole wheat pancake mix', 'oat flour pancakes', 'protein pancakes'],
                'reason': 'More protein and fiber',
                'health_score': 7
            },
            'syrup': {
                'alternatives': ['honey', 'maple syrup', 'fruit compote'],
                'reason': 'Natural sweeteners with nutrients',
                'health_score': 6
            }
        }
        
        # Category-based recommendations
        self.category_recommendations = {
            'fruits': {
                'organic_boost': 2,
                'seasonal_bonus': 1,
                'general_advice': 'Choose colorful variety for maximum nutrients'
            },
            'vegetables': {
                'organic_boost': 2,
                'seasonal_bonus': 1,
                'general_advice': 'Aim for different colors daily'
            },
            'dairy': {
                'organic_boost': 1,
                'low_fat_bonus': 1,
                'general_advice': 'Consider calcium and protein content'
            },
            'protein': {
                'lean_bonus': 2,
                'plant_based_bonus': 1,
                'general_advice': 'Vary protein sources for complete nutrition'
            }
        }
        
        # Nutritional priorities
        self.nutrition_priorities = {
            'high_fiber': ['whole grains', 'legumes', 'fruits', 'vegetables'],
            'high_protein': ['lean meats', 'fish', 'eggs', 'dairy', 'legumes'],
            'healthy_fats': ['nuts', 'avocado', 'olive oil', 'fish'],
            'low_sodium': ['fresh foods', 'herbs', 'spices'],
            'antioxidants': ['berries', 'dark leafy greens', 'colorful vegetables']
        }
    
    def get_healthy_alternative(self, item_name: str) -> Optional[Dict[str, any]]:
        """
        Get healthy alternative for a specific item
        """
        item_name = item_name.lower().strip()
        
        # Direct match
        if item_name in self.healthy_alternatives:
            alt_data = self.healthy_alternatives[item_name]
            return {
                'original_item': item_name,
                'alternatives': alt_data['alternatives'],
                'reason': alt_data['reason'],
                'health_score': alt_data['health_score'],
                'match_type': 'direct'
            }
        
        # Partial match
        for key, alt_data in self.healthy_alternatives.items():
            if key in item_name or item_name in key:
                return {
                    'original_item': item_name,
                    'alternatives': alt_data['alternatives'],
                    'reason': alt_data['reason'],
                    'health_score': alt_data['health_score'],
                    'match_type': 'partial'
                }
        
        return None
    
    def get_multiple_alternatives(self, items: List[str]) -> List[Dict[str, any]]:
        """
        Get healthy alternatives for multiple items
        """
        alternatives = []
        
        for item_name in items:
            alternative = self.get_healthy_alternative(item_name)
            if alternative:
                alternatives.append(alternative)
        
        return alternatives
    
    def suggest_healthier_shopping_list(self, shopping_list) -> List[Dict[str, any]]:
        """
        Analyze entire shopping list and suggest healthier alternatives
        """
        suggestions = []
        
        for item in shopping_list.items:
            alternative = self.get_healthy_alternative(item.name)
            
            if alternative:
                suggestions.append({
                    'original_item': item,
                    'recommendation': alternative,
                    'priority': self._calculate_priority(item, alternative)
                })
        
        # Sort by priority (health impact)
        suggestions.sort(key=lambda x: x['priority'], reverse=True)
        
        return suggestions
    
    def get_nutritional_recommendations(self, category: str) -> Dict[str, any]:
        """
        Get nutritional recommendations for a specific category
        """
        category = category.lower().strip()
        
        if category in self.category_recommendations:
            return self.category_recommendations[category]
        
        return {
            'organic_boost': 0,
            'seasonal_bonus': 0,
            'general_advice': 'Choose fresh, minimally processed options'
        }
    
    def suggest_nutrient_boosters(self, current_list) -> List[Dict[str, any]]:
        """
        Suggest items to boost nutritional value of current list
        """
        suggestions = []
        
        # Analyze what's missing nutritionally
        current_categories = set(item.category for item in current_list.items)
        current_items = set(item.name.lower() for item in current_list.items)
        
        # Check for nutritional gaps
        for nutrient, food_sources in self.nutrition_priorities.items():
            # Check if user has foods from this nutrient category
            has_nutrient_source = any(
                any(source in item for item in current_items) 
                for source in food_sources
            )
            
            if not has_nutrient_source:
                # Suggest top 2 sources for this nutrient
                for source in food_sources[:2]:
                    if not any(source in item for item in current_items):
                        suggestions.append({
                            'item': source,
                            'nutrient': nutrient,
                            'reason': f'Boost {nutrient.replace("_", " ")} intake',
                            'category': self._guess_category(source),
                            'priority': 7
                        })
        
        return suggestions[:5]  # Top 5 nutrient boosters
    
    def rate_shopping_list_healthiness(self, shopping_list) -> Dict[str, any]:
        """
        Rate the overall healthiness of a shopping list
        """
        if not shopping_list.items:
            return {'score': 0, 'message': 'Empty shopping list'}
        
        total_score = 0
        item_scores = []
        category_analysis = {}
        
        for item in shopping_list.items:
            item_score = self._rate_item_healthiness(item)
            item_scores.append({
                'item': item.name,
                'score': item_score,
                'category': item.category
            })
            total_score += item_score
            
            # Category analysis
            if item.category not in category_analysis:
                category_analysis[item.category] = {'count': 0, 'total_score': 0}
            category_analysis[item.category]['count'] += 1
            category_analysis[item.category]['total_score'] += item_score
        
        # Calculate average scores
        avg_score = total_score / len(item_scores)
        
        # Category averages
        for category in category_analysis:
            cat_data = category_analysis[category]
            cat_data['avg_score'] = cat_data['total_score'] / cat_data['count']
        
        return {
            'overall_score': round(avg_score, 1),
            'total_items': len(item_scores),
            'item_breakdown': item_scores,
            'category_analysis': category_analysis,
            'health_grade': self._get_health_grade(avg_score),
            'recommendations': self._get_score_recommendations(avg_score)
        }
    
    def _calculate_priority(self, item: GroceryItem, alternative: Dict[str, any]) -> int:
        """
        Calculate priority for suggesting an alternative
        """
        base_priority = alternative['health_score']
        
        # Boost priority for frequently purchased items
        # (This could be enhanced with purchase frequency data)
        
        # Boost priority for items with higher health impact
        if alternative['health_score'] >= 8:
            base_priority += 2
        
        return base_priority
    
    def _rate_item_healthiness(self, item: GroceryItem) -> int:
        """
        Rate individual item healthiness (1-10 scale)
        """
        base_score = 5  # Neutral score
        
        # Organic bonus
        if item.is_organic:
            base_score += 2
        
        # Category-based scoring
        category_scores = {
            'fruits': 8,
            'vegetables': 8,
            'whole grains': 7,
            'lean protein': 7,
            'dairy': 5,
            'snacks': 3,
            'processed': 2,
            'sweets': 2
        }
        
        item_name = item.name.lower()
        item_category = item.category.lower()
        
        # Check for healthy keywords
        healthy_keywords = ['whole', 'organic', 'fresh', 'lean', 'low-fat', 'natural']
        unhealthy_keywords = ['fried', 'processed', 'sugary', 'artificial', 'high-sodium']
        
        for keyword in healthy_keywords:
            if keyword in item_name:
                base_score += 1
                break
        
        for keyword in unhealthy_keywords:
            if keyword in item_name:
                base_score -= 2
                break
        
        # Category-based adjustment
        for category, score in category_scores.items():
            if category in item_category or category in item_name:
                base_score = max(base_score, score)
                break
        
        return max(1, min(10, base_score))  # Ensure score is between 1-10
    
    def _get_health_grade(self, score: float) -> str:
        """
        Convert numeric score to letter grade
        """
        if score >= 8:
            return 'A'
        elif score >= 7:
            return 'B'
        elif score >= 6:
            return 'C'
        elif score >= 5:
            return 'D'
        else:
            return 'F'
    
    def _get_score_recommendations(self, score: float) -> List[str]:
        """
        Get recommendations based on health score
        """
        if score >= 8:
            return ["Excellent food choices!", "Keep up the healthy eating."]
        elif score >= 7:
            return ["Good selections!", "Consider adding more fruits and vegetables."]
        elif score >= 6:
            return ["Room for improvement.", "Try swapping some processed items for whole foods."]
        elif score >= 5:
            return ["Consider healthier alternatives.", "Focus on fresh, unprocessed foods."]
        else:
            return ["Significant room for improvement.", "Consider major changes to eating habits."]
    
    def _guess_category(self, item_name: str) -> str:
        """
        Guess category for recommendation items
        """
        item_name = item_name.lower()
        
        categories = {
            'fruits': ['fruit', 'berry', 'apple', 'banana', 'orange'],
            'vegetables': ['vegetable', 'greens', 'carrot', 'broccoli', 'spinach'],
            'protein': ['meat', 'fish', 'chicken', 'egg', 'bean', 'legume'],
            'dairy': ['milk', 'cheese', 'yogurt'],
            'grains': ['grain', 'rice', 'bread', 'pasta', 'oat']
        }
        
        for category, keywords in categories.items():
            if any(keyword in item_name for keyword in keywords):
                return category
        
        return 'other'
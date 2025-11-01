from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from ..models.grocery_item import GroceryItem
from ..models.purchase_history import PurchaseHistory

class MealPlanningEngine:
    """
    Advanced meal planning system that suggests recipes and meal plans based on expiring items,
    dietary preferences, and nutritional goals
    """
    
    def __init__(self):
        # Recipe database with ingredients and instructions
        self.recipes = {
            # Quick meals for expiring items
            'vegetable_stir_fry': {
                'name': 'Quick Vegetable Stir Fry',
                'prep_time': 15,
                'cook_time': 10,
                'servings': 4,
                'ingredients': ['vegetables', 'garlic', 'soy sauce', 'oil', 'rice'],
                'instructions': [
                    'Heat oil in wok or large skillet',
                    'Add garlic and stir for 30 seconds',
                    'Add vegetables and stir-fry for 5-7 minutes',
                    'Add soy sauce and cook 2 more minutes',
                    'Serve over rice'
                ],
                'category': 'asian',
                'difficulty': 'easy',
                'nutrition': {'calories': 180, 'protein': 5, 'carbs': 35, 'fat': 3},
                'uses_expiring': ['vegetables', 'garlic']
            },
            'fruit_smoothie': {
                'name': 'Mixed Fruit Smoothie',
                'prep_time': 5,
                'cook_time': 0,
                'servings': 2,
                'ingredients': ['bananas', 'berries', 'yogurt', 'honey', 'milk'],
                'instructions': [
                    'Add all ingredients to blender',
                    'Blend until smooth',
                    'Add ice if desired consistency',
                    'Serve immediately'
                ],
                'category': 'breakfast',
                'difficulty': 'easy',
                'nutrition': {'calories': 150, 'protein': 8, 'carbs': 30, 'fat': 2},
                'uses_expiring': ['bananas', 'berries', 'yogurt']
            },
            'pasta_primavera': {
                'name': 'Pasta Primavera',
                'prep_time': 15,
                'cook_time': 20,
                'servings': 6,
                'ingredients': ['pasta', 'vegetables', 'garlic', 'olive oil', 'cheese', 'herbs'],
                'instructions': [
                    'Cook pasta according to package directions',
                    'Sauté vegetables and garlic in olive oil',
                    'Combine pasta with vegetables',
                    'Add cheese and fresh herbs',
                    'Toss and serve hot'
                ],
                'category': 'italian',
                'difficulty': 'medium',
                'nutrition': {'calories': 320, 'protein': 12, 'carbs': 55, 'fat': 8},
                'uses_expiring': ['vegetables', 'herbs', 'cheese']
            },
            'chicken_soup': {
                'name': 'Hearty Chicken Vegetable Soup',
                'prep_time': 20,
                'cook_time': 45,
                'servings': 8,
                'ingredients': ['chicken', 'vegetables', 'onions', 'broth', 'herbs', 'noodles'],
                'instructions': [
                    'Sauté onions until translucent',
                    'Add chicken and brown lightly',
                    'Add broth and bring to boil',
                    'Add vegetables and simmer 30 minutes',
                    'Add noodles and cook 10 minutes more',
                    'Season with herbs and serve'
                ],
                'category': 'comfort',
                'difficulty': 'medium',
                'nutrition': {'calories': 280, 'protein': 25, 'carbs': 20, 'fat': 8},
                'uses_expiring': ['chicken', 'vegetables', 'onions', 'herbs']
            },
            'banana_bread': {
                'name': 'Moist Banana Bread',
                'prep_time': 15,
                'cook_time': 60,
                'servings': 12,
                'ingredients': ['bananas', 'flour', 'eggs', 'butter', 'sugar', 'baking soda'],
                'instructions': [
                    'Preheat oven to 350°F',
                    'Mash ripe bananas in large bowl',
                    'Mix in eggs, melted butter, and sugar',
                    'Add flour and baking soda',
                    'Pour into greased loaf pan',
                    'Bake 60 minutes until golden'
                ],
                'category': 'baking',
                'difficulty': 'easy',
                'nutrition': {'calories': 180, 'protein': 3, 'carbs': 32, 'fat': 5},
                'uses_expiring': ['bananas']
            },
            'salad_medley': {
                'name': 'Fresh Garden Salad',
                'prep_time': 10,
                'cook_time': 0,
                'servings': 4,
                'ingredients': ['lettuce', 'tomatoes', 'cucumber', 'vegetables', 'dressing'],
                'instructions': [
                    'Wash and chop all vegetables',
                    'Combine in large salad bowl',
                    'Add dressing just before serving',
                    'Toss gently and serve'
                ],
                'category': 'salad',
                'difficulty': 'easy',
                'nutrition': {'calories': 50, 'protein': 2, 'carbs': 8, 'fat': 2},
                'uses_expiring': ['lettuce', 'tomatoes', 'cucumber', 'vegetables']
            }
        }
        
        # Meal categories and timing
        self.meal_categories = {
            'breakfast': ['fruit_smoothie', 'banana_bread'],
            'lunch': ['salad_medley', 'pasta_primavera', 'vegetable_stir_fry'],
            'dinner': ['chicken_soup', 'pasta_primavera', 'vegetable_stir_fry'],
            'snack': ['fruit_smoothie', 'banana_bread']
        }
        
        # Dietary preferences
        self.dietary_filters = {
            'vegetarian': ['vegetable_stir_fry', 'fruit_smoothie', 'pasta_primavera', 'banana_bread', 'salad_medley'],
            'quick_meals': ['fruit_smoothie', 'vegetable_stir_fry', 'salad_medley'],  # <= 15 min prep
            'batch_cooking': ['chicken_soup', 'pasta_primavera', 'banana_bread'],  # Good for leftovers
            'healthy': ['vegetable_stir_fry', 'fruit_smoothie', 'salad_medley', 'chicken_soup']
        }
    
    def suggest_recipes_for_expiring_items(self, expiring_items: List[GroceryItem]) -> List[Dict[str, any]]:
        """
        Suggest recipes that use expiring items
        """
        suggestions = []
        
        if not expiring_items:
            return suggestions
        
        # Get item names in lowercase for matching
        expiring_names = [item.name.lower() for item in expiring_items]
        
        for recipe_id, recipe in self.recipes.items():
            matching_ingredients = []
            
            # Check how many expiring items this recipe uses
            for expiring_item in expiring_names:
                for recipe_ingredient in recipe['uses_expiring']:
                    if (expiring_item in recipe_ingredient.lower() or 
                        recipe_ingredient.lower() in expiring_item or
                        self._ingredients_match(expiring_item, recipe_ingredient)):
                        matching_ingredients.append(expiring_item)
            
            if matching_ingredients:
                # Calculate urgency score based on expiration dates
                urgency_score = 0
                for item in expiring_items:
                    if item.name.lower() in matching_ingredients:
                        days_left = item.days_until_expiry
                        if days_left <= 0:
                            urgency_score += 10  # Expired items
                        elif days_left <= 1:
                            urgency_score += 7   # Expires today/tomorrow
                        elif days_left <= 3:
                            urgency_score += 5   # Expires in 2-3 days
                        else:
                            urgency_score += 2   # Expires within week
                
                suggestions.append({
                    'recipe_id': recipe_id,
                    'recipe': recipe,
                    'matching_ingredients': matching_ingredients,
                    'urgency_score': urgency_score,
                    'ingredients_used': len(matching_ingredients),
                    'recommendation_reason': f"Uses {len(matching_ingredients)} of your expiring items"
                })
        
        # Sort by urgency score and number of ingredients used
        suggestions.sort(key=lambda x: (x['urgency_score'], x['ingredients_used']), reverse=True)
        
        return suggestions[:8]  # Return top 8 suggestions
    
    def generate_weekly_meal_plan(self, available_items: List[GroceryItem], 
                                 expiring_items: List[GroceryItem],
                                 preferences: Dict[str, any] = None) -> Dict[str, any]:
        """
        Generate a complete weekly meal plan
        """
        if preferences is None:
            preferences = {'dietary_type': 'any', 'cooking_time': 'any', 'servings': 4}
        
        meal_plan = {
            'week_start': datetime.now().strftime('%Y-%m-%d'),
            'daily_meals': {},
            'shopping_additions': [],
            'prep_schedule': {},
            'nutritional_summary': {}
        }
        
        # Generate meals for 7 days
        for day in range(7):
            date = (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d')
            
            daily_meals = {
                'breakfast': None,
                'lunch': None,
                'dinner': None,
                'prep_time_total': 0,
                'cook_time_total': 0
            }
            
            # Prioritize expiring items for first few days
            priority_expiring = day <= 3
            
            # Select recipes for each meal
            for meal_type in ['breakfast', 'lunch', 'dinner']:
                recipe = self._select_recipe_for_meal(
                    meal_type, 
                    available_items, 
                    expiring_items if priority_expiring else [],
                    preferences,
                    used_recipes=self._get_used_recipes_this_week(meal_plan, day)
                )
                
                if recipe:
                    daily_meals[meal_type] = recipe
                    daily_meals['prep_time_total'] += recipe['prep_time']
                    daily_meals['cook_time_total'] += recipe['cook_time']
            
            meal_plan['daily_meals'][date] = daily_meals
        
        # Generate shopping list for missing ingredients
        meal_plan['shopping_additions'] = self._generate_shopping_additions(meal_plan, available_items)
        
        # Create meal prep schedule
        meal_plan['prep_schedule'] = self._create_prep_schedule(meal_plan)
        
        # Calculate nutritional summary
        meal_plan['nutritional_summary'] = self._calculate_weekly_nutrition(meal_plan)
        
        return meal_plan
    
    def suggest_meal_prep_batches(self, available_items: List[GroceryItem]) -> List[Dict[str, any]]:
        """
        Suggest batch cooking recipes for meal prep
        """
        batch_suggestions = []
        
        # Get batch-friendly recipes
        batch_recipes = [self.recipes[recipe_id] for recipe_id in self.dietary_filters['batch_cooking']]
        
        for recipe in batch_recipes:
            # Check if we have most ingredients
            available_names = [item.name.lower() for item in available_items]
            missing_ingredients = []
            
            for ingredient in recipe['ingredients']:
                if not any(ingredient.lower() in available.lower() or available.lower() in ingredient.lower() 
                          for available in available_names):
                    missing_ingredients.append(ingredient)
            
            # Only suggest if we have most ingredients (missing <= 2)
            if len(missing_ingredients) <= 2:
                # Calculate portions for meal prep
                servings = recipe['servings']
                prep_portions = max(2, servings // 2)  # At least 2 portions
                
                batch_suggestions.append({
                    'recipe': recipe,
                    'portions': prep_portions,
                    'total_servings': servings,
                    'missing_ingredients': missing_ingredients,
                    'prep_benefit': f"Makes {prep_portions} portions for the week",
                    'storage_tips': self._get_storage_tips(recipe['name']),
                    'reheating_instructions': self._get_reheating_instructions(recipe['name'])
                })
        
        return batch_suggestions
    
    def get_recipe_nutritional_analysis(self, recipe_id: str) -> Dict[str, any]:
        """
        Get detailed nutritional analysis for a recipe
        """
        if recipe_id not in self.recipes:
            return {}
        
        recipe = self.recipes[recipe_id]
        nutrition = recipe.get('nutrition', {})
        servings = recipe.get('servings', 1)
        
        return {
            'recipe_name': recipe['name'],
            'per_serving': nutrition,
            'total_recipe': {
                'calories': nutrition.get('calories', 0) * servings,
                'protein': nutrition.get('protein', 0) * servings,
                'carbs': nutrition.get('carbs', 0) * servings,
                'fat': nutrition.get('fat', 0) * servings
            },
            'health_rating': self._calculate_health_rating(nutrition),
            'dietary_tags': self._get_dietary_tags(recipe_id),
            'allergen_info': self._get_allergen_info(recipe)
        }
    
    def _ingredients_match(self, item1: str, item2: str) -> bool:
        """
        Check if two ingredient names are similar enough to match
        """
        # Simple keyword matching - could be enhanced with fuzzy matching
        keywords = {
            'vegetables': ['veggie', 'vegetable', 'carrot', 'broccoli', 'pepper', 'zucchini'],
            'herbs': ['basil', 'parsley', 'cilantro', 'thyme', 'oregano'],
            'berries': ['strawberry', 'blueberry', 'raspberry', 'blackberry'],
        }
        
        for category, items in keywords.items():
            if ((item1 in items or category in item1) and 
                (item2 in items or category in item2)):
                return True
        
        return False
    
    def _select_recipe_for_meal(self, meal_type: str, available_items: List[GroceryItem], 
                               expiring_items: List[GroceryItem], preferences: Dict[str, any],
                               used_recipes: List[str] = None) -> Optional[Dict[str, any]]:
        """
        Select appropriate recipe for specific meal type
        """
        if used_recipes is None:
            used_recipes = []
        
        # Get recipes for this meal type
        meal_recipes = self.meal_categories.get(meal_type, [])
        
        # Filter by dietary preferences
        dietary_type = preferences.get('dietary_type', 'any')
        if dietary_type in self.dietary_filters:
            meal_recipes = [r for r in meal_recipes if r in self.dietary_filters[dietary_type]]
        
        # Filter by cooking time preference
        cooking_time = preferences.get('cooking_time', 'any')
        if cooking_time == 'quick':
            meal_recipes = [r for r in meal_recipes if r in self.dietary_filters['quick_meals']]
        
        # Remove already used recipes to add variety
        meal_recipes = [r for r in meal_recipes if r not in used_recipes]
        
        if not meal_recipes:
            return None
        
        # Score recipes based on available and expiring ingredients
        recipe_scores = []
        for recipe_id in meal_recipes:
            recipe = self.recipes[recipe_id]
            score = self._score_recipe(recipe, available_items, expiring_items)
            recipe_scores.append((recipe_id, recipe, score))
        
        # Sort by score and return best match
        recipe_scores.sort(key=lambda x: x[2], reverse=True)
        
        if recipe_scores:
            return recipe_scores[0][1]
        
        return None
    
    def _score_recipe(self, recipe: Dict[str, any], available_items: List[GroceryItem], 
                     expiring_items: List[GroceryItem]) -> int:
        """
        Score recipe based on ingredient availability and expiring items
        """
        score = 0
        available_names = [item.name.lower() for item in available_items]
        expiring_names = [item.name.lower() for item in expiring_items]
        
        # Points for available ingredients
        for ingredient in recipe['ingredients']:
            if any(ingredient.lower() in available.lower() for available in available_names):
                score += 2
        
        # Bonus points for using expiring ingredients
        for ingredient in recipe.get('uses_expiring', []):
            if any(ingredient.lower() in expiring.lower() for expiring in expiring_names):
                score += 5
        
        return score
    
    def _get_used_recipes_this_week(self, meal_plan: Dict[str, any], current_day: int) -> List[str]:
        """
        Get list of recipes already used this week
        """
        used_recipes = []
        for day_offset in range(current_day):
            date = (datetime.now() + timedelta(days=day_offset)).strftime('%Y-%m-%d')
            if date in meal_plan['daily_meals']:
                day_meals = meal_plan['daily_meals'][date]
                for meal_type in ['breakfast', 'lunch', 'dinner']:
                    if day_meals.get(meal_type):
                        # Find recipe ID by name (this could be improved)
                        recipe_name = day_meals[meal_type]['name']
                        for recipe_id, recipe in self.recipes.items():
                            if recipe['name'] == recipe_name:
                                used_recipes.append(recipe_id)
                                break
        return used_recipes
    
    def _generate_shopping_additions(self, meal_plan: Dict[str, any], 
                                   available_items: List[GroceryItem]) -> List[Dict[str, any]]:
        """
        Generate shopping list for ingredients needed for meal plan
        """
        needed_ingredients = {}
        available_names = [item.name.lower() for item in available_items]
        
        # Collect all ingredients from meal plan
        for date, daily_meals in meal_plan['daily_meals'].items():
            for meal_type, recipe in daily_meals.items():
                if recipe and isinstance(recipe, dict) and 'ingredients' in recipe:
                    for ingredient in recipe['ingredients']:
                        # Check if we already have this ingredient
                        if not any(ingredient.lower() in available.lower() for available in available_names):
                            if ingredient not in needed_ingredients:
                                needed_ingredients[ingredient] = {
                                    'ingredient': ingredient,
                                    'needed_for': [],
                                    'quantity': 1,
                                    'category': self._categorize_ingredient(ingredient)
                                }
                            needed_ingredients[ingredient]['needed_for'].append(f"{recipe['name']} ({date})")
        
        return list(needed_ingredients.values())
    
    def _create_prep_schedule(self, meal_plan: Dict[str, any]) -> Dict[str, any]:
        """
        Create optimal meal prep schedule
        """
        prep_schedule = {
            'batch_prep_day': 'Sunday',
            'daily_prep_times': {},
            'batch_recipes': [],
            'make_ahead_items': []
        }
        
        # Analyze recipes for batch prep opportunities
        all_recipes = []
        for date, daily_meals in meal_plan['daily_meals'].items():
            for meal_type, recipe in daily_meals.items():
                if recipe and isinstance(recipe, dict):
                    all_recipes.append((recipe, date, meal_type))
        
        # Group similar recipes or batch-friendly ones
        for recipe, date, meal_type in all_recipes:
            if recipe.get('servings', 0) > 4:  # Good for batch cooking
                prep_schedule['batch_recipes'].append({
                    'recipe': recipe['name'],
                    'prep_day': 'Sunday',
                    'serves_meals': [(date, meal_type)],
                    'storage_days': 3
                })
        
        return prep_schedule
    
    def _calculate_weekly_nutrition(self, meal_plan: Dict[str, any]) -> Dict[str, any]:
        """
        Calculate nutritional summary for the week
        """
        total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        daily_averages = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        
        days_counted = 0
        for date, daily_meals in meal_plan['daily_meals'].items():
            daily_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
            
            for meal_type, recipe in daily_meals.items():
                if recipe and isinstance(recipe, dict) and 'nutrition' in recipe:
                    nutrition = recipe['nutrition']
                    for nutrient in ['calories', 'protein', 'carbs', 'fat']:
                        daily_nutrition[nutrient] += nutrition.get(nutrient, 0)
                        total_nutrition[nutrient] += nutrition.get(nutrient, 0)
            
            if daily_nutrition['calories'] > 0:
                days_counted += 1
        
        # Calculate averages
        if days_counted > 0:
            for nutrient in daily_averages:
                daily_averages[nutrient] = round(total_nutrition[nutrient] / days_counted, 1)
        
        return {
            'weekly_totals': total_nutrition,
            'daily_averages': daily_averages,
            'health_score': self._calculate_weekly_health_score(daily_averages),
            'recommendations': self._get_nutritional_recommendations(daily_averages)
        }
    
    def _get_storage_tips(self, recipe_name: str) -> str:
        """
        Get storage tips for recipe
        """
        storage_tips = {
            'soup': 'Store in refrigerator up to 4 days or freeze up to 3 months',
            'pasta': 'Refrigerate up to 3 days. Add fresh herbs when reheating',
            'bread': 'Wrap tightly and store at room temperature up to 3 days',
            'stir_fry': 'Best eaten fresh, but can be refrigerated up to 2 days',
            'smoothie': 'Best consumed immediately. Can prep ingredients ahead',
            'salad': 'Store dressing separately. Consume within 1 day'
        }
        
        recipe_lower = recipe_name.lower()
        for key, tip in storage_tips.items():
            if key in recipe_lower:
                return tip
        
        return 'Store in refrigerator up to 3 days'
    
    def _get_reheating_instructions(self, recipe_name: str) -> str:
        """
        Get reheating instructions for recipe
        """
        reheating_instructions = {
            'soup': 'Reheat on stovetop over medium heat, stirring occasionally',
            'pasta': 'Reheat in microwave with splash of water or in skillet with oil',
            'bread': 'Toast slices or warm in 300°F oven for 5 minutes',
            'stir_fry': 'Reheat quickly in skillet over high heat',
            'smoothie': 'Not recommended - best consumed fresh',
            'salad': 'Not recommended for reheating'
        }
        
        recipe_lower = recipe_name.lower()
        for key, instruction in reheating_instructions.items():
            if key in recipe_lower:
                return instruction
        
        return 'Reheat in microwave or on stovetop until heated through'
    
    def _calculate_health_rating(self, nutrition: Dict[str, any]) -> str:
        """
        Calculate health rating for recipe based on nutrition
        """
        calories = nutrition.get('calories', 0)
        protein = nutrition.get('protein', 0)
        
        if calories == 0:
            return 'No data'
        
        # Simple health rating based on calorie density and protein content
        protein_percentage = (protein * 4) / calories * 100  # 4 calories per gram protein
        
        if calories < 200 and protein_percentage > 20:
            return 'Excellent'
        elif calories < 300 and protein_percentage > 15:
            return 'Very Good'
        elif calories < 400 and protein_percentage > 10:
            return 'Good'
        elif calories < 500:
            return 'Moderate'
        else:
            return 'High Calorie'
    
    def _get_dietary_tags(self, recipe_id: str) -> List[str]:
        """
        Get dietary tags for recipe
        """
        tags = []
        for tag, recipes in self.dietary_filters.items():
            if recipe_id in recipes:
                tags.append(tag.replace('_', ' ').title())
        return tags
    
    def _get_allergen_info(self, recipe: Dict[str, any]) -> List[str]:
        """
        Get allergen information for recipe
        """
        allergens = []
        ingredients = recipe.get('ingredients', [])
        
        allergen_map = {
            'dairy': ['milk', 'cheese', 'butter', 'yogurt'],
            'gluten': ['flour', 'pasta', 'bread', 'noodles'],
            'eggs': ['eggs'],
            'nuts': ['nuts', 'almonds', 'walnuts']
        }
        
        for allergen, trigger_ingredients in allergen_map.items():
            if any(trigger in ingredient.lower() for ingredient in ingredients 
                   for trigger in trigger_ingredients):
                allergens.append(allergen.title())
        
        return allergens
    
    def _categorize_ingredient(self, ingredient: str) -> str:
        """
        Categorize ingredient for shopping list organization
        """
        categories = {
            'produce': ['vegetables', 'fruits', 'herbs', 'garlic', 'onions', 'tomatoes', 'lettuce'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'eggs'],
            'pantry': ['rice', 'pasta', 'flour', 'oil', 'soy sauce', 'honey', 'sugar'],
            'meat': ['chicken', 'beef', 'fish'],
            'frozen': ['frozen'],
            'bakery': ['bread', 'noodles']
        }
        
        ingredient_lower = ingredient.lower()
        for category, items in categories.items():
            if any(item in ingredient_lower for item in items):
                return category
        
        return 'other'
    
    def _calculate_weekly_health_score(self, daily_averages: Dict[str, any]) -> int:
        """
        Calculate overall health score for weekly meal plan
        """
        calories = daily_averages.get('calories', 0)
        protein = daily_averages.get('protein', 0)
        
        if calories == 0:
            return 0
        
        # Target daily values
        target_calories = 2000
        target_protein = 50
        
        # Calculate score based on balance
        calorie_score = min(100, (target_calories / max(calories, 1)) * 100) if calories > target_calories else 100
        protein_score = min(100, (protein / target_protein) * 100)
        
        # Average the scores
        overall_score = int((calorie_score + protein_score) / 2)
        
        return max(0, min(100, overall_score))
    
    def _get_nutritional_recommendations(self, daily_averages: Dict[str, any]) -> List[str]:
        """
        Get nutritional recommendations based on daily averages
        """
        recommendations = []
        
        calories = daily_averages.get('calories', 0)
        protein = daily_averages.get('protein', 0)
        
        if calories < 1500:
            recommendations.append('Consider adding more calorie-dense healthy foods like nuts and avocados')
        elif calories > 2500:
            recommendations.append('Consider smaller portions or lighter meal options')
        
        if protein < 40:
            recommendations.append('Add more protein sources like lean meats, eggs, or legumes')
        
        if not recommendations:
            recommendations.append('Great nutritional balance! Keep up the good work.')
        
        return recommendations
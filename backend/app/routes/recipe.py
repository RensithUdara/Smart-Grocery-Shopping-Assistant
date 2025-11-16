"""
Smart Recipe Integration API Routes
Provides endpoints for recipe recommendations, meal planning, and cooking optimization
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback

# Import the recipe engine
try:
    from src.engines.recipe_engine import RecipeEngine
except ImportError:
    from backend.src.engines.recipe_engine import RecipeEngine

# Create blueprint
recipe_bp = Blueprint('recipe', __name__)

# Initialize recipe engine
recipe_engine = RecipeEngine()

@recipe_bp.route('/api/recipe/search', methods=['GET'])
def search_recipes():
    """Search recipes by query and filters"""
    try:
        query = request.args.get('query', '')
        
        # Parse filters
        filters = {}
        if request.args.get('max_prep_time'):
            filters['max_prep_time'] = int(request.args.get('max_prep_time'))
        if request.args.get('max_cook_time'):
            filters['max_cook_time'] = int(request.args.get('max_cook_time'))
        if request.args.get('difficulty'):
            filters['difficulty'] = request.args.get('difficulty').split(',')
        if request.args.get('cuisine_type'):
            filters['cuisine_type'] = request.args.get('cuisine_type').split(',')
        if request.args.get('dietary_tags'):
            filters['dietary_tags'] = request.args.get('dietary_tags').split(',')
        
        results = recipe_engine.search_recipes(query, filters)
        
        # Convert Recipe objects to dictionaries
        formatted_results = []
        for result in results:
            recipe_dict = {
                'id': result['recipe'].id,
                'name': result['recipe'].name,
                'description': result['recipe'].description,
                'prep_time': result['recipe'].prep_time,
                'cook_time': result['recipe'].cook_time,
                'servings': result['recipe'].servings,
                'difficulty': result['recipe'].difficulty,
                'cuisine_type': result['recipe'].cuisine_type,
                'dietary_tags': result['recipe'].dietary_tags,
                'nutrition': result['recipe'].nutrition,
                'rating': result['recipe'].rating,
                'image_url': result['recipe'].image_url,
                'relevance_score': result['relevance_score']
            }
            formatted_results.append(recipe_dict)
        
        return jsonify({
            'success': True,
            'recipes': formatted_results,
            'count': len(formatted_results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/recommendations', methods=['GET'])
def get_recipe_recommendations():
    """Get personalized recipe recommendations"""
    try:
        # Get user preferences from query parameters or use defaults
        preferences = {}
        
        if request.args.get('preferred_cuisines'):
            preferences['preferred_cuisines'] = request.args.get('preferred_cuisines').split(',')
        if request.args.get('max_prep_time'):
            preferences['max_prep_time'] = int(request.args.get('max_prep_time'))
        if request.args.get('max_cook_time'):
            preferences['max_cook_time'] = int(request.args.get('max_cook_time'))
        if request.args.get('preferred_difficulty'):
            preferences['preferred_difficulty'] = request.args.get('preferred_difficulty').split(',')
        if request.args.get('favorite_ingredients'):
            preferences['favorite_ingredients'] = request.args.get('favorite_ingredients').split(',')
        if request.args.get('disliked_ingredients'):
            preferences['disliked_ingredients'] = request.args.get('disliked_ingredients').split(',')
        
        recommendations = recipe_engine.get_recipe_recommendations(preferences if preferences else None)
        
        # Convert Recipe objects to dictionaries
        formatted_recommendations = []
        for rec in recommendations:
            recipe_dict = {
                'id': rec['recipe'].id,
                'name': rec['recipe'].name,
                'description': rec['recipe'].description,
                'ingredients': rec['recipe'].ingredients,
                'instructions': rec['recipe'].instructions,
                'prep_time': rec['recipe'].prep_time,
                'cook_time': rec['recipe'].cook_time,
                'servings': rec['recipe'].servings,
                'difficulty': rec['recipe'].difficulty,
                'cuisine_type': rec['recipe'].cuisine_type,
                'dietary_tags': rec['recipe'].dietary_tags,
                'nutrition': rec['recipe'].nutrition,
                'rating': rec['recipe'].rating,
                'image_url': rec['recipe'].image_url,
                'recommendation_score': rec['recommendation_score'],
                'score_factors': rec['score_factors'],
                'dietary_compatible': rec['dietary_compatible']
            }
            formatted_recommendations.append(recipe_dict)
        
        return jsonify({
            'success': True,
            'recommendations': formatted_recommendations,
            'count': len(formatted_recommendations)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/by-ingredients', methods=['POST'])
def find_recipes_by_ingredients():
    """Find recipes based on available ingredients"""
    try:
        data = request.get_json()
        
        if not data or 'ingredients' not in data:
            return jsonify({
                'success': False,
                'error': 'ingredients list is required'
            }), 400
        
        available_ingredients = data['ingredients']
        match_threshold = data.get('match_threshold', 0.6)
        
        matches = recipe_engine.find_recipes_by_ingredients(available_ingredients, match_threshold)
        
        # Convert Recipe objects to dictionaries
        formatted_matches = []
        for match in matches:
            recipe_dict = {
                'id': match['recipe'].id,
                'name': match['recipe'].name,
                'description': match['recipe'].description,
                'ingredients': match['recipe'].ingredients,
                'instructions': match['recipe'].instructions,
                'prep_time': match['recipe'].prep_time,
                'cook_time': match['recipe'].cook_time,
                'servings': match['recipe'].servings,
                'difficulty': match['recipe'].difficulty,
                'cuisine_type': match['recipe'].cuisine_type,
                'dietary_tags': match['recipe'].dietary_tags,
                'nutrition': match['recipe'].nutrition,
                'rating': match['recipe'].rating,
                'image_url': match['recipe'].image_url,
                'match_score': match['match_score'],
                'missing_ingredients': match['missing_ingredients'],
                'missing_count': match['missing_count']
            }
            formatted_matches.append(recipe_dict)
        
        return jsonify({
            'success': True,
            'matches': formatted_matches,
            'count': len(formatted_matches),
            'query': {
                'ingredients': available_ingredients,
                'match_threshold': match_threshold
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/cooking-time-optimization', methods=['POST'])
def optimize_cooking_time():
    """Optimize cooking schedule for multiple recipes"""
    try:
        data = request.get_json()
        
        if not data or 'recipe_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'recipe_ids list is required'
            }), 400
        
        recipe_ids = data['recipe_ids']
        
        optimization = recipe_engine.optimize_cooking_time(recipe_ids)
        
        return jsonify({
            'success': True,
            'optimization': optimization
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/substitutions', methods=['POST'])
def get_ingredient_substitutions():
    """Get ingredient substitution suggestions"""
    try:
        data = request.get_json()
        
        if not data or 'recipe_id' not in data or 'unavailable_ingredients' not in data:
            return jsonify({
                'success': False,
                'error': 'recipe_id and unavailable_ingredients are required'
            }), 400
        
        recipe_id = data['recipe_id']
        unavailable_ingredients = data['unavailable_ingredients']
        
        substitutions = recipe_engine.suggest_ingredient_substitutions(recipe_id, unavailable_ingredients)
        
        return jsonify({
            'success': True,
            'substitutions': substitutions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/meal-plan', methods=['POST'])
def generate_meal_plan():
    """Generate a meal plan"""
    try:
        data = request.get_json() if request.get_json() else {}
        
        days = data.get('days', 7)
        dietary_preferences = data.get('dietary_preferences', [])
        
        meal_plans = recipe_engine.generate_meal_plan(days, dietary_preferences)
        
        # Convert MealPlan objects to dictionaries
        formatted_meal_plans = []
        for meal_plan in meal_plans:
            meal_dict = {
                'date': meal_plan.date,
                'breakfast': {
                    'id': meal_plan.breakfast.id,
                    'name': meal_plan.breakfast.name,
                    'prep_time': meal_plan.breakfast.prep_time,
                    'cook_time': meal_plan.breakfast.cook_time,
                    'nutrition': meal_plan.breakfast.nutrition
                } if meal_plan.breakfast else None,
                'lunch': {
                    'id': meal_plan.lunch.id,
                    'name': meal_plan.lunch.name,
                    'prep_time': meal_plan.lunch.prep_time,
                    'cook_time': meal_plan.lunch.cook_time,
                    'nutrition': meal_plan.lunch.nutrition
                } if meal_plan.lunch else None,
                'dinner': {
                    'id': meal_plan.dinner.id,
                    'name': meal_plan.dinner.name,
                    'prep_time': meal_plan.dinner.prep_time,
                    'cook_time': meal_plan.dinner.cook_time,
                    'nutrition': meal_plan.dinner.nutrition
                } if meal_plan.dinner else None,
                'snack': meal_plan.snack,  # Currently None
                'total_nutrition': meal_plan.total_nutrition,
                'estimated_cost': meal_plan.estimated_cost
            }
            formatted_meal_plans.append(meal_dict)
        
        return jsonify({
            'success': True,
            'meal_plans': formatted_meal_plans,
            'days': days,
            'dietary_preferences': dietary_preferences
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/nutrition-analysis/<recipe_id>', methods=['GET'])
def get_nutrition_analysis(recipe_id):
    """Get detailed nutrition analysis for a recipe"""
    try:
        analysis = recipe_engine.get_recipe_nutrition_analysis(recipe_id)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/details/<recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    """Get detailed recipe information"""
    try:
        recipe = None
        for r in recipe_engine.recipes:
            if r.id == recipe_id:
                recipe = r
                break
        
        if not recipe:
            return jsonify({
                'success': False,
                'error': 'Recipe not found'
            }), 404
        
        recipe_dict = {
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'ingredients': recipe.ingredients,
            'instructions': recipe.instructions,
            'prep_time': recipe.prep_time,
            'cook_time': recipe.cook_time,
            'servings': recipe.servings,
            'difficulty': recipe.difficulty,
            'cuisine_type': recipe.cuisine_type,
            'dietary_tags': recipe.dietary_tags,
            'nutrition': recipe.nutrition,
            'rating': recipe.rating,
            'image_url': recipe.image_url
        }
        
        return jsonify({
            'success': True,
            'recipe': recipe_dict
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/categories', methods=['GET'])
def get_recipe_categories():
    """Get available recipe categories and filters"""
    try:
        # Extract unique values from all recipes
        cuisines = list(set(recipe.cuisine_type for recipe in recipe_engine.recipes))
        difficulties = list(set(recipe.difficulty for recipe in recipe_engine.recipes))
        dietary_tags = list(set(tag for recipe in recipe_engine.recipes for tag in recipe.dietary_tags))
        
        # Get time ranges
        prep_times = [recipe.prep_time for recipe in recipe_engine.recipes]
        cook_times = [recipe.cook_time for recipe in recipe_engine.recipes]
        
        categories = {
            'cuisines': sorted(cuisines),
            'difficulties': sorted(difficulties),
            'dietary_tags': sorted(dietary_tags),
            'prep_time_range': {
                'min': min(prep_times),
                'max': max(prep_times)
            },
            'cook_time_range': {
                'min': min(cook_times),
                'max': max(cook_times)
            },
            'total_recipes': len(recipe_engine.recipes)
        }
        
        return jsonify({
            'success': True,
            'categories': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/shopping-list/<recipe_id>', methods=['GET'])
def generate_shopping_list_for_recipe(recipe_id):
    """Generate shopping list for a specific recipe"""
    try:
        recipe = None
        for r in recipe_engine.recipes:
            if r.id == recipe_id:
                recipe = r
                break
        
        if not recipe:
            return jsonify({
                'success': False,
                'error': 'Recipe not found'
            }), 404
        
        # Convert recipe ingredients to shopping list format
        shopping_list = []
        total_estimated_cost = 0.0
        
        for ingredient in recipe.ingredients:
            # Simple cost estimation (this could be enhanced with real pricing data)
            estimated_cost = 2.0 if not ingredient['optional'] else 1.0
            total_estimated_cost += estimated_cost
            
            shopping_list.append({
                'item': ingredient['item'],
                'amount': ingredient['amount'],
                'unit': ingredient['unit'],
                'optional': ingredient['optional'],
                'estimated_cost': f"Rs.{estimated_cost:.2f}",
                'category': 'ingredient'  # Could be enhanced with proper categorization
            })
        
        return jsonify({
            'success': True,
            'recipe_id': recipe_id,
            'recipe_name': recipe.name,
            'shopping_list': shopping_list,
            'total_items': len(shopping_list),
            'required_items': len([item for item in shopping_list if not item['optional']]),
            'optional_items': len([item for item in shopping_list if item['optional']]),
            'total_estimated_cost': f"Rs.{total_estimated_cost:.2f}"
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@recipe_bp.route('/api/recipe/random', methods=['GET'])
def get_random_recipes():
    """Get random recipe suggestions"""
    try:
        import random
        
        count = int(request.args.get('count', 5))
        dietary_filter = request.args.get('dietary_tags', '').split(',') if request.args.get('dietary_tags') else []
        
        # Filter recipes by dietary requirements if specified
        available_recipes = recipe_engine.recipes
        if dietary_filter and dietary_filter != ['']:
            available_recipes = [
                recipe for recipe in recipe_engine.recipes
                if any(tag in recipe.dietary_tags for tag in dietary_filter)
            ]
        
        # Select random recipes
        selected_recipes = random.sample(available_recipes, min(count, len(available_recipes)))
        
        # Convert to dictionaries
        formatted_recipes = []
        for recipe in selected_recipes:
            recipe_dict = {
                'id': recipe.id,
                'name': recipe.name,
                'description': recipe.description,
                'prep_time': recipe.prep_time,
                'cook_time': recipe.cook_time,
                'servings': recipe.servings,
                'difficulty': recipe.difficulty,
                'cuisine_type': recipe.cuisine_type,
                'dietary_tags': recipe.dietary_tags,
                'nutrition': recipe.nutrition,
                'rating': recipe.rating,
                'image_url': recipe.image_url
            }
            formatted_recipes.append(recipe_dict)
        
        return jsonify({
            'success': True,
            'recipes': formatted_recipes,
            'count': len(formatted_recipes),
            'filters_applied': {
                'dietary_tags': dietary_filter if dietary_filter != [''] else []
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
from flask import Blueprint, request, jsonify
import sys
import os
from datetime import datetime

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.meal_planning_engine import MealPlanningEngine
from src.utils.expiration_tracker import ExpirationTracker
from src.utils.data_manager import DataManager

meal_planning_bp = Blueprint('meal_planning', __name__)
data_manager = DataManager()
meal_planner = MealPlanningEngine()
expiration_tracker = ExpirationTracker()

@meal_planning_bp.route('/meal-planning/suggestions', methods=['GET'])
def get_recipe_suggestions():
    """Get recipe suggestions based on expiring items"""
    history = data_manager.load_purchase_history()
    
    # Get expiring items
    expiring_items_dict = expiration_tracker.check_expiring_items(history, 7)
    all_expiring = []
    for items in expiring_items_dict.values():
        all_expiring.extend(items)
    
    suggestions = meal_planner.suggest_recipes_for_expiring_items(all_expiring)
    
    # Convert to JSON-serializable format
    json_suggestions = []
    for suggestion in suggestions:
        json_suggestion = {
            'recipe_id': suggestion['recipe_id'],
            'recipe_name': suggestion['recipe']['name'],
            'prep_time': suggestion['recipe']['prep_time'],
            'cook_time': suggestion['recipe']['cook_time'],
            'servings': suggestion['recipe']['servings'],
            'ingredients': suggestion['recipe']['ingredients'],
            'instructions': suggestion['recipe']['instructions'],
            'category': suggestion['recipe']['category'],
            'difficulty': suggestion['recipe']['difficulty'],
            'nutrition': suggestion['recipe']['nutrition'],
            'matching_ingredients': suggestion['matching_ingredients'],
            'urgency_score': suggestion['urgency_score'],
            'ingredients_used': suggestion['ingredients_used'],
            'recommendation_reason': suggestion['recommendation_reason']
        }
        json_suggestions.append(json_suggestion)
    
    return jsonify(json_suggestions)

@meal_planning_bp.route('/meal-planning/weekly-plan', methods=['POST'])
def generate_weekly_meal_plan():
    """Generate weekly meal plan"""
    data = request.get_json() or {}
    preferences = {
        'dietary_type': data.get('dietary_type', 'any'),
        'cooking_time': data.get('cooking_time', 'any'),
        'servings': data.get('servings', 4)
    }
    
    # Get available and expiring items
    shopping_list = data_manager.load_shopping_list()
    history = data_manager.load_purchase_history()
    
    available_items = shopping_list.items
    expiring_items_dict = expiration_tracker.check_expiring_items(history, 7)
    all_expiring = []
    for items in expiring_items_dict.values():
        all_expiring.extend(items)
    
    meal_plan = meal_planner.generate_weekly_meal_plan(
        available_items, 
        all_expiring, 
        preferences
    )
    
    return jsonify(meal_plan)

@meal_planning_bp.route('/meal-planning/batch-suggestions', methods=['GET'])
def get_batch_cooking_suggestions():
    """Get batch cooking suggestions for meal prep"""
    shopping_list = data_manager.load_shopping_list()
    available_items = shopping_list.items
    
    batch_suggestions = meal_planner.suggest_meal_prep_batches(available_items)
    
    return jsonify(batch_suggestions)

@meal_planning_bp.route('/meal-planning/recipe/<recipe_id>/nutrition', methods=['GET'])
def get_recipe_nutrition(recipe_id):
    """Get detailed nutritional analysis for a recipe"""
    analysis = meal_planner.get_recipe_nutritional_analysis(recipe_id)
    
    if not analysis:
        return jsonify({'error': 'Recipe not found'}), 404
    
    return jsonify(analysis)

@meal_planning_bp.route('/meal-planning/recipes', methods=['GET'])
def get_all_recipes():
    """Get all available recipes with optional filtering"""
    category = request.args.get('category')
    dietary_type = request.args.get('dietary_type')
    difficulty = request.args.get('difficulty')
    max_prep_time = request.args.get('max_prep_time', type=int)
    
    recipes = []
    for recipe_id, recipe in meal_planner.recipes.items():
        # Apply filters
        if category and recipe.get('category') != category:
            continue
        if difficulty and recipe.get('difficulty') != difficulty:
            continue
        if max_prep_time and recipe.get('prep_time', 0) > max_prep_time:
            continue
        if dietary_type and dietary_type in meal_planner.dietary_filters:
            if recipe_id not in meal_planner.dietary_filters[dietary_type]:
                continue
        
        recipe_data = {
            'recipe_id': recipe_id,
            'name': recipe['name'],
            'prep_time': recipe['prep_time'],
            'cook_time': recipe['cook_time'],
            'servings': recipe['servings'],
            'category': recipe['category'],
            'difficulty': recipe['difficulty'],
            'nutrition': recipe['nutrition'],
            'ingredients': recipe['ingredients'],
            'instructions': recipe['instructions']
        }
        
        recipes.append(recipe_data)
    
    return jsonify(recipes)

@meal_planning_bp.route('/meal-planning/ingredients-check', methods=['POST'])
def check_recipe_ingredients():
    """Check what ingredients are needed for a specific recipe"""
    data = request.get_json()
    recipe_id = data.get('recipe_id')
    
    if recipe_id not in meal_planner.recipes:
        return jsonify({'error': 'Recipe not found'}), 404
    
    recipe = meal_planner.recipes[recipe_id]
    shopping_list = data_manager.load_shopping_list()
    available_items = [item.name.lower() for item in shopping_list.items]
    
    ingredients_status = []
    missing_ingredients = []
    
    for ingredient in recipe['ingredients']:
        have_ingredient = any(
            ingredient.lower() in available.lower() or available.lower() in ingredient.lower()
            for available in available_items
        )
        
        ingredients_status.append({
            'ingredient': ingredient,
            'available': have_ingredient,
            'category': meal_planner._categorize_ingredient(ingredient)
        })
        
        if not have_ingredient:
            missing_ingredients.append({
                'ingredient': ingredient,
                'category': meal_planner._categorize_ingredient(ingredient)
            })
    
    return jsonify({
        'recipe_name': recipe['name'],
        'ingredients_status': ingredients_status,
        'missing_ingredients': missing_ingredients,
        'can_make': len(missing_ingredients) == 0,
        'missing_count': len(missing_ingredients)
    })

@meal_planning_bp.route('/meal-planning/shopping-list-from-plan', methods=['POST'])
def generate_shopping_list_from_meal_plan():
    """Generate shopping list additions from a meal plan"""
    data = request.get_json()
    selected_recipes = data.get('selected_recipes', [])
    
    if not selected_recipes:
        return jsonify({'error': 'No recipes selected'}), 400
    
    shopping_list = data_manager.load_shopping_list()
    available_items = [item.name.lower() for item in shopping_list.items]
    
    needed_ingredients = {}
    
    for recipe_id in selected_recipes:
        if recipe_id not in meal_planner.recipes:
            continue
        
        recipe = meal_planner.recipes[recipe_id]
        
        for ingredient in recipe['ingredients']:
            # Check if we already have this ingredient
            have_ingredient = any(
                ingredient.lower() in available.lower() or available.lower() in ingredient.lower()
                for available in available_items
            )
            
            if not have_ingredient:
                if ingredient not in needed_ingredients:
                    needed_ingredients[ingredient] = {
                        'ingredient': ingredient,
                        'category': meal_planner._categorize_ingredient(ingredient),
                        'needed_for_recipes': [],
                        'quantity_estimate': 1
                    }
                needed_ingredients[ingredient]['needed_for_recipes'].append(recipe['name'])
    
    shopping_additions = list(needed_ingredients.values())
    
    return jsonify({
        'shopping_additions': shopping_additions,
        'total_items': len(shopping_additions),
        'categories': list(set(item['category'] for item in shopping_additions))
    })

@meal_planning_bp.route('/meal-planning/save-favorite-recipe', methods=['POST'])
def save_favorite_recipe():
    """Save a recipe as favorite (placeholder - would need user system)"""
    data = request.get_json()
    recipe_id = data.get('recipe_id')
    
    if recipe_id not in meal_planner.recipes:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # For now, just return success. In a real app, this would save to user preferences
    return jsonify({
        'message': 'Recipe saved as favorite',
        'recipe_id': recipe_id,
        'recipe_name': meal_planner.recipes[recipe_id]['name']
    })

@meal_planning_bp.route('/meal-planning/dietary-options', methods=['GET'])
def get_dietary_options():
    """Get available dietary filter options"""
    return jsonify({
        'dietary_types': list(meal_planner.dietary_filters.keys()),
        'categories': list(set(recipe['category'] for recipe in meal_planner.recipes.values())),
        'difficulties': list(set(recipe['difficulty'] for recipe in meal_planner.recipes.values())),
        'cooking_times': ['quick', 'medium', 'long'],
        'meal_types': list(meal_planner.meal_categories.keys())
    })
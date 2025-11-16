"""
Smart Recipe Integration Engine
Provides recipe recommendations, meal planning, and cooking optimization
"""

import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Recipe:
    """Recipe data structure"""
    id: str
    name: str
    description: str
    ingredients: List[Dict[str, Any]]  # [{"item": "tomato", "amount": 2, "unit": "pieces", "optional": False}]
    instructions: List[str]
    prep_time: int  # minutes
    cook_time: int  # minutes
    servings: int
    difficulty: str  # "easy", "medium", "hard"
    cuisine_type: str  # "italian", "asian", "american", etc.
    dietary_tags: List[str]  # ["vegetarian", "vegan", "gluten-free", etc.]
    nutrition: Dict[str, float]  # calories, protein, carbs, fat, etc.
    rating: float
    image_url: str

@dataclass
class MealPlan:
    """Meal plan data structure"""
    date: str
    breakfast: Optional[Recipe]
    lunch: Optional[Recipe]
    dinner: Optional[Recipe]
    snack: Optional[Recipe]
    total_nutrition: Dict[str, float]
    estimated_cost: float

class RecipeEngine:
    """Advanced recipe recommendation and meal planning engine"""
    
    def __init__(self):
        self.recipes = self._load_sample_recipes()
        self.user_preferences = self._load_user_preferences()
        self.dietary_restrictions = self._load_dietary_restrictions()
        self.nutrition_targets = self._load_nutrition_targets()
    
    def _load_sample_recipes(self) -> List[Recipe]:
        """Load sample recipe database"""
        return [
            Recipe(
                id="r001",
                name="Vegetarian Pasta Primavera",
                description="Fresh vegetables with pasta in a light cream sauce",
                ingredients=[
                    {"item": "pasta", "amount": 300, "unit": "g", "optional": False},
                    {"item": "bell pepper", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "zucchini", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "carrot", "amount": 2, "unit": "pieces", "optional": False},
                    {"item": "cream", "amount": 200, "unit": "ml", "optional": False},
                    {"item": "parmesan cheese", "amount": 50, "unit": "g", "optional": True},
                    {"item": "garlic", "amount": 2, "unit": "cloves", "optional": False},
                    {"item": "olive oil", "amount": 2, "unit": "tbsp", "optional": False}
                ],
                instructions=[
                    "Boil pasta according to package instructions",
                    "Chop all vegetables into bite-sized pieces",
                    "Heat olive oil in a large pan and sauté garlic",
                    "Add vegetables and cook until tender",
                    "Add cream and simmer for 5 minutes",
                    "Combine with cooked pasta and serve with cheese"
                ],
                prep_time=15,
                cook_time=20,
                servings=4,
                difficulty="easy",
                cuisine_type="italian",
                dietary_tags=["vegetarian"],
                nutrition={"calories": 420, "protein": 12, "carbs": 65, "fat": 14, "fiber": 5},
                rating=4.3,
                image_url="/images/pasta-primavera.jpg"
            ),
            Recipe(
                id="r002",
                name="Chicken Stir Fry",
                description="Quick and healthy chicken with mixed vegetables",
                ingredients=[
                    {"item": "chicken breast", "amount": 500, "unit": "g", "optional": False},
                    {"item": "broccoli", "amount": 200, "unit": "g", "optional": False},
                    {"item": "bell pepper", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "soy sauce", "amount": 3, "unit": "tbsp", "optional": False},
                    {"item": "ginger", "amount": 1, "unit": "inch", "optional": False},
                    {"item": "garlic", "amount": 2, "unit": "cloves", "optional": False},
                    {"item": "sesame oil", "amount": 1, "unit": "tbsp", "optional": False},
                    {"item": "rice", "amount": 200, "unit": "g", "optional": True}
                ],
                instructions=[
                    "Cut chicken into bite-sized pieces",
                    "Prepare all vegetables",
                    "Heat oil in wok or large pan",
                    "Cook chicken until golden",
                    "Add vegetables and stir-fry for 3-4 minutes",
                    "Add soy sauce and seasonings",
                    "Serve with rice"
                ],
                prep_time=10,
                cook_time=15,
                servings=3,
                difficulty="easy",
                cuisine_type="asian",
                dietary_tags=["high-protein", "gluten-free"],
                nutrition={"calories": 280, "protein": 35, "carbs": 12, "fat": 8, "fiber": 4},
                rating=4.5,
                image_url="/images/chicken-stir-fry.jpg"
            ),
            Recipe(
                id="r003",
                name="Quinoa Buddha Bowl",
                description="Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
                ingredients=[
                    {"item": "quinoa", "amount": 150, "unit": "g", "optional": False},
                    {"item": "sweet potato", "amount": 1, "unit": "large", "optional": False},
                    {"item": "chickpeas", "amount": 200, "unit": "g", "optional": False},
                    {"item": "spinach", "amount": 100, "unit": "g", "optional": False},
                    {"item": "avocado", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "tahini", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "lemon", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "olive oil", "amount": 2, "unit": "tbsp", "optional": False}
                ],
                instructions=[
                    "Cook quinoa according to package instructions",
                    "Roast sweet potato cubes at 400°F for 25 minutes",
                    "Prepare tahini dressing with lemon juice",
                    "Arrange all ingredients in a bowl",
                    "Drizzle with dressing and serve"
                ],
                prep_time=15,
                cook_time=30,
                servings=2,
                difficulty="easy",
                cuisine_type="mediterranean",
                dietary_tags=["vegan", "gluten-free", "high-protein"],
                nutrition={"calories": 520, "protein": 18, "carbs": 68, "fat": 22, "fiber": 12},
                rating=4.7,
                image_url="/images/quinoa-buddha-bowl.jpg"
            ),
            Recipe(
                id="r004",
                name="Beef Curry",
                description="Rich and flavorful slow-cooked beef curry",
                ingredients=[
                    {"item": "beef chuck", "amount": 600, "unit": "g", "optional": False},
                    {"item": "onion", "amount": 2, "unit": "pieces", "optional": False},
                    {"item": "tomato", "amount": 3, "unit": "pieces", "optional": False},
                    {"item": "coconut milk", "amount": 400, "unit": "ml", "optional": False},
                    {"item": "curry powder", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "ginger", "amount": 2, "unit": "inches", "optional": False},
                    {"item": "garlic", "amount": 4, "unit": "cloves", "optional": False},
                    {"item": "potatoes", "amount": 2, "unit": "medium", "optional": True}
                ],
                instructions=[
                    "Cut beef into cubes and brown in oil",
                    "Sauté onions until golden",
                    "Add garlic, ginger, and curry powder",
                    "Add tomatoes and cook until soft",
                    "Add beef back to pot with coconut milk",
                    "Simmer for 1.5 hours until tender",
                    "Add potatoes in last 30 minutes"
                ],
                prep_time=20,
                cook_time=120,
                servings=4,
                difficulty="medium",
                cuisine_type="indian",
                dietary_tags=["high-protein", "gluten-free"],
                nutrition={"calories": 385, "protein": 28, "carbs": 15, "fat": 25, "fiber": 3},
                rating=4.4,
                image_url="/images/beef-curry.jpg"
            ),
            Recipe(
                id="r005",
                name="Greek Salad",
                description="Fresh Mediterranean salad with feta and olives",
                ingredients=[
                    {"item": "cucumber", "amount": 2, "unit": "pieces", "optional": False},
                    {"item": "tomato", "amount": 3, "unit": "large", "optional": False},
                    {"item": "red onion", "amount": 0.5, "unit": "piece", "optional": False},
                    {"item": "feta cheese", "amount": 150, "unit": "g", "optional": False},
                    {"item": "olives", "amount": 100, "unit": "g", "optional": False},
                    {"item": "olive oil", "amount": 3, "unit": "tbsp", "optional": False},
                    {"item": "lemon", "amount": 1, "unit": "piece", "optional": False},
                    {"item": "oregano", "amount": 1, "unit": "tsp", "optional": False}
                ],
                instructions=[
                    "Chop tomatoes and cucumber into chunks",
                    "Slice red onion thinly",
                    "Combine vegetables in a large bowl",
                    "Add crumbled feta and olives",
                    "Whisk olive oil, lemon juice, and oregano",
                    "Pour dressing over salad and toss"
                ],
                prep_time=15,
                cook_time=0,
                servings=3,
                difficulty="easy",
                cuisine_type="greek",
                dietary_tags=["vegetarian", "low-carb", "gluten-free"],
                nutrition={"calories": 220, "protein": 8, "carbs": 12, "fat": 18, "fiber": 4},
                rating=4.6,
                image_url="/images/greek-salad.jpg"
            ),
            Recipe(
                id="r006",
                name="Salmon with Lemon Herbs",
                description="Pan-seared salmon with fresh herbs and lemon",
                ingredients=[
                    {"item": "salmon fillet", "amount": 600, "unit": "g", "optional": False},
                    {"item": "lemon", "amount": 2, "unit": "pieces", "optional": False},
                    {"item": "dill", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "parsley", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "asparagus", "amount": 300, "unit": "g", "optional": True},
                    {"item": "olive oil", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "butter", "amount": 2, "unit": "tbsp", "optional": False},
                    {"item": "garlic", "amount": 2, "unit": "cloves", "optional": False}
                ],
                instructions=[
                    "Season salmon with salt and pepper",
                    "Heat oil in a pan over medium-high heat",
                    "Cook salmon skin-side down for 4 minutes",
                    "Flip and cook for 3 more minutes",
                    "Add butter, lemon juice, and herbs",
                    "Serve with roasted asparagus"
                ],
                prep_time=10,
                cook_time=15,
                servings=3,
                difficulty="medium",
                cuisine_type="mediterranean",
                dietary_tags=["high-protein", "keto", "gluten-free"],
                nutrition={"calories": 320, "protein": 42, "carbs": 4, "fat": 15, "fiber": 2},
                rating=4.8,
                image_url="/images/salmon-lemon-herbs.jpg"
            )
        ]
    
    def _load_user_preferences(self) -> Dict[str, Any]:
        """Load user cooking preferences"""
        return {
            "preferred_cuisines": ["italian", "mediterranean", "asian"],
            "max_prep_time": 30,
            "max_cook_time": 60,
            "preferred_difficulty": ["easy", "medium"],
            "favorite_ingredients": ["chicken", "pasta", "tomato", "garlic"],
            "disliked_ingredients": ["liver", "anchovies"],
            "cooking_skill": "intermediate"
        }
    
    def _load_dietary_restrictions(self) -> List[str]:
        """Load user dietary restrictions"""
        return []  # e.g., ["vegetarian", "gluten-free", "dairy-free"]
    
    def _load_nutrition_targets(self) -> Dict[str, Dict[str, float]]:
        """Load daily nutrition targets"""
        return {
            "daily": {
                "calories": 2000,
                "protein": 150,
                "carbs": 250,
                "fat": 65,
                "fiber": 25
            },
            "meal": {
                "breakfast": 0.25,
                "lunch": 0.35,
                "dinner": 0.35,
                "snack": 0.05
            }
        }
    
    def find_recipes_by_ingredients(self, available_ingredients: List[str], 
                                  match_threshold: float = 0.6) -> List[Dict[str, Any]]:
        """Find recipes based on available ingredients"""
        recipe_matches = []
        
        # Normalize ingredient names for better matching
        available_lower = [ing.lower().strip() for ing in available_ingredients]
        
        for recipe in self.recipes:
            # Calculate ingredient match score
            required_ingredients = [ing["item"].lower() for ing in recipe.ingredients if not ing["optional"]]
            optional_ingredients = [ing["item"].lower() for ing in recipe.ingredients if ing["optional"]]
            
            # Count matches for required ingredients
            required_matches = sum(1 for req_ing in required_ingredients 
                                 if any(req_ing in avail_ing or avail_ing in req_ing 
                                       for avail_ing in available_lower))
            
            # Count matches for optional ingredients
            optional_matches = sum(1 for opt_ing in optional_ingredients 
                                 if any(opt_ing in avail_ing or avail_ing in opt_ing 
                                       for avail_ing in available_lower))
            
            # Calculate match percentage
            total_required = len(required_ingredients)
            if total_required == 0:
                continue
                
            match_score = required_matches / total_required
            bonus_score = optional_matches / max(len(optional_ingredients), 1) * 0.2
            
            final_score = min(match_score + bonus_score, 1.0)
            
            if final_score >= match_threshold:
                missing_ingredients = [ing["item"] for ing in recipe.ingredients 
                                     if not ing["optional"] and 
                                     not any(ing["item"].lower() in avail_ing or avail_ing in ing["item"].lower() 
                                            for avail_ing in available_lower)]
                
                recipe_matches.append({
                    "recipe": recipe,
                    "match_score": final_score,
                    "missing_ingredients": missing_ingredients,
                    "missing_count": len(missing_ingredients)
                })
        
        # Sort by match score (descending) and missing ingredient count (ascending)
        recipe_matches.sort(key=lambda x: (-x["match_score"], x["missing_count"]))
        
        return recipe_matches[:10]  # Return top 10 matches
    
    def get_recipe_recommendations(self, preferences: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get personalized recipe recommendations"""
        if preferences is None:
            preferences = self.user_preferences
        
        scored_recipes = []
        
        for recipe in self.recipes:
            score = 0.0
            factors = {}
            
            # Cuisine preference scoring (25%)
            if recipe.cuisine_type in preferences.get("preferred_cuisines", []):
                cuisine_score = 1.0
            else:
                cuisine_score = 0.3
            score += cuisine_score * 0.25
            factors["cuisine"] = cuisine_score
            
            # Time preference scoring (20%)
            max_prep = preferences.get("max_prep_time", 60)
            max_cook = preferences.get("max_cook_time", 120)
            
            time_score = 1.0
            if recipe.prep_time > max_prep:
                time_score *= 0.5
            if recipe.cook_time > max_cook:
                time_score *= 0.5
            
            score += time_score * 0.20
            factors["time"] = time_score
            
            # Difficulty preference scoring (15%)
            if recipe.difficulty in preferences.get("preferred_difficulty", ["easy", "medium"]):
                difficulty_score = 1.0
            else:
                difficulty_score = 0.4
            score += difficulty_score * 0.15
            factors["difficulty"] = difficulty_score
            
            # Ingredient preference scoring (25%)
            favorite_ingredients = preferences.get("favorite_ingredients", [])
            disliked_ingredients = preferences.get("disliked_ingredients", [])
            
            recipe_ingredients = [ing["item"].lower() for ing in recipe.ingredients]
            
            # Boost for favorite ingredients
            favorite_matches = sum(1 for fav in favorite_ingredients 
                                 if any(fav.lower() in ing for ing in recipe_ingredients))
            favorite_score = min(favorite_matches / max(len(favorite_ingredients), 1), 1.0)
            
            # Penalty for disliked ingredients
            disliked_matches = sum(1 for dis in disliked_ingredients 
                                 if any(dis.lower() in ing for ing in recipe_ingredients))
            dislike_penalty = disliked_matches * 0.3
            
            ingredient_score = max(favorite_score - dislike_penalty, 0.0)
            score += ingredient_score * 0.25
            factors["ingredients"] = ingredient_score
            
            # Recipe rating scoring (15%)
            rating_score = recipe.rating / 5.0
            score += rating_score * 0.15
            factors["rating"] = rating_score
            
            # Check dietary restrictions
            dietary_compatible = True
            user_restrictions = self.dietary_restrictions
            
            for restriction in user_restrictions:
                if restriction not in recipe.dietary_tags:
                    dietary_compatible = False
                    break
            
            if not dietary_compatible:
                score *= 0.1  # Heavy penalty for dietary restriction violations
            
            scored_recipes.append({
                "recipe": recipe,
                "recommendation_score": score,
                "score_factors": factors,
                "dietary_compatible": dietary_compatible
            })
        
        # Sort by recommendation score
        scored_recipes.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        return scored_recipes[:15]  # Return top 15 recommendations
    
    def optimize_cooking_time(self, selected_recipes: List[str]) -> Dict[str, Any]:
        """Optimize cooking schedule for multiple recipes"""
        recipes = [r for r in self.recipes if r.id in selected_recipes]
        
        if not recipes:
            return {"error": "No valid recipes provided"}
        
        # Calculate total time and find overlaps
        total_prep_time = sum(r.prep_time for r in recipes)
        total_cook_time = sum(r.cook_time for r in recipes)
        
        # Simple scheduling algorithm
        # Sort by cook time (longest first)
        sorted_recipes = sorted(recipes, key=lambda x: x.cook_time, reverse=True)
        
        schedule = []
        current_time = 0
        
        for i, recipe in enumerate(sorted_recipes):
            start_time = current_time
            prep_end = start_time + recipe.prep_time
            cook_end = prep_end + recipe.cook_time
            
            schedule.append({
                "recipe_id": recipe.id,
                "recipe_name": recipe.name,
                "start_prep": start_time,
                "start_cook": prep_end,
                "finish_time": cook_end,
                "duration": recipe.prep_time + recipe.cook_time
            })
            
            # Start next recipe prep while current is cooking (if possible)
            if i < len(sorted_recipes) - 1:
                next_recipe = sorted_recipes[i + 1]
                # Can start next prep if it finishes before current cook ends
                earliest_next_start = max(current_time + 5, prep_end - next_recipe.prep_time)
                current_time = min(earliest_next_start, prep_end)
            else:
                current_time = cook_end
        
        # Calculate time savings
        sequential_time = total_prep_time + total_cook_time
        optimized_time = max(item["finish_time"] for item in schedule)
        time_saved = sequential_time - optimized_time
        
        return {
            "schedule": schedule,
            "total_time": optimized_time,
            "sequential_time": sequential_time,
            "time_saved": time_saved,
            "efficiency": (time_saved / sequential_time) * 100 if sequential_time > 0 else 0
        }
    
    def suggest_ingredient_substitutions(self, recipe_id: str, unavailable_ingredients: List[str]) -> Dict[str, Any]:
        """Suggest ingredient substitutions"""
        recipe = next((r for r in self.recipes if r.id == recipe_id), None)
        if not recipe:
            return {"error": "Recipe not found"}
        
        # Common ingredient substitutions database
        substitutions = {
            "butter": ["olive oil", "coconut oil", "margarine"],
            "milk": ["almond milk", "soy milk", "coconut milk"],
            "eggs": ["flax eggs", "applesauce", "banana"],
            "flour": ["almond flour", "coconut flour", "oat flour"],
            "sugar": ["honey", "maple syrup", "stevia"],
            "cream": ["coconut cream", "cashew cream", "milk + butter"],
            "chicken": ["tofu", "tempeh", "mushrooms"],
            "beef": ["lentils", "mushrooms", "tempeh"],
            "cheese": ["nutritional yeast", "cashew cheese", "vegan cheese"],
            "sour cream": ["greek yogurt", "cashew cream", "coconut cream"]
        }
        
        suggestions = {}
        recipe_changes = []
        
        for unavailable in unavailable_ingredients:
            unavailable_lower = unavailable.lower()
            
            # Find matching ingredient in recipe
            recipe_ingredient = None
            for ing in recipe.ingredients:
                if unavailable_lower in ing["item"].lower() or ing["item"].lower() in unavailable_lower:
                    recipe_ingredient = ing
                    break
            
            if recipe_ingredient:
                # Look for substitutions
                possible_subs = []
                for base_ingredient, subs in substitutions.items():
                    if base_ingredient in unavailable_lower:
                        possible_subs.extend(subs)
                
                if possible_subs:
                    suggestions[unavailable] = {
                        "original_ingredient": recipe_ingredient,
                        "substitutions": possible_subs[:3],  # Top 3 suggestions
                        "notes": f"Substitute {recipe_ingredient['amount']} {recipe_ingredient['unit']} of {recipe_ingredient['item']}"
                    }
                    
                    recipe_changes.append({
                        "type": "substitution",
                        "original": recipe_ingredient["item"],
                        "suggested": possible_subs[0],
                        "amount": recipe_ingredient["amount"],
                        "unit": recipe_ingredient["unit"]
                    })
        
        return {
            "recipe_id": recipe_id,
            "recipe_name": recipe.name,
            "substitutions": suggestions,
            "recipe_changes": recipe_changes,
            "success": len(suggestions) > 0
        }
    
    def generate_meal_plan(self, days: int = 7, dietary_preferences: List[str] = None) -> List[MealPlan]:
        """Generate a weekly meal plan"""
        if dietary_preferences is None:
            dietary_preferences = self.dietary_restrictions
        
        meal_plan = []
        used_recipes = set()
        
        # Filter recipes based on dietary preferences
        available_recipes = []
        for recipe in self.recipes:
            if dietary_preferences:
                if all(pref in recipe.dietary_tags for pref in dietary_preferences if pref):
                    available_recipes.append(recipe)
            else:
                available_recipes.append(recipe)
        
        if not available_recipes:
            available_recipes = self.recipes  # Fallback to all recipes
        
        # Get nutrition targets
        daily_targets = self.nutrition_targets["daily"]
        meal_ratios = self.nutrition_targets["meal"]
        
        for day in range(days):
            date = (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d")
            
            # Select recipes for each meal
            breakfast = self._select_meal_recipe(available_recipes, "breakfast", used_recipes, daily_targets, meal_ratios)
            lunch = self._select_meal_recipe(available_recipes, "lunch", used_recipes, daily_targets, meal_ratios)
            dinner = self._select_meal_recipe(available_recipes, "dinner", used_recipes, daily_targets, meal_ratios)
            snack = None  # Could add snack recipes later
            
            # Calculate total nutrition
            total_nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}
            estimated_cost = 0.0
            
            for meal in [breakfast, lunch, dinner]:
                if meal:
                    for nutrient in total_nutrition:
                        total_nutrition[nutrient] += meal.nutrition.get(nutrient, 0)
                    estimated_cost += self._estimate_recipe_cost(meal)
            
            meal_plan.append(MealPlan(
                date=date,
                breakfast=breakfast,
                lunch=lunch,
                dinner=dinner,
                snack=snack,
                total_nutrition=total_nutrition,
                estimated_cost=estimated_cost
            ))
        
        return meal_plan
    
    def _select_meal_recipe(self, recipes: List[Recipe], meal_type: str, 
                           used_recipes: set, daily_targets: Dict[str, float], 
                           meal_ratios: Dict[str, float]) -> Optional[Recipe]:
        """Select appropriate recipe for meal type"""
        # Calculate target nutrition for this meal
        target_calories = daily_targets["calories"] * meal_ratios.get(meal_type, 0.33)
        
        # Filter recipes by meal appropriateness
        suitable_recipes = []
        for recipe in recipes:
            if recipe.id in used_recipes:
                continue
                
            # Meal type suitability based on calories and characteristics
            if meal_type == "breakfast":
                if 200 <= recipe.nutrition.get("calories", 0) <= 400:
                    suitable_recipes.append(recipe)
            elif meal_type == "lunch":
                if 300 <= recipe.nutrition.get("calories", 0) <= 600:
                    suitable_recipes.append(recipe)
            elif meal_type == "dinner":
                if 400 <= recipe.nutrition.get("calories", 0) <= 800:
                    suitable_recipes.append(recipe)
        
        if not suitable_recipes:
            suitable_recipes = [r for r in recipes if r.id not in used_recipes]
        
        if not suitable_recipes:
            return None
        
        # Select best match based on nutrition targets
        best_recipe = min(suitable_recipes, 
                         key=lambda r: abs(r.nutrition.get("calories", 0) - target_calories))
        
        used_recipes.add(best_recipe.id)
        return best_recipe
    
    def _estimate_recipe_cost(self, recipe: Recipe) -> float:
        """Estimate cost of recipe (simplified)"""
        # Simplified cost estimation based on ingredients
        base_costs = {
            "meat": 8.0, "chicken": 6.0, "beef": 10.0, "salmon": 12.0,
            "vegetables": 2.0, "fruits": 3.0, "dairy": 4.0,
            "grains": 1.5, "spices": 0.5, "oil": 2.0
        }
        
        total_cost = 0.0
        for ingredient in recipe.ingredients:
            # Simple categorization and cost estimation
            item_lower = ingredient["item"].lower()
            cost_per_unit = 2.0  # Default cost
            
            for category, cost in base_costs.items():
                if category in item_lower or any(food in item_lower for food in [
                    "chicken", "beef", "salmon", "tomato", "carrot", "onion",
                    "rice", "pasta", "cheese", "milk", "oil"
                ]):
                    cost_per_unit = cost
                    break
            
            total_cost += cost_per_unit * 0.5  # Rough portion cost
        
        return round(total_cost, 2)
    
    def get_recipe_nutrition_analysis(self, recipe_id: str) -> Dict[str, Any]:
        """Get detailed nutrition analysis for a recipe"""
        recipe = next((r for r in self.recipes if r.id == recipe_id), None)
        if not recipe:
            return {"error": "Recipe not found"}
        
        nutrition = recipe.nutrition
        daily_targets = self.nutrition_targets["daily"]
        
        # Calculate percentages of daily values
        nutrition_analysis = {}
        for nutrient, value in nutrition.items():
            daily_target = daily_targets.get(nutrient, 0)
            percentage = (value / daily_target * 100) if daily_target > 0 else 0
            
            nutrition_analysis[nutrient] = {
                "value": value,
                "daily_target": daily_target,
                "percentage_dv": round(percentage, 1),
                "status": self._get_nutrition_status(percentage)
            }
        
        # Overall nutrition score
        scores = []
        for nutrient in ["protein", "fiber"]:
            if nutrient in nutrition_analysis:
                scores.append(min(nutrition_analysis[nutrient]["percentage_dv"] / 25, 1.0))
        
        # Penalty for excessive calories or fat
        cal_score = max(1.0 - (nutrition_analysis.get("calories", {}).get("percentage_dv", 0) - 25) / 50, 0.5)
        fat_score = max(1.0 - (nutrition_analysis.get("fat", {}).get("percentage_dv", 0) - 30) / 40, 0.5)
        
        scores.extend([cal_score, fat_score])
        overall_score = sum(scores) / len(scores)
        
        return {
            "recipe_id": recipe_id,
            "recipe_name": recipe.name,
            "nutrition_analysis": nutrition_analysis,
            "overall_nutrition_score": round(overall_score * 100, 1),
            "health_benefits": self._get_health_benefits(recipe),
            "dietary_tags": recipe.dietary_tags
        }
    
    def _get_nutrition_status(self, percentage: float) -> str:
        """Get nutrition status based on percentage of daily value"""
        if percentage < 10:
            return "low"
        elif percentage < 20:
            return "moderate"
        elif percentage < 40:
            return "good"
        elif percentage < 60:
            return "high"
        else:
            return "very_high"
    
    def _get_health_benefits(self, recipe: Recipe) -> List[str]:
        """Get health benefits based on ingredients and nutrition"""
        benefits = []
        
        # Check for high protein
        if recipe.nutrition.get("protein", 0) > 20:
            benefits.append("High protein content supports muscle health")
        
        # Check for high fiber
        if recipe.nutrition.get("fiber", 0) > 5:
            benefits.append("High fiber aids digestion and heart health")
        
        # Check for vegetables
        veggie_ingredients = ["tomato", "carrot", "spinach", "broccoli", "bell pepper"]
        if any(veggie in ingredient["item"].lower() 
               for ingredient in recipe.ingredients 
               for veggie in veggie_ingredients):
            benefits.append("Rich in vitamins and antioxidants from vegetables")
        
        # Check for healthy fats
        healthy_fats = ["olive oil", "avocado", "salmon", "nuts"]
        if any(fat in ingredient["item"].lower() 
               for ingredient in recipe.ingredients 
               for fat in healthy_fats):
            benefits.append("Contains healthy fats for heart health")
        
        return benefits
    
    def search_recipes(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search recipes by name, ingredients, or cuisine"""
        if filters is None:
            filters = {}
        
        query_lower = query.lower()
        matching_recipes = []
        
        for recipe in self.recipes:
            score = 0.0
            
            # Name matching
            if query_lower in recipe.name.lower():
                score += 2.0
            
            # Description matching
            if query_lower in recipe.description.lower():
                score += 1.0
            
            # Ingredient matching
            for ingredient in recipe.ingredients:
                if query_lower in ingredient["item"].lower():
                    score += 1.5
            
            # Cuisine matching
            if query_lower in recipe.cuisine_type.lower():
                score += 1.0
            
            # Dietary tag matching
            for tag in recipe.dietary_tags:
                if query_lower in tag.lower():
                    score += 1.0
            
            # Apply filters
            if filters:
                if "max_prep_time" in filters and recipe.prep_time > filters["max_prep_time"]:
                    score *= 0.5
                if "max_cook_time" in filters and recipe.cook_time > filters["max_cook_time"]:
                    score *= 0.5
                if "difficulty" in filters and recipe.difficulty not in filters["difficulty"]:
                    score *= 0.7
                if "cuisine_type" in filters and recipe.cuisine_type not in filters["cuisine_type"]:
                    score *= 0.6
                if "dietary_tags" in filters:
                    required_tags = filters["dietary_tags"]
                    if not all(tag in recipe.dietary_tags for tag in required_tags):
                        score *= 0.3
            
            if score > 0:
                matching_recipes.append({
                    "recipe": recipe,
                    "relevance_score": score
                })
        
        # Sort by relevance score
        matching_recipes.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return matching_recipes[:20]  # Return top 20 matches
#!/usr/bin/env python3
"""
Nutrition & Health Intelligence Engine

Provides nutritional analysis, allergen detection, substitution suggestions,
goal tracking and meal-level nutrition scoring.

This is a lightweight rule-based engine that can later be extended with
ML models or external nutrition databases (USDA, Nutritionix, etc.).
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import math


@dataclass
class NutrientSummary:
    calories: float = 0.0
    protein_g: float = 0.0
    fat_g: float = 0.0
    carbs_g: float = 0.0
    fiber_g: float = 0.0
    sugar_g: float = 0.0


class NutritionEngine:
    """Simple nutrition intelligence engine.

    NOTE: this engine uses embedded per-serving nutrient estimates for demo.
    Replace with real database/API for production.
    """

    def __init__(self):
        # Very small demo nutrient lookup (per typical serving)
        self.nutrient_db: Dict[str, Dict[str, float]] = {
            'banana': {'calories': 105, 'protein': 1.3, 'fat': 0.4, 'carbs': 27, 'fiber': 3.1, 'sugar': 14.4},
            'apple': {'calories': 95, 'protein': 0.5, 'fat': 0.3, 'carbs': 25, 'fiber': 4.4, 'sugar': 19},
            'milk': {'calories': 150, 'protein': 8, 'fat': 8, 'carbs': 12, 'fiber': 0, 'sugar': 12},
            'bread': {'calories': 80, 'protein': 3, 'fat': 1, 'carbs': 15, 'fiber': 1.5, 'sugar': 1.5},
            'egg': {'calories': 78, 'protein': 6, 'fat': 5, 'carbs': 0.6, 'fiber': 0, 'sugar': 0.6},
            'chicken breast': {'calories': 165, 'protein': 31, 'fat': 3.6, 'carbs': 0, 'fiber': 0, 'sugar': 0},
            'rice': {'calories': 205, 'protein': 4.3, 'fat': 0.4, 'carbs': 45, 'fiber': 0.6, 'sugar': 0.1},
            'yogurt': {'calories': 59, 'protein': 10, 'fat': 0.4, 'carbs': 3.6, 'fiber': 0, 'sugar': 3.2},
            'olive oil': {'calories': 119, 'protein': 0, 'fat': 13.5, 'carbs': 0, 'fiber': 0, 'sugar': 0},
            'tomato': {'calories': 22, 'protein': 1.1, 'fat': 0.2, 'carbs': 4.8, 'fiber': 1.5, 'sugar': 3.2},
        }

        # substitution hints
        self.substitutions = {
            'whole milk': ['skim milk', 'almond milk'],
            'butter': ['olive oil', 'margarine'],
            'white rice': ['brown rice', 'quinoa'],
            'sugar': ['honey', 'maple syrup', 'stevia'],
        }

    def _lookup(self, item_name: str) -> Optional[Dict[str, float]]:
        key = item_name.strip().lower()
        return self.nutrient_db.get(key)

    def analyze_items(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Sum nutrients for a list of items.

        items: [{ 'name': str, 'servings': float }]
        returns a nutrient summary and per-item details
        """
        total = NutrientSummary()
        details = []

        for it in items:
            name = it.get('name', '')
            servings = float(it.get('servings', 1) or 1)
            nutr = self._lookup(name)

            if nutr:
                cals = nutr['calories'] * servings
                protein = nutr['protein'] * servings
                fat = nutr['fat'] * servings
                carbs = nutr['carbs'] * servings
                fiber = nutr['fiber'] * servings
                sugar = nutr['sugar'] * servings

                total.calories += cals
                total.protein_g += protein
                total.fat_g += fat
                total.carbs_g += carbs
                total.fiber_g += fiber
                total.sugar_g += sugar

                details.append({
                    'name': name,
                    'servings': servings,
                    'calories': round(cals, 1),
                    'protein_g': round(protein, 2),
                    'fat_g': round(fat, 2),
                    'carbs_g': round(carbs, 2),
                    'fiber_g': round(fiber, 2),
                    'sugar_g': round(sugar, 2),
                })
            else:
                details.append({'name': name, 'servings': servings, 'error': 'nutrient data not found'})

        summary = {
            'calories': round(total.calories, 1),
            'protein_g': round(total.protein_g, 2),
            'fat_g': round(total.fat_g, 2),
            'carbs_g': round(total.carbs_g, 2),
            'fiber_g': round(total.fiber_g, 2),
            'sugar_g': round(total.sugar_g, 2),
        }

        # derive a simple nutrition score (0-100)
        score = self._calculate_nutrition_score(summary)

        return { 'summary': summary, 'details': details, 'nutrition_score': score }

    def _calculate_nutrition_score(self, summary: Dict[str, float]) -> int:
        # Base heuristic: more protein and fiber and fewer added sugars/fat -> higher score
        protein = summary.get('protein_g', 0)
        fiber = summary.get('fiber_g', 0)
        sugar = summary.get('sugar_g', 0)
        fat = summary.get('fat_g', 0)
        cals = summary.get('calories', 0)

        score = 50
        score += min(protein * 1.5, 20)
        score += min(fiber * 2.0, 15)
        score -= min(sugar * 1.0, 20)
        score -= min(fat * 0.8, 15)
        # penalize extreme calories per serving
        if cals > 800:
            score -= 10

        return max(0, min(100, int(round(score))))

    def check_allergens(self, items: List[str], user_allergies: List[str]) -> Dict[str, Any]:
        """Very small allergen checker using keywords"""
        issues = []
        lowered = [a.lower() for a in user_allergies]

        for it in items:
            name = it.lower()
            for allergy in lowered:
                if allergy in name:
                    issues.append({'item': it, 'allergy': allergy, 'match': 'keyword'})

        return {'issues': issues, 'safe': len(issues) == 0}

    def suggest_substitutions(self, item_name: str) -> Dict[str, Any]:
        key = item_name.strip().lower()
        subs = self.substitutions.get(key) or []
        return {'item': item_name, 'substitutions': subs}

    def recommend_healthy_swaps(self, items: List[str]) -> List[Dict[str, Any]]:
        results = []
        for it in items:
            key = it.strip().lower()
            if key in self.substitutions:
                results.append({'item': it, 'suggestions': self.substitutions[key]})
        return results

    def evaluate_meal_compliance(self, items: List[Dict[str, Any]], user_goals: Dict[str, Any]) -> Dict[str, Any]:
        """Compare meal nutrients to user goals and dietary restrictions.

        user_goals: { 'calories': 2000, 'protein_g': 50, 'diet_type': 'weight_loss' }
        """
        analysis = self.analyze_items(items)
        summary = analysis['summary']
        
        # Handle diet type goals
        diet_type = user_goals.get('diet_type', '')
        if diet_type:
            return self._evaluate_diet_compliance(summary, diet_type)
        
        # Handle numeric goals
        compliance = {}
        for goal, value in user_goals.items():
            if isinstance(value, (int, float)) and goal in summary:
                actual = summary.get(goal, 0)
                diff = actual - value
                compliance[goal] = {
                    'goal': value,
                    'actual': actual,
                    'difference': round(diff, 2),
                    'within_goal': abs(diff) <= max(0.1 * value, 1)
                }

        return {'analysis': analysis, 'compliance': compliance}
    
    def _evaluate_diet_compliance(self, summary: Dict[str, float], diet_type: str) -> Dict[str, Any]:
        """Evaluate compliance with specific diet types"""
        calories = summary.get('calories', 0)
        protein = summary.get('protein_g', 0)
        carbs = summary.get('carbs_g', 0)
        fat = summary.get('fat_g', 0)
        
        recommendations = []
        score = 50  # Base score
        
        if diet_type == 'weight_loss':
            # Lower calorie, higher protein preference
            if calories < 600:
                score += 20
                recommendations.append("Good calorie control for weight loss")
            else:
                recommendations.append("Consider reducing portion sizes")
                
            if protein >= 20:
                score += 15
                recommendations.append("Excellent protein content")
            else:
                recommendations.append("Add more lean protein sources")
                
        elif diet_type == 'muscle_gain':
            if protein >= 25:
                score += 20
                recommendations.append("Great protein content for muscle building")
            else:
                recommendations.append("Increase protein intake for muscle gain")
                
        elif diet_type == 'heart_healthy':
            if fat < 10:
                score += 15
                recommendations.append("Good fat control for heart health")
            else:
                recommendations.append("Consider reducing fat content")
                
        elif diet_type == 'keto':
            if carbs < 10:
                score += 20
                recommendations.append("Excellent carb control for keto")
            else:
                recommendations.append("Reduce carbohydrates for ketogenic diet")
        
        compliant = score >= 70
        
        return {
            'compliant': compliant,
            'score': min(score, 100),
            'message': f"Meal is {'compliant' if compliant else 'not fully compliant'} with {diet_type} goals",
            'recommendations': recommendations
        }


if __name__ == '__main__':
    engine = NutritionEngine()
    sample = engine.analyze_items([{'name': 'banana', 'servings': 1}, {'name': 'milk', 'servings': 1}])
    print(sample)

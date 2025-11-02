#!/usr/bin/env python3
"""
Simple test of nutrition engine functionality
"""
import sys
import os

# Add the backend src directory to the path
backend_path = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_path)

try:
    from utils.nutrition_engine import NutritionEngine
    
    print("✓ Successfully imported NutritionEngine")
    
    # Create engine instance
    engine = NutritionEngine()
    print("✓ Successfully created NutritionEngine instance")
    
    # Test analyze_items
    test_items = [
        {'name': 'banana', 'servings': 1},
        {'name': 'milk', 'servings': 1}
    ]
    
    print("\n=== Testing analyze_items ===")
    result = engine.analyze_items(test_items)
    print(f"✓ Analysis result: {result}")
    
    # Test allergen check
    print("\n=== Testing check_allergens ===")
    allergen_result = engine.check_allergens(['banana', 'milk'], ['nuts', 'milk'])
    print(f"✓ Allergen result: {allergen_result}")
    
    # Test substitutions
    print("\n=== Testing suggest_substitutions ===")
    subs = engine.suggest_substitutions('milk')
    print(f"✓ Substitutions for milk: {subs}")
    
    # Test healthy swaps
    print("\n=== Testing recommend_healthy_swaps ===")
    swaps = engine.recommend_healthy_swaps(['bread', 'milk'])
    print(f"✓ Healthy swaps: {swaps}")
    
    # Test meal compliance
    print("\n=== Testing evaluate_meal_compliance ===")
    compliance = engine.evaluate_meal_compliance(test_items, {'diet_type': 'weight_loss'})
    print(f"✓ Meal compliance: {compliance}")
    
    print("\n🎉 All nutrition engine tests passed!")
    
except Exception as e:
    print(f"❌ Error testing nutrition engine: {e}")
    import traceback
    traceback.print_exc()
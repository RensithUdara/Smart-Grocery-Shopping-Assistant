#!/usr/bin/env python3
"""
Test script for Nutrition API endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_nutrition_analyze():
    """Test the nutrition analyze endpoint"""
    print("=== Testing Nutrition Analyze ===")
    
    data = {
        "items": [
            {"name": "banana", "servings": 1},
            {"name": "milk", "servings": 1},
            {"name": "bread", "servings": 2}
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/nutrition/analyze", json=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_allergen_check():
    """Test the allergen check endpoint"""
    print("\n=== Testing Allergen Check ===")
    
    data = {
        "items": ["banana", "milk", "bread", "egg"],
        "allergies": ["milk", "egg", "nuts"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/nutrition/check-allergens", json=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_substitutions():
    """Test the substitutions endpoint"""
    print("\n=== Testing Substitutions ===")
    
    data = {"item": "milk"}
    
    try:
        response = requests.post(f"{BASE_URL}/api/nutrition/substitutions", json=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_healthy_swaps():
    """Test the healthy swaps endpoint"""
    print("\n=== Testing Healthy Swaps ===")
    
    data = {
        "items": ["bread", "milk", "banana"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/nutrition/healthy-swaps", json=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_meal_compliance():
    """Test the meal compliance endpoint"""
    print("\n=== Testing Meal Compliance ===")
    
    data = {
        "items": [
            {"name": "banana", "servings": 1},
            {"name": "yogurt", "servings": 1}
        ],
        "goals": {"diet_type": "weight_loss"}
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/nutrition/meal-compliance", json=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Testing Nutrition API Endpoints...")
    
    # Test all endpoints
    test_nutrition_analyze()
    test_allergen_check()
    test_substitutions()
    test_healthy_swaps()
    test_meal_compliance()
    
    print("\n=== Testing Complete ===")
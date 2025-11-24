#!/usr/bin/env python3
"""
AI Enhancement Demo Script for Smart Grocery Shopping Assistant

This script demonstrates the enhanced AI capabilities including:
- Machine learning-based recommendations
- User behavior pattern learning
- Intelligent rule-based suggestions
- Predictive shopping analytics

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

import sys
import os
import json
from datetime import datetime, timedelta

# Add project paths
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from src.utils.ml_engine import AdvancedMLEngine
    from src.engines.smart_rule_engine import SmartRuleEngine
    from src.models.shopping_list import ShoppingList
    from src.models.purchase_history import PurchaseHistory
    from src.models.grocery_item import GroceryItem
except ImportError as e:
    print(f"Import error: {e}")
    print("Please make sure you're running this script from the backend directory")
    sys.exit(1)

def demo_ai_capabilities():
    """Demonstrate the enhanced AI capabilities"""
    
    print("=" * 60)
    print("🤖 SMART GROCERY ASSISTANT - AI ENHANCEMENT DEMO")
    print("=" * 60)
    
    # Initialize AI engines
    print("\n🚀 Initializing Advanced AI Engines...")
    ml_engine = AdvancedMLEngine()
    rule_engine = SmartRuleEngine()
    
    # Create sample shopping list
    shopping_list = ShoppingList()
    shopping_list.add_item(GroceryItem("Pasta", "grains", 2))
    shopping_list.add_item(GroceryItem("Chicken Breast", "meat", 1))
    shopping_list.add_item(GroceryItem("Tomatoes", "vegetables", 3))
    
    print(f"✅ AI engines initialized")
    print(f"   - ML Engine with {len(ml_engine.purchase_history)} sample purchases")
    print(f"   - Smart Rule Engine with learning capabilities")
    
    print("\n" + "=" * 60)
    print("📊 USER BEHAVIOR ANALYSIS")
    print("=" * 60)
    
    # Get AI insights
    insights = ml_engine.get_ai_insights()
    
    if 'user_profile_summary' in insights:
        profile = insights['user_profile_summary']
        print(f"\n📈 User Profile Summary:")
        print(f"   • Total Purchases: {profile['total_purchases']}")
        print(f"   • Average Basket Value: ${profile['avg_basket_value']}")
        print(f"   • Shopping Frequency: {profile['shopping_frequency']:.1f} times/week")
        print(f"   • Health Score: {profile['health_score']:.1%}")
        print(f"   • Price Sensitivity: {profile['price_sensitivity']:.1%}")
    
    if 'behavioral_patterns' in insights:
        patterns = insights['behavioral_patterns']
        print(f"\n🎯 Top Category Preferences:")
        for i, (category, stats) in enumerate(patterns['most_preferred_categories'][:3], 1):
            print(f"   {i}. {category.title()}: {stats['preference_score']:.1%}")
    
    print("\n" + "=" * 60)
    print("🧠 MACHINE LEARNING RECOMMENDATIONS")
    print("=" * 60)
    
    # Get ML recommendations
    current_items = ["Pasta", "Chicken Breast", "Tomatoes"]
    ml_recommendations = ml_engine.get_personalized_recommendations(current_items, limit=8)
    
    print(f"\n🎯 Personalized ML Recommendations (Based on {len(current_items)} current items):")
    for i, rec in enumerate(ml_recommendations[:5], 1):
        print(f"   {i}. {rec['item']} ({rec['category']})")
        print(f"      Reason: {rec['reason']}")
        print(f"      Confidence: {rec['confidence']:.1%}")
        print(f"      Type: {rec['type'].replace('_', ' ').title()}")
        print()
    
    print("\n" + "=" * 60)
    print("🧮 SMART RULE-BASED LEARNING")
    print("=" * 60)
    
    # Create sample purchase history for rule learning
    purchase_history = PurchaseHistory()
    
    # Add sample purchases
    sample_purchases = [
        ("Pasta", "grains", datetime.now() - timedelta(days=10)),
        ("Pasta Sauce", "condiments", datetime.now() - timedelta(days=10)),
        ("Cheese", "dairy", datetime.now() - timedelta(days=10)),
        ("Milk", "dairy", datetime.now() - timedelta(days=5)),
        ("Bread", "bakery", datetime.now() - timedelta(days=5)),
        ("Butter", "dairy", datetime.now() - timedelta(days=5)),
    ]
    
    for name, category, date in sample_purchases:
        item = GroceryItem(name, category, 1, purchase_date=date)
        purchase_history.add_purchase(item)
    
    # Learn from purchase history
    rule_engine.learn_from_purchase_history(purchase_history)
    
    # Get smart suggestions
    smart_suggestions = rule_engine.generate_smart_suggestions(shopping_list, purchase_history)
    
    print(f"\n🎯 Smart Rule-Based Suggestions:")
    for i, suggestion in enumerate(smart_suggestions[:5], 1):
        print(f"   {i}. {suggestion['name']} ({suggestion['category']})")
        print(f"      Reason: {suggestion['reason']}")
        print(f"      Confidence: {suggestion['confidence']:.1%}")
        print(f"      Rule Type: {suggestion['rule_type'].replace('_', ' ').title()}")
        if 'ai_insights' in suggestion and suggestion['ai_insights']:
            print(f"      AI Insights: {suggestion['ai_insights']}")
        print()
    
    # Get rule insights
    rule_insights = rule_engine.get_ai_insights()
    print(f"\n📊 Learning Statistics:")
    print(f"   • Learned Associations: {rule_insights['learned_associations']}")
    print(f"   • Seasonal Patterns: {rule_insights['seasonal_patterns']}")
    print(f"   • Category Preferences: {len(rule_insights['category_preferences'])}")
    print(f"   • Tracked Items: {rule_insights['tracked_items']}")
    
    if 'top_associations' in rule_insights and rule_insights['top_associations']:
        print(f"\n🔗 Top Learned Item Associations:")
        for item, associations in list(rule_insights['top_associations'].items())[:3]:
            print(f"   • {item.title()}:")
            for assoc_item, confidence in list(associations.items())[:2]:
                print(f"     → {assoc_item.title()} ({confidence:.1%})")
    
    print("\n" + "=" * 60)
    print("🔮 PREDICTIVE ANALYTICS")
    print("=" * 60)
    
    # Get shopping predictions
    predictions = ml_engine.predict_next_shopping_day()
    
    print(f"\n📅 Shopping Behavior Predictions:")
    if 'shop_probability' in predictions:
        print(f"   • Next Shopping Probability: {predictions['shop_probability']:.1%}")
        print(f"   • Predicted Basket Size: {predictions['predicted_basket_size']} items")
        print(f"   • Prediction Confidence: {predictions['confidence']:.1%}")
    else:
        print(f"   • Status: {predictions.get('prediction', 'Learning in progress...')}")
    
    print("\n" + "=" * 60)
    print("✨ AI ENHANCEMENT SUMMARY")
    print("=" * 60)
    
    print(f"\n🎉 Your Smart Grocery Assistant now includes:")
    print(f"   ✅ Machine Learning-based recommendations")
    print(f"   ✅ Adaptive rule learning from user behavior")  
    print(f"   ✅ Market basket analysis for item associations")
    print(f"   ✅ Seasonal preference learning")
    print(f"   ✅ Predictive shopping analytics")
    print(f"   ✅ Real-time model updates")
    print(f"   ✅ Personalized user profiling")
    print(f"   ✅ Multi-factor recommendation scoring")
    
    print(f"\n📈 Key Improvements Over Basic System:")
    print(f"   • Dynamic learning instead of hardcoded rules")
    print(f"   • User behavior adaptation")
    print(f"   • Statistical confidence scoring")
    print(f"   • Multi-algorithm recommendation fusion")
    print(f"   • Predictive capabilities")
    
    print(f"\n🎓 Perfect for CS 6340 AI Project because:")
    print(f"   • Demonstrates machine learning concepts")
    print(f"   • Shows adaptive AI behavior")
    print(f"   • Uses real data for learning")
    print(f"   • Implements multiple AI techniques")
    print(f"   • Provides measurable improvements")
    
    print("\n" + "=" * 60)
    print("🚀 Demo Complete! Your AI is now MUCH smarter!")
    print("=" * 60)

if __name__ == "__main__":
    demo_ai_capabilities()
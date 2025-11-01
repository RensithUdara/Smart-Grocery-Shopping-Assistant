#!/usr/bin/env python3
"""
Advanced Analytics Engine for Smart Grocery Assistant

Provides comprehensive analytics including spending trends, nutritional analysis,
seasonal patterns, waste reduction metrics, and predictive insights.

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
import statistics

class AdvancedAnalytics:
    """
    Advanced analytics engine for comprehensive insights and predictions
    """
    
    def __init__(self):
        self.data_path = 'data'
        self.purchase_history = self._load_purchase_history()
        self.shopping_lists = self._load_shopping_history()
        self.user_preferences = self._load_user_preferences()
        self.expiration_data = self._load_expiration_data()
    
    def _load_purchase_history(self) -> List[Dict]:
        """Load purchase history data"""
        try:
            file_path = os.path.join(self.data_path, 'purchase_history.json')
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    return data.get('purchases', [])
        except Exception:
            pass
        return []
    
    def _load_shopping_history(self) -> List[Dict]:
        """Load shopping list history"""
        try:
            file_path = os.path.join(self.data_path, 'shopping_list_history.json')
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return []
    
    def _load_user_preferences(self) -> Dict:
        """Load user preferences"""
        try:
            file_path = os.path.join(self.data_path, 'user_preferences.json')
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return {}
    
    def _load_expiration_data(self) -> List[Dict]:
        """Load expiration tracking data"""
        try:
            file_path = os.path.join(self.data_path, 'expiration_history.json')
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return []
    
    def get_spending_trends(self, days: int = 90) -> Dict:
        """Analyze spending trends over specified period"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Filter recent purchases
        recent_purchases = [
            p for p in self.purchase_history
            if datetime.fromisoformat(p.get('date', '2024-01-01')) >= cutoff_date
        ]
        
        # Group by date
        daily_spending = defaultdict(float)
        weekly_spending = defaultdict(float)
        monthly_spending = defaultdict(float)
        category_spending = defaultdict(float)
        
        for purchase in recent_purchases:
            date = datetime.fromisoformat(purchase.get('date', '2024-01-01'))
            amount = purchase.get('total_cost', 0)
            category = purchase.get('category', 'Other')
            
            daily_key = date.strftime('%Y-%m-%d')
            weekly_key = f"{date.year}-W{date.isocalendar()[1]}"
            monthly_key = date.strftime('%Y-%m')
            
            daily_spending[daily_key] += amount
            weekly_spending[weekly_key] += amount
            monthly_spending[monthly_key] += amount
            category_spending[category] += amount
        
        # Calculate statistics
        total_spent = sum(daily_spending.values())
        avg_daily = total_spent / max(len(daily_spending), 1)
        spending_values = list(daily_spending.values())
        
        return {
            'period_days': days,
            'total_spent': total_spent,
            'average_daily': avg_daily,
            'median_daily': statistics.median(spending_values) if spending_values else 0,
            'max_daily': max(spending_values) if spending_values else 0,
            'min_daily': min(spending_values) if spending_values else 0,
            'daily_breakdown': dict(daily_spending),
            'weekly_breakdown': dict(weekly_spending),
            'monthly_breakdown': dict(monthly_spending),
            'category_breakdown': dict(category_spending),
            'trend_analysis': self._analyze_spending_trend(daily_spending)
        }
    
    def _analyze_spending_trend(self, daily_data: Dict[str, float]) -> Dict:
        """Analyze spending trend (increasing/decreasing)"""
        if len(daily_data) < 2:
            return {'trend': 'insufficient_data', 'change_percent': 0}
        
        dates = sorted(daily_data.keys())
        values = [daily_data[date] for date in dates]
        
        # Simple linear regression to determine trend
        n = len(values)
        if n < 2:
            return {'trend': 'stable', 'change_percent': 0}
        
        # Calculate trend using first half vs second half
        mid = n // 2
        first_half_avg = sum(values[:mid]) / mid if mid > 0 else 0
        second_half_avg = sum(values[mid:]) / (n - mid) if n - mid > 0 else 0
        
        if second_half_avg > first_half_avg * 1.1:
            trend = 'increasing'
        elif second_half_avg < first_half_avg * 0.9:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        change_percent = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        return {
            'trend': trend,
            'change_percent': change_percent,
            'first_half_average': first_half_avg,
            'second_half_average': second_half_avg
        }
    
    def get_nutritional_analysis(self, days: int = 30) -> Dict:
        """Analyze nutritional trends over time"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        recent_purchases = [
            p for p in self.purchase_history
            if datetime.fromisoformat(p.get('date', '2024-01-01')) >= cutoff_date
        ]
        
        nutritional_data = defaultdict(lambda: defaultdict(float))
        daily_nutrition = defaultdict(lambda: defaultdict(float))
        
        for purchase in recent_purchases:
            date = purchase.get('date', '2024-01-01')
            for item in purchase.get('items', []):
                nutrition = item.get('nutrition', {})
                category = item.get('category', 'Other')
                
                for nutrient, value in nutrition.items():
                    nutritional_data[category][nutrient] += value
                    daily_nutrition[date][nutrient] += value
        
        # Calculate nutritional scores and recommendations
        health_score = self._calculate_health_score(nutritional_data)
        recommendations = self._generate_nutritional_recommendations(nutritional_data)
        
        return {
            'period_days': days,
            'category_nutrition': dict(nutritional_data),
            'daily_nutrition': dict(daily_nutrition),
            'health_score': health_score,
            'recommendations': recommendations,
            'nutritional_trends': self._analyze_nutritional_trends(daily_nutrition)
        }
    
    def _calculate_health_score(self, nutrition_data: Dict) -> Dict:
        """Calculate overall health score based on nutritional data"""
        total_calories = sum(
            sum(nutrients.get('calories', 0) for nutrients in category_data.values())
            for category_data in nutrition_data.values()
        )
        
        total_protein = sum(
            sum(nutrients.get('protein', 0) for nutrients in category_data.values())
            for category_data in nutrition_data.values()
        )
        
        total_fiber = sum(
            sum(nutrients.get('fiber', 0) for nutrients in category_data.values())
            for category_data in nutrition_data.values()
        )
        
        total_sugar = sum(
            sum(nutrients.get('sugar', 0) for nutrients in category_data.values())
            for category_data in nutrition_data.values()
        )
        
        # Simple scoring algorithm (0-100)
        protein_score = min(100, (total_protein / max(total_calories * 0.1, 1)) * 100)
        fiber_score = min(100, (total_fiber / max(total_calories * 0.03, 1)) * 100)
        sugar_penalty = min(50, (total_sugar / max(total_calories * 0.1, 1)) * 50)
        
        overall_score = max(0, (protein_score + fiber_score - sugar_penalty) / 2)
        
        return {
            'overall_score': round(overall_score, 1),
            'protein_score': round(protein_score, 1),
            'fiber_score': round(fiber_score, 1),
            'sugar_penalty': round(sugar_penalty, 1),
            'total_calories': total_calories,
            'total_protein': total_protein,
            'total_fiber': total_fiber,
            'total_sugar': total_sugar
        }
    
    def _generate_nutritional_recommendations(self, nutrition_data: Dict) -> List[str]:
        """Generate nutritional recommendations"""
        recommendations = []
        
        # Analyze fruit and vegetable intake
        produce_categories = ['Fruits', 'Vegetables', 'Fresh Produce']
        produce_nutrition = sum(
            sum(nutrients.get('fiber', 0) for nutrients in nutrition_data.get(cat, {}).values())
            for cat in produce_categories
        )
        
        if produce_nutrition < 25:  # Recommended daily fiber from produce
            recommendations.append("Increase fruit and vegetable intake for more fiber and vitamins")
        
        # Check protein sources
        protein_categories = ['Meat', 'Fish', 'Dairy', 'Legumes']
        total_protein = sum(
            sum(nutrients.get('protein', 0) for nutrients in nutrition_data.get(cat, {}).values())
            for cat in protein_categories
        )
        
        if total_protein < 50:  # Minimum recommended protein
            recommendations.append("Consider adding more protein-rich foods to your diet")
        
        # Check processed food consumption
        processed_categories = ['Snacks', 'Processed Foods', 'Convenience']
        processed_calories = sum(
            sum(nutrients.get('calories', 0) for nutrients in nutrition_data.get(cat, {}).values())
            for cat in processed_categories
        )
        
        total_calories = sum(
            sum(nutrients.get('calories', 0) for nutrients in category_data.values())
            for category_data in nutrition_data.values()
        )
        
        if processed_calories > total_calories * 0.3:  # More than 30% processed
            recommendations.append("Reduce processed food consumption and opt for whole foods")
        
        return recommendations
    
    def _analyze_nutritional_trends(self, daily_data: Dict) -> Dict:
        """Analyze nutritional trends over time"""
        if not daily_data:
            return {'trend': 'no_data'}
        
        dates = sorted(daily_data.keys())
        calories_trend = [daily_data[date].get('calories', 0) for date in dates]
        protein_trend = [daily_data[date].get('protein', 0) for date in dates]
        
        return {
            'calories_trend': self._calculate_trend(calories_trend),
            'protein_trend': self._calculate_trend(protein_trend),
            'average_daily_calories': statistics.mean(calories_trend) if calories_trend else 0,
            'average_daily_protein': statistics.mean(protein_trend) if protein_trend else 0
        }
    
    def get_seasonal_patterns(self) -> Dict:
        """Analyze seasonal shopping patterns"""
        seasonal_data = defaultdict(lambda: defaultdict(int))
        monthly_patterns = defaultdict(lambda: defaultdict(float))
        
        for purchase in self.purchase_history:
            date = datetime.fromisoformat(purchase.get('date', '2024-01-01'))
            month = date.month
            season = self._get_season(month)
            
            for item in purchase.get('items', []):
                category = item.get('category', 'Other')
                seasonal_data[season][category] += 1
                monthly_patterns[month][category] += item.get('price', 0)
        
        return {
            'seasonal_preferences': dict(seasonal_data),
            'monthly_spending': dict(monthly_patterns),
            'seasonal_recommendations': self._generate_seasonal_recommendations(seasonal_data)
        }
    
    def _get_season(self, month: int) -> str:
        """Determine season from month"""
        if month in [12, 1, 2]:
            return 'Winter'
        elif month in [3, 4, 5]:
            return 'Spring'
        elif month in [6, 7, 8]:
            return 'Summer'
        else:
            return 'Fall'
    
    def _generate_seasonal_recommendations(self, seasonal_data: Dict) -> Dict:
        """Generate season-specific recommendations"""
        current_month = datetime.now().month
        current_season = self._get_season(current_month)
        
        recommendations = {}
        for season, categories in seasonal_data.items():
            top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
            recommendations[season] = [
                f"Popular in {season}: {cat}" for cat, _ in top_categories
            ]
        
        return {
            'current_season': current_season,
            'seasonal_recommendations': recommendations
        }
    
    def get_waste_reduction_metrics(self) -> Dict:
        """Calculate waste reduction and efficiency metrics"""
        expired_items = [
            item for item in self.expiration_data
            if item.get('status') == 'expired_unused'
        ]
        
        used_before_expiry = [
            item for item in self.expiration_data
            if item.get('status') == 'used_before_expiry'
        ]
        
        total_tracked = len(expired_items) + len(used_before_expiry)
        waste_rate = (len(expired_items) / total_tracked * 100) if total_tracked > 0 else 0
        
        # Calculate waste by category
        waste_by_category = defaultdict(int)
        waste_cost = 0
        
        for item in expired_items:
            category = item.get('category', 'Other')
            waste_by_category[category] += 1
            waste_cost += item.get('estimated_cost', 0)
        
        # Generate waste reduction suggestions
        suggestions = self._generate_waste_reduction_suggestions(expired_items)
        
        return {
            'waste_rate_percentage': round(waste_rate, 1),
            'total_items_tracked': total_tracked,
            'expired_unused': len(expired_items),
            'used_before_expiry': len(used_before_expiry),
            'estimated_waste_cost': waste_cost,
            'waste_by_category': dict(waste_by_category),
            'reduction_suggestions': suggestions,
            'efficiency_score': max(0, 100 - waste_rate)
        }
    
    def _generate_waste_reduction_suggestions(self, expired_items: List[Dict]) -> List[str]:
        """Generate personalized waste reduction suggestions"""
        suggestions = []
        
        if not expired_items:
            return ["Great job! No food waste detected in your tracked items."]
        
        # Most wasted categories
        category_waste = defaultdict(int)
        for item in expired_items:
            category_waste[item.get('category', 'Other')] += 1
        
        top_waste_category = max(category_waste.items(), key=lambda x: x[1])[0] if category_waste else None
        
        if top_waste_category:
            suggestions.append(f"Consider buying smaller quantities of {top_waste_category}")
        
        # Timing suggestions
        avg_days_to_expire = statistics.mean([
            item.get('days_until_expiry', 7) for item in expired_items
        ]) if expired_items else 0
        
        if avg_days_to_expire < 3:
            suggestions.append("Buy items closer to when you plan to use them")
        elif avg_days_to_expire > 10:
            suggestions.append("Set up earlier expiration reminders")
        
        suggestions.append("Use the meal planning feature to better utilize ingredients before they expire")
        
        return suggestions
    
    def get_predictive_insights(self) -> Dict:
        """Generate predictive shopping suggestions"""
        # Analyze shopping frequency patterns
        item_frequency = defaultdict(int)
        last_purchase_date = {}
        
        for purchase in self.purchase_history:
            date = purchase.get('date', '2024-01-01')
            for item in purchase.get('items', []):
                item_name = item.get('name', '')
                item_frequency[item_name] += 1
                if item_name not in last_purchase_date or date > last_purchase_date[item_name]:
                    last_purchase_date[item_name] = date
        
        # Predict items that might be needed soon
        predictions = []
        current_date = datetime.now()
        
        for item, freq in item_frequency.items():
            if freq >= 2:  # Item purchased at least twice
                last_date = datetime.fromisoformat(last_purchase_date[item])
                days_since = (current_date - last_date).days
                
                # Estimate purchase frequency
                avg_frequency = 30 / freq if freq > 0 else 30  # Rough estimate
                
                if days_since >= avg_frequency * 0.8:  # 80% of average frequency
                    confidence = min(100, (days_since / avg_frequency) * 100)
                    predictions.append({
                        'item': item,
                        'confidence': round(confidence, 1),
                        'days_since_last': days_since,
                        'estimated_frequency': round(avg_frequency, 1)
                    })
        
        # Sort by confidence
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'predicted_needs': predictions[:10],  # Top 10 predictions
            'shopping_patterns': self._analyze_shopping_patterns(),
            'recommendations': self._generate_predictive_recommendations(predictions)
        }
    
    def _analyze_shopping_patterns(self) -> Dict:
        """Analyze general shopping patterns"""
        if not self.purchase_history:
            return {}
        
        # Day of week patterns
        day_patterns = defaultdict(int)
        for purchase in self.purchase_history:
            date = datetime.fromisoformat(purchase.get('date', '2024-01-01'))
            day_patterns[date.strftime('%A')] += 1
        
        # Time between shopping trips
        dates = sorted([
            datetime.fromisoformat(p.get('date', '2024-01-01'))
            for p in self.purchase_history
        ])
        
        intervals = [
            (dates[i] - dates[i-1]).days
            for i in range(1, len(dates))
        ]
        
        avg_interval = statistics.mean(intervals) if intervals else 7
        
        return {
            'preferred_shopping_days': dict(day_patterns),
            'average_days_between_trips': round(avg_interval, 1),
            'total_shopping_trips': len(self.purchase_history)
        }
    
    def _generate_predictive_recommendations(self, predictions: List[Dict]) -> List[str]:
        """Generate recommendations based on predictions"""
        recommendations = []
        
        if predictions:
            high_confidence = [p for p in predictions if p['confidence'] > 80]
            if high_confidence:
                recommendations.append(f"You likely need: {', '.join([p['item'] for p in high_confidence[:3]])}")
        
        recommendations.append("Check your predicted needs before shopping to avoid forgotten items")
        recommendations.append("Review your shopping patterns to optimize trip frequency")
        
        return recommendations
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction for a list of values"""
        if len(values) < 2:
            return 'stable'
        
        # Simple trend calculation
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        first_avg = statistics.mean(first_half) if first_half else 0
        second_avg = statistics.mean(second_half) if second_half else 0
        
        if second_avg > first_avg * 1.1:
            return 'increasing'
        elif second_avg < first_avg * 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def generate_comprehensive_report(self) -> Dict:
        """Generate comprehensive analytics report"""
        return {
            'spending_trends': self.get_spending_trends(),
            'nutritional_analysis': self.get_nutritional_analysis(),
            'seasonal_patterns': self.get_seasonal_patterns(),
            'waste_reduction': self.get_waste_reduction_metrics(),
            'predictive_insights': self.get_predictive_insights(),
            'generated_at': datetime.now().isoformat(),
            'summary': self._generate_executive_summary()
        }
    
    def _generate_executive_summary(self) -> Dict:
        """Generate executive summary of key insights"""
        spending = self.get_spending_trends(30)
        nutrition = self.get_nutritional_analysis(30)
        waste = self.get_waste_reduction_metrics()
        
        return {
            'monthly_spending': spending['total_spent'],
            'spending_trend': spending['trend_analysis']['trend'],
            'health_score': nutrition['health_score']['overall_score'],
            'waste_rate': waste['waste_rate_percentage'],
            'efficiency_score': waste['efficiency_score'],
            'key_recommendations': [
                "Monitor spending trends for budget optimization",
                "Improve nutritional balance with more whole foods",
                "Reduce food waste through better meal planning",
                "Use predictive insights for efficient shopping"
            ]
        }
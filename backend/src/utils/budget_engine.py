#!/usr/bin/env python3
"""
Advanced Budget Management Engine

Provides comprehensive budget forecasting, spending analysis, price alerts,
bulk purchase recommendations, and financial goal tracking with intelligent
cost optimization and savings opportunities.

Features:
- Budget forecasting and trend analysis
- Spending category breakdown and optimization
- Price drop alerts and deal notifications  
- Bulk purchase cost-benefit analysis
- Financial goal tracking and recommendations
- Smart savings opportunities detection
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import math
from enum import Enum


class SpendingCategory(Enum):
    PRODUCE = "produce"
    DAIRY = "dairy"
    MEAT = "meat"
    PANTRY = "pantry"
    SNACKS = "snacks"
    BEVERAGES = "beverages"
    FROZEN = "frozen"
    BAKERY = "bakery"
    HOUSEHOLD = "household"
    PERSONAL_CARE = "personal_care"


@dataclass
class BudgetGoal:
    category: str
    target_amount: float
    time_period: str  # 'weekly', 'monthly', 'yearly'
    current_spent: float = 0.0
    start_date: datetime = None
    
    def get_remaining_budget(self) -> float:
        return max(0, self.target_amount - self.current_spent)
    
    def get_utilization_percentage(self) -> float:
        return (self.current_spent / self.target_amount) * 100 if self.target_amount > 0 else 0


@dataclass
class SpendingTransaction:
    item: str
    category: SpendingCategory
    amount: float
    date: datetime
    store: str
    quantity: int = 1
    unit_price: float = None
    
    def __post_init__(self):
        if self.unit_price is None:
            self.unit_price = self.amount / self.quantity if self.quantity > 0 else self.amount


@dataclass
class PriceAlert:
    item: str
    target_price: float
    current_price: float
    store: str
    savings_amount: float
    alert_type: str  # 'price_drop', 'bulk_deal', 'seasonal_discount'
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


class BudgetManagementEngine:
    """Advanced budget management and financial optimization engine."""
    
    def __init__(self):
        # Sample transaction history for demo
        self.transaction_history = self._generate_sample_transactions()
        
        # Sample budget goals
        self.budget_goals = {
            'produce': BudgetGoal('produce', 80.0, 'weekly', 45.30),
            'dairy': BudgetGoal('dairy', 40.0, 'weekly', 28.50),
            'meat': BudgetGoal('meat', 100.0, 'weekly', 75.20),
            'pantry': BudgetGoal('pantry', 60.0, 'weekly', 42.10),
            'total': BudgetGoal('total', 350.0, 'weekly', 245.80)
        }
        
        # Price history for alerts (item -> store -> price history)
        self.price_history = self._generate_price_history()
        
        # Bulk purchase thresholds
        self.bulk_thresholds = {
            'rice': {'min_qty': 5, 'discount_rate': 0.15},
            'pasta': {'min_qty': 6, 'discount_rate': 0.12},
            'cereal': {'min_qty': 4, 'discount_rate': 0.10},
            'canned_goods': {'min_qty': 8, 'discount_rate': 0.18},
            'frozen_vegetables': {'min_qty': 10, 'discount_rate': 0.20}
        }

    def _generate_sample_transactions(self) -> List[SpendingTransaction]:
        """Generate sample transaction data for demo purposes."""
        base_date = datetime.now() - timedelta(days=30)
        transactions = []
        
        sample_data = [
            ('banana', SpendingCategory.PRODUCE, 3.50, 'FreshMart', 2),
            ('milk', SpendingCategory.DAIRY, 4.20, 'GroceryPlus', 1),
            ('chicken breast', SpendingCategory.MEAT, 12.80, 'MeatShop', 1),
            ('bread', SpendingCategory.BAKERY, 2.50, 'BreadCo', 1),
            ('rice', SpendingCategory.PANTRY, 8.90, 'BulkStore', 3),
            ('apples', SpendingCategory.PRODUCE, 6.40, 'FreshMart', 2),
            ('cheese', SpendingCategory.DAIRY, 7.30, 'GroceryPlus', 1),
            ('ground beef', SpendingCategory.MEAT, 9.60, 'MeatShop', 1),
            ('pasta', SpendingCategory.PANTRY, 4.80, 'ItalianMarket', 3),
            ('yogurt', SpendingCategory.DAIRY, 5.50, 'HealthFood', 2)
        ]
        
        for i, (item, category, amount, store, qty) in enumerate(sample_data):
            date = base_date + timedelta(days=i * 2)
            transactions.append(SpendingTransaction(
                item=item,
                category=category,
                amount=amount,
                date=date,
                store=store,
                quantity=qty
            ))
        
        return transactions

    def _generate_price_history(self) -> Dict[str, Dict[str, List[Tuple[datetime, float]]]]:
        """Generate sample price history for price drop detection."""
        return {
            'milk': {
                'GroceryPlus': [
                    (datetime.now() - timedelta(days=7), 4.50),
                    (datetime.now() - timedelta(days=3), 4.20),
                    (datetime.now(), 3.90)
                ],
                'FreshMart': [
                    (datetime.now() - timedelta(days=7), 4.30),
                    (datetime.now() - timedelta(days=3), 4.10),
                    (datetime.now(), 4.00)
                ]
            },
            'bread': {
                'BreadCo': [
                    (datetime.now() - timedelta(days=5), 2.80),
                    (datetime.now() - timedelta(days=2), 2.50),
                    (datetime.now(), 2.20)
                ]
            }
        }

    def forecast_budget_needs(self, time_period: str = 'monthly') -> Dict[str, Any]:
        """Forecast budget needs based on historical spending patterns."""
        if not self.transaction_history:
            return {'error': 'No transaction history available'}
        
        # Calculate average spending by category
        category_totals = {}
        for transaction in self.transaction_history:
            category = transaction.category.value
            if category not in category_totals:
                category_totals[category] = []
            category_totals[category].append(transaction.amount)
        
        # Calculate forecasts
        forecasts = {}
        multiplier = 4.33 if time_period == 'monthly' else 52 if time_period == 'yearly' else 1
        
        for category, amounts in category_totals.items():
            avg_weekly = sum(amounts) / len(amounts)
            forecast_amount = avg_weekly * multiplier
            
            forecasts[category] = {
                'forecast_amount': round(forecast_amount, 2),
                'confidence': min(95, 70 + len(amounts) * 2),  # Higher confidence with more data
                'trend': 'stable',  # Simplified for demo
                'historical_average': round(avg_weekly, 2)
            }
        
        total_forecast = sum(f['forecast_amount'] for f in forecasts.values())
        
        return {
            'period': time_period,
            'total_forecast': round(total_forecast, 2),
            'category_forecasts': forecasts,
            'recommendations': self._generate_forecast_recommendations(forecasts, total_forecast)
        }

    def analyze_spending_patterns(self) -> Dict[str, Any]:
        """Analyze spending patterns and identify optimization opportunities."""
        if not self.transaction_history:
            return {'error': 'No transaction history available'}
        
        # Category breakdown
        category_analysis = {}
        store_analysis = {}
        total_spent = 0
        
        for transaction in self.transaction_history:
            category = transaction.category.value
            store = transaction.store
            
            # Category analysis
            if category not in category_analysis:
                category_analysis[category] = {
                    'total': 0,
                    'transactions': 0,
                    'avg_per_transaction': 0,
                    'items': set()
                }
            
            category_analysis[category]['total'] += transaction.amount
            category_analysis[category]['transactions'] += 1
            category_analysis[category]['items'].add(transaction.item)
            total_spent += transaction.amount
            
            # Store analysis
            if store not in store_analysis:
                store_analysis[store] = {'total': 0, 'transactions': 0}
            store_analysis[store]['total'] += transaction.amount
            store_analysis[store]['transactions'] += 1
        
        # Calculate percentages and averages
        for category in category_analysis:
            data = category_analysis[category]
            data['percentage'] = round((data['total'] / total_spent) * 100, 1)
            data['avg_per_transaction'] = round(data['total'] / data['transactions'], 2)
            data['items'] = list(data['items'])  # Convert set to list for JSON serialization
        
        for store in store_analysis:
            data = store_analysis[store]
            data['percentage'] = round((data['total'] / total_spent) * 100, 1)
            data['avg_per_visit'] = round(data['total'] / data['transactions'], 2)
        
        # Identify top categories and stores
        top_categories = sorted(category_analysis.items(), 
                              key=lambda x: x[1]['total'], reverse=True)[:3]
        top_stores = sorted(store_analysis.items(), 
                           key=lambda x: x[1]['total'], reverse=True)[:3]
        
        return {
            'total_spent': round(total_spent, 2),
            'category_breakdown': category_analysis,
            'store_breakdown': store_analysis,
            'top_spending_categories': [{'name': cat, **data} for cat, data in top_categories],
            'top_stores': [{'name': store, **data} for store, data in top_stores],
            'optimization_opportunities': self._identify_optimization_opportunities(category_analysis, store_analysis)
        }

    def detect_price_drops(self) -> List[PriceAlert]:
        """Detect price drops and generate alerts."""
        alerts = []
        
        for item, store_data in self.price_history.items():
            for store, price_history in store_data.items():
                if len(price_history) >= 2:
                    current_price = price_history[-1][1]
                    previous_price = price_history[-2][1]
                    
                    if current_price < previous_price:
                        savings = previous_price - current_price
                        savings_percentage = (savings / previous_price) * 100
                        
                        if savings_percentage >= 10:  # Alert for 10%+ price drops
                            alerts.append(PriceAlert(
                                item=item,
                                target_price=previous_price,
                                current_price=current_price,
                                store=store,
                                savings_amount=savings,
                                alert_type='price_drop'
                            ))
        
        return alerts

    def recommend_bulk_purchases(self, shopping_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Recommend bulk purchases for cost savings."""
        recommendations = []
        
        for item_data in shopping_list:
            item = item_data.get('name', '').lower()
            quantity = item_data.get('quantity', 1)
            
            # Check if item has bulk discount potential
            bulk_item = None
            for bulk_key in self.bulk_thresholds:
                if bulk_key in item:
                    bulk_item = bulk_key
                    break
            
            if bulk_item:
                threshold = self.bulk_thresholds[bulk_item]
                min_qty = threshold['min_qty']
                discount_rate = threshold['discount_rate']
                
                if quantity >= min_qty:
                    # Calculate potential savings
                    base_price = 5.00  # Simplified demo price
                    bulk_price = base_price * (1 - discount_rate)
                    total_savings = (base_price - bulk_price) * quantity
                    
                    recommendations.append({
                        'item': item_data['name'],
                        'current_quantity': quantity,
                        'bulk_quantity': max(quantity, min_qty),
                        'regular_price': base_price,
                        'bulk_price': bulk_price,
                        'total_savings': round(total_savings, 2),
                        'discount_percentage': round(discount_rate * 100, 1),
                        'recommendation': f"Buy {min_qty}+ units for {discount_rate*100:.1f}% discount"
                    })
        
        return recommendations

    def track_budget_goals(self) -> Dict[str, Any]:
        """Track progress against budget goals."""
        goal_status = {}
        
        for goal_name, goal in self.budget_goals.items():
            remaining = goal.get_remaining_budget()
            utilization = goal.get_utilization_percentage()
            
            # Determine status
            if utilization <= 70:
                status = 'on_track'
            elif utilization <= 90:
                status = 'warning'
            else:
                status = 'over_budget'
            
            goal_status[goal_name] = {
                'target': goal.target_amount,
                'spent': goal.current_spent,
                'remaining': remaining,
                'utilization_percentage': round(utilization, 1),
                'status': status,
                'time_period': goal.time_period,
                'recommendations': self._get_budget_recommendations(goal, utilization)
            }
        
        return goal_status

    def generate_savings_opportunities(self) -> List[Dict[str, Any]]:
        """Identify and generate savings opportunities."""
        opportunities = []
        
        # Price comparison opportunities
        for item, store_data in self.price_history.items():
            if len(store_data) > 1:
                prices = [(store, price_list[-1][1]) for store, price_list in store_data.items()]
                prices.sort(key=lambda x: x[1])
                
                if len(prices) >= 2:
                    cheapest = prices[0]
                    most_expensive = prices[-1]
                    savings = most_expensive[1] - cheapest[1]
                    
                    if savings > 0.50:  # Alert for $0.50+ savings
                        opportunities.append({
                            'type': 'store_comparison',
                            'item': item,
                            'best_store': cheapest[0],
                            'best_price': cheapest[1],
                            'highest_price': most_expensive[1],
                            'potential_savings': round(savings, 2),
                            'recommendation': f"Buy {item} at {cheapest[0]} to save ${savings:.2f}"
                        })
        
        # Bulk purchase opportunities
        opportunities.extend([
            {
                'type': 'bulk_purchase',
                'item': item,
                'discount': f"{data['discount_rate']*100:.1f}%",
                'min_quantity': data['min_qty'],
                'recommendation': f"Buy {data['min_qty']}+ {item} for {data['discount_rate']*100:.1f}% discount"
            }
            for item, data in self.bulk_thresholds.items()
        ])
        
        # Budget optimization opportunities
        spending_analysis = self.analyze_spending_patterns()
        if 'optimization_opportunities' in spending_analysis:
            opportunities.extend(spending_analysis['optimization_opportunities'])
        
        return opportunities

    def _generate_forecast_recommendations(self, forecasts: Dict, total_forecast: float) -> List[str]:
        """Generate recommendations based on budget forecasts."""
        recommendations = []
        
        if total_forecast > 400:
            recommendations.append("Consider setting a monthly budget limit to control spending")
        
        # Find highest spending category
        highest_category = max(forecasts.items(), key=lambda x: x[1]['forecast_amount'])
        recommendations.append(f"Focus on optimizing {highest_category[0]} spending (${highest_category[1]['forecast_amount']:.2f} forecasted)")
        
        recommendations.append("Look for bulk purchase opportunities to reduce costs")
        
        return recommendations

    def _identify_optimization_opportunities(self, category_analysis: Dict, store_analysis: Dict) -> List[Dict[str, Any]]:
        """Identify spending optimization opportunities."""
        opportunities = []
        
        # High-spending category optimization
        for category, data in category_analysis.items():
            if data['percentage'] > 25:  # Categories taking >25% of budget
                opportunities.append({
                    'type': 'category_optimization',
                    'category': category,
                    'current_spending': data['total'],
                    'percentage': data['percentage'],
                    'recommendation': f"Consider reducing {category} spending or finding better deals"
                })
        
        # Store consolidation opportunities
        if len(store_analysis) > 3:
            opportunities.append({
                'type': 'store_consolidation',
                'recommendation': f"You shop at {len(store_analysis)} stores. Consider consolidating to 2-3 stores for better deals and efficiency"
            })
        
        return opportunities

    def _get_budget_recommendations(self, goal: BudgetGoal, utilization: float) -> List[str]:
        """Get recommendations based on budget goal status."""
        recommendations = []
        
        if utilization > 90:
            recommendations.append("Budget almost exhausted - consider reducing spending this period")
            recommendations.append("Look for alternative cheaper options")
        elif utilization > 70:
            recommendations.append("Approaching budget limit - monitor spending closely")
        else:
            recommendations.append("On track with budget - maintain current spending patterns")
        
        return recommendations
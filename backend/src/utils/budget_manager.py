from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from ..models.grocery_item import GroceryItem
from ..models.purchase_history import PurchaseHistory

class BudgetManager:
    """
    Manages budget tracking, spending limits, and cost analytics
    """
    
    def __init__(self):
        self.default_monthly_budget = 300.0  # Default monthly grocery budget
        self.category_budget_percentages = {
            'fruits': 0.15,      # 15% of budget
            'vegetables': 0.20,  # 20% of budget
            'protein': 0.25,     # 25% of budget
            'dairy': 0.15,       # 15% of budget
            'grains': 0.10,      # 10% of budget
            'snacks': 0.10,      # 10% of budget
            'other': 0.05        # 5% of budget
        }
        
    def set_monthly_budget(self, amount: float) -> Dict[str, any]:
        """
        Set monthly grocery budget
        """
        if amount <= 0:
            return {'success': False, 'message': 'Budget amount must be positive'}
        
        self.default_monthly_budget = amount
        
        # Calculate category budgets
        category_budgets = {}
        for category, percentage in self.category_budget_percentages.items():
            category_budgets[category] = round(amount * percentage, 2)
        
        return {
            'success': True,
            'monthly_budget': amount,
            'category_budgets': category_budgets,
            'message': f'Monthly budget set to ${amount:.2f}'
        }
    
    def get_spending_summary(self, purchase_history: PurchaseHistory, 
                           days: int = 30) -> Dict[str, any]:
        """
        Get spending summary for the specified period
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get purchases within date range
        recent_purchases = [
            item for item in purchase_history.items
            if hasattr(item, 'purchase_date') and item.purchase_date and
               start_date <= item.purchase_date <= end_date
        ]
        
        if not recent_purchases:
            return {
                'total_spent': 0.0,
                'category_spending': {},
                'daily_spending': {},
                'budget_status': 'no_data',
                'message': 'No purchases found in the specified period'
            }
        
        # Calculate total spending
        total_spent = sum(item.price * item.quantity for item in recent_purchases)
        
        # Calculate spending by category
        category_spending = {}
        for item in recent_purchases:
            category = item.category.lower()
            if category not in category_spending:
                category_spending[category] = 0.0
            category_spending[category] += item.price * item.quantity
        
        # Calculate daily spending
        daily_spending = {}
        for item in recent_purchases:
            date_key = item.purchase_date.strftime('%Y-%m-%d')
            if date_key not in daily_spending:
                daily_spending[date_key] = 0.0
            daily_spending[date_key] += item.price * item.quantity
        
        # Calculate budget status
        monthly_budget = self.default_monthly_budget
        if days == 30:
            budget_percentage = (total_spent / monthly_budget) * 100
        else:
            # Prorate budget for different periods
            prorated_budget = (monthly_budget / 30) * days
            budget_percentage = (total_spent / prorated_budget) * 100
        
        return {
            'total_spent': round(total_spent, 2),
            'category_spending': {k: round(v, 2) for k, v in category_spending.items()},
            'daily_spending': {k: round(v, 2) for k, v in daily_spending.items()},
            'budget_percentage': round(budget_percentage, 1),
            'budget_status': self._get_budget_status(budget_percentage),
            'days_analyzed': days,
            'average_daily_spend': round(total_spent / max(days, 1), 2)
        }
    
    def check_budget_alerts(self, purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Check for budget-related alerts and warnings
        """
        alerts = []
        
        # Check monthly spending
        monthly_summary = self.get_spending_summary(purchase_history, 30)
        budget_percentage = monthly_summary.get('budget_percentage', 0)
        
        if budget_percentage >= 90:
            alerts.append({
                'type': 'budget_exceeded',
                'severity': 'high',
                'message': f"⚠️ You've spent {budget_percentage:.1f}% of your monthly budget!",
                'amount_spent': monthly_summary['total_spent'],
                'budget_limit': self.default_monthly_budget,
                'suggestion': 'Consider postponing non-essential purchases'
            })
        elif budget_percentage >= 75:
            alerts.append({
                'type': 'budget_warning',
                'severity': 'medium',
                'message': f"📊 You've used {budget_percentage:.1f}% of your monthly budget",
                'amount_spent': monthly_summary['total_spent'],
                'budget_limit': self.default_monthly_budget,
                'suggestion': 'Monitor spending for the rest of the month'
            })
        
        # Check category overspending
        category_spending = monthly_summary.get('category_spending', {})
        for category, spent in category_spending.items():
            category_budget = self.default_monthly_budget * self.category_budget_percentages.get(category, 0.05)
            if spent > category_budget:
                overspend_percentage = ((spent - category_budget) / category_budget) * 100
                alerts.append({
                    'type': 'category_overspend',
                    'severity': 'medium',
                    'category': category,
                    'message': f"💰 {category.title()} spending is {overspend_percentage:.1f}% over budget",
                    'amount_spent': spent,
                    'category_budget': category_budget,
                    'suggestion': f'Look for cheaper alternatives in {category} category'
                })
        
        return alerts
    
    def suggest_cost_optimizations(self, purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Suggest ways to optimize costs based on spending patterns
        """
        suggestions = []
        
        # Analyze recent purchases for optimization opportunities
        recent_purchases = purchase_history.get_recent_purchases(30)
        
        if not recent_purchases:
            return suggestions
        
        # Find expensive items
        expensive_items = [
            item for item in recent_purchases 
            if item.price > 10.0  # Items over $10
        ]
        
        if expensive_items:
            suggestions.append({
                'type': 'expensive_items',
                'message': 'Consider cheaper alternatives for high-cost items',
                'items': [{'name': item.name, 'price': item.price} for item in expensive_items[:3]],
                'potential_savings': sum(item.price * 0.2 for item in expensive_items)  # Assume 20% savings
            })
        
        # Find frequently bought items for bulk purchase suggestions
        item_frequency = {}
        for item in recent_purchases:
            if item.name not in item_frequency:
                item_frequency[item.name] = 0
            item_frequency[item.name] += item.quantity
        
        frequent_items = [
            {'name': name, 'frequency': freq}
            for name, freq in item_frequency.items()
            if freq >= 3  # Bought 3+ times in 30 days
        ]
        
        if frequent_items:
            suggestions.append({
                'type': 'bulk_purchase',
                'message': 'Consider buying frequently purchased items in bulk',
                'items': frequent_items[:3],
                'potential_savings': len(frequent_items) * 2.5  # Estimate $2.5 savings per item
            })
        
        # Suggest organic vs regular cost analysis
        organic_items = [item for item in recent_purchases if item.is_organic]
        if organic_items:
            organic_cost = sum(item.price * item.quantity for item in organic_items)
            suggestions.append({
                'type': 'organic_analysis',
                'message': 'Review organic vs regular item costs',
                'organic_spending': organic_cost,
                'potential_savings': organic_cost * 0.3,  # Assume 30% savings on regular items
                'suggestion': 'Consider mixing organic and regular items based on priority'
            })
        
        return suggestions
    
    def get_price_per_unit_analysis(self, purchase_history: PurchaseHistory) -> List[Dict[str, any]]:
        """
        Analyze price per unit for better value recommendations
        """
        recent_purchases = purchase_history.get_recent_purchases(60)  # Last 2 months
        
        # Group items by name for price comparison
        item_prices = {}
        for item in recent_purchases:
            if item.name not in item_prices:
                item_prices[item.name] = []
            
            # Calculate price per unit
            price_per_unit = item.price / max(item.quantity, 1)
            item_prices[item.name].append({
                'date': item.purchase_date,
                'price_per_unit': price_per_unit,
                'unit': item.unit,
                'quantity': item.quantity,
                'total_price': item.price
            })
        
        # Find items with price variations
        price_analysis = []
        for item_name, prices in item_prices.items():
            if len(prices) > 1:
                unit_prices = [p['price_per_unit'] for p in prices]
                min_price = min(unit_prices)
                max_price = max(unit_prices)
                price_variance = max_price - min_price
                
                if price_variance > 0.50:  # Significant price difference
                    price_analysis.append({
                        'item': item_name,
                        'min_price_per_unit': min_price,
                        'max_price_per_unit': max_price,
                        'price_variance': price_variance,
                        'savings_opportunity': price_variance * 5,  # Assume buying 5 units
                        'recommendation': 'Look for better deals or buy when price is lower'
                    })
        
        return sorted(price_analysis, key=lambda x: x['price_variance'], reverse=True)[:5]
    
    def _get_budget_status(self, percentage: float) -> str:
        """
        Get budget status based on percentage spent
        """
        if percentage >= 100:
            return 'over_budget'
        elif percentage >= 90:
            return 'near_limit'
        elif percentage >= 75:
            return 'high_usage'
        elif percentage >= 50:
            return 'moderate_usage'
        else:
            return 'low_usage'
    
    def get_budget_recommendations(self, purchase_history: PurchaseHistory) -> List[str]:
        """
        Get personalized budget recommendations
        """
        recommendations = []
        
        spending_summary = self.get_spending_summary(purchase_history, 30)
        budget_status = spending_summary.get('budget_status', 'no_data')
        
        if budget_status == 'over_budget':
            recommendations.extend([
                "Consider meal planning to reduce food waste",
                "Look for sales and use coupons for regular items",
                "Buy generic brands instead of name brands",
                "Reduce eating out and cook more at home"
            ])
        elif budget_status == 'near_limit':
            recommendations.extend([
                "Stick to your shopping list to avoid impulse purchases",
                "Compare prices across different stores",
                "Buy seasonal produce for better prices"
            ])
        elif budget_status == 'low_usage':
            recommendations.extend([
                "Consider increasing your fresh produce budget",
                "Invest in higher quality, longer-lasting items",
                "Stock up on non-perishables when on sale"
            ])
        
        # Category-specific recommendations
        category_spending = spending_summary.get('category_spending', {})
        total_spent = spending_summary.get('total_spent', 0)
        
        if total_spent > 0:
            for category, amount in category_spending.items():
                percentage = (amount / total_spent) * 100
                if percentage > 30:
                    recommendations.append(f"Consider reducing {category} spending - it's {percentage:.1f}% of your total budget")
        
        return recommendations[:5]  # Return top 5 recommendations
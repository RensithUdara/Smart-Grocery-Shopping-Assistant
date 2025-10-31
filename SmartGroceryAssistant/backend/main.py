#!/usr/bin/env python3
"""
Smart Grocery Shopping Assistant
Main CLI Application

A comprehensive grocery shopping assistant that helps users manage their shopping lists,
suggests items based on purchase patterns, recommends healthier alternatives, and tracks
expiring products.

Author: CS 6340 Mini Project
Date: November 2025
"""

import os
import sys
from datetime import datetime
from typing import List, Optional

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.grocery_item import GroceryItem
from src.models.shopping_list import ShoppingList
from src.models.purchase_history import PurchaseHistory
from src.engines.rule_engine import RuleEngine
from src.engines.recommendation_engine import RecommendationEngine
from src.utils.data_manager import DataManager
from src.utils.expiration_tracker import ExpirationTracker

class SmartGroceryAssistant:
    """
    Main application class for the Smart Grocery Shopping Assistant
    """
    
    def __init__(self):
        # Initialize components
        self.data_manager = DataManager()
        self.rule_engine = RuleEngine()
        self.recommendation_engine = RecommendationEngine()
        self.expiration_tracker = ExpirationTracker()
        
        # Load existing data
        self.shopping_list = self.data_manager.load_shopping_list()
        self.purchase_history = self.data_manager.load_purchase_history()
        self.user_preferences = self.data_manager.load_user_preferences()
        
        # App state
        self.running = True
        
        print("🛒 Smart Grocery Shopping Assistant")
        print("=" * 50)
        print("Welcome to your intelligent grocery shopping companion!")
        print()
    
    def run(self):
        """
        Main application loop
        """
        while self.running:
            try:
                self.show_main_menu()
                choice = input("\nEnter your choice (1-9): ").strip()
                
                if choice == '1':
                    self.view_shopping_list()
                elif choice == '2':
                    self.add_item_to_list()
                elif choice == '3':
                    self.remove_item_from_list()
                elif choice == '4':
                    self.get_smart_suggestions()
                elif choice == '5':
                    self.check_expiring_items()
                elif choice == '6':
                    self.get_healthy_alternatives()
                elif choice == '7':
                    self.view_purchase_history()
                elif choice == '8':
                    self.show_settings_menu()
                elif choice == '9':
                    self.exit_application()
                else:
                    print("❌ Invalid choice. Please enter a number between 1-9.")
                
                if self.running:
                    input("\nPress Enter to continue...")
                    
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                self.running = False
            except Exception as e:
                print(f"❌ An error occurred: {e}")
                input("Press Enter to continue...")
    
    def show_main_menu(self):
        """
        Display the main menu options
        """
        print("\n" + "="*50)
        print("📋 MAIN MENU")
        print("="*50)
        print("1. 📝 View Shopping List")
        print("2. ➕ Add Item to List")
        print("3. ➖ Remove Item from List")
        print("4. 🤖 Get Smart Suggestions")
        print("5. ⏰ Check Expiring Items")
        print("6. 🥗 Get Healthy Alternatives")
        print("7. 📊 View Purchase History")
        print("8. ⚙️  Settings")
        print("9. 🚪 Exit")
        print("="*50)
    
    def view_shopping_list(self):
        """
        Display current shopping list
        """
        print("\n📝 CURRENT SHOPPING LIST")
        print("="*40)
        
        if not self.shopping_list.items:
            print("Your shopping list is empty.")
            print("\n💡 Tip: Use option 2 to add items or option 4 for smart suggestions!")
            return
        
        print(str(self.shopping_list))
        
        # Show quick stats
        print(f"\n📊 Summary:")
        print(f"   • Total items: {self.shopping_list.item_count}")
        print(f"   • Total quantity: {self.shopping_list.total_quantity}")
        
        # Show health score if items exist
        health_rating = self.recommendation_engine.rate_shopping_list_healthiness(self.shopping_list)
        print(f"   • Health score: {health_rating['overall_score']}/10 (Grade: {health_rating['health_grade']})")
    
    def add_item_to_list(self):
        """
        Add new item to shopping list
        """
        print("\n➕ ADD ITEM TO SHOPPING LIST")
        print("="*40)
        
        try:
            # Get item details
            name = input("Enter item name: ").strip()
            if not name:
                print("❌ Item name cannot be empty.")
                return
            
            category = input("Enter category (e.g., dairy, fruits, vegetables): ").strip()
            if not category:
                category = "other"
            
            quantity_str = input("Enter quantity (default: 1): ").strip()
            try:
                quantity = int(quantity_str) if quantity_str else 1
                if quantity <= 0:
                    print("❌ Quantity must be positive.")
                    return
            except ValueError:
                print("❌ Invalid quantity. Using default (1).")
                quantity = 1
            
            unit = input("Enter unit (e.g., pieces, kg, liters) [default: pieces]: ").strip()
            if not unit:
                unit = "pieces"
            
            # Ask about organic preference
            organic_input = input("Is this organic? (y/N): ").strip().lower()
            is_organic = organic_input in ['y', 'yes']
            
            # Create grocery item
            item = GroceryItem(
                name=name,
                category=category,
                quantity=quantity,
                unit=unit,
                is_organic=is_organic
            )
            
            # Add to shopping list
            success = self.shopping_list.add_item(item)
            
            if success:
                print(f"✅ Added '{item.name}' to your shopping list!")
                
                # Get healthy alternatives suggestion
                alternative = self.recommendation_engine.get_healthy_alternative(item.name)
                if alternative:
                    print(f"\n💡 Health Tip: {alternative['reason']}")
                    print(f"   Consider: {', '.join(alternative['alternatives'][:2])}")
                
                # Save changes
                self.data_manager.save_shopping_list(self.shopping_list)
            else:
                print("❌ Failed to add item to shopping list.")
                
        except Exception as e:
            print(f"❌ Error adding item: {e}")
    
    def remove_item_from_list(self):
        """
        Remove item from shopping list
        """
        print("\n➖ REMOVE ITEM FROM SHOPPING LIST")
        print("="*40)
        
        if not self.shopping_list.items:
            print("Your shopping list is empty.")
            return
        
        # Show current items with numbers
        print("Current items:")
        for i, item in enumerate(self.shopping_list.items, 1):
            print(f"{i}. {item}")
        
        try:
            choice = input("\nEnter item number to remove (or item name): ").strip()
            
            # Try to parse as number first
            try:
                item_index = int(choice) - 1
                if 0 <= item_index < len(self.shopping_list.items):
                    item_to_remove = self.shopping_list.items[item_index]
                    success = self.shopping_list.remove_item(item_to_remove.name, item_to_remove.category)
                else:
                    print("❌ Invalid item number.")
                    return
            except ValueError:
                # Try to remove by name
                success = self.shopping_list.remove_item(choice)
            
            if success:
                print(f"✅ Item removed from shopping list!")
                self.data_manager.save_shopping_list(self.shopping_list)
            else:
                print("❌ Item not found in shopping list.")
                
        except Exception as e:
            print(f"❌ Error removing item: {e}")
    
    def get_smart_suggestions(self):
        """
        Get intelligent shopping suggestions
        """
        print("\n🤖 SMART SUGGESTIONS")
        print("="*40)
        
        # Generate suggestions
        suggestions = self.rule_engine.generate_suggestions(self.shopping_list, self.purchase_history)
        
        if not suggestions:
            print("No suggestions available at the moment.")
            print("\n💡 Tips to get better suggestions:")
            print("   • Add some items to your shopping list")
            print("   • Build up your purchase history")
            print("   • Try adding items from different categories")
            return
        
        print(f"Here are {len(suggestions)} smart suggestions for you:")
        print()
        
        for i, suggestion in enumerate(suggestions, 1):
            confidence_bar = "●" * int(suggestion['confidence'] * 10)
            print(f"{i}. {suggestion['name'].title()} ({suggestion['category']})")
            print(f"   💡 {suggestion['reason']}")
            print(f"   📊 Confidence: {confidence_bar} ({suggestion['confidence']:.1f})")
            print()
        
        # Ask if user wants to add any suggestions
        add_choice = input("Would you like to add any of these to your shopping list? (y/N): ").strip().lower()
        
        if add_choice in ['y', 'yes']:
            try:
                numbers = input("Enter suggestion numbers to add (e.g., 1,3,5): ").strip()
                if numbers:
                    selected_indices = [int(x.strip()) - 1 for x in numbers.split(',')]
                    
                    added_count = 0
                    for index in selected_indices:
                        if 0 <= index < len(suggestions):
                            suggestion = suggestions[index]
                            item = GroceryItem(
                                name=suggestion['name'],
                                category=suggestion['category']
                            )
                            
                            if self.shopping_list.add_item(item):
                                added_count += 1
                    
                    if added_count > 0:
                        print(f"✅ Added {added_count} items to your shopping list!")
                        self.data_manager.save_shopping_list(self.shopping_list)
                    else:
                        print("❌ No items were added.")
                        
            except Exception as e:
                print(f"❌ Error adding suggestions: {e}")
    
    def check_expiring_items(self):
        """
        Check for expiring items and show reminders
        """
        print("\n⏰ EXPIRING ITEMS CHECK")
        print("="*40)
        
        reminders = self.expiration_tracker.get_expiration_reminders(self.purchase_history)
        
        if not reminders:
            print("🎉 Great! No items are expiring soon.")
            print("\n💡 Tip: This feature tracks items from your purchase history.")
            return
        
        # Group reminders by priority
        high_priority = [r for r in reminders if r['priority'] == 'HIGH']
        medium_priority = [r for r in reminders if r['priority'] == 'MEDIUM']
        low_priority = [r for r in reminders if r['priority'] == 'LOW']
        
        if high_priority:
            print("🚨 HIGH PRIORITY - Action Required:")
            for reminder in high_priority:
                print(f"   {reminder['message']}")
                if 'suggestions' in reminder:
                    print(f"   💡 Suggestions: {', '.join(reminder['suggestions'][:2])}")
            print()
        
        if medium_priority:
            print("⚠️  MEDIUM PRIORITY - Plan Ahead:")
            for reminder in medium_priority:
                print(f"   {reminder['message']}")
            print()
        
        if low_priority:
            print("📝 LOW PRIORITY - Keep in Mind:")
            for reminder in low_priority:
                print(f"   {reminder['message']}")
            print()
        
        # Show meal planning suggestions if there are expiring items
        expiring_items = [r['item'] for r in reminders if r['priority'] in ['HIGH', 'MEDIUM']]
        if expiring_items:
            meal_suggestions = self.expiration_tracker.suggest_meal_planning(expiring_items)
            
            if meal_suggestions:
                print("🍽️  MEAL PLANNING SUGGESTIONS:")
                for meal in meal_suggestions:
                    print(f"   • {meal['title']} ({meal['meal_type']})")
                    print(f"     {meal['description']} - {meal['prep_time']}")
    
    def get_healthy_alternatives(self):
        """
        Show healthy alternatives for current shopping list
        """
        print("\n🥗 HEALTHY ALTERNATIVES")
        print("="*40)
        
        if not self.shopping_list.items:
            print("Your shopping list is empty.")
            print("Add some items first to get healthy alternative suggestions!")
            return
        
        suggestions = self.recommendation_engine.suggest_healthier_shopping_list(self.shopping_list)
        
        if not suggestions:
            print("🎉 Great! Your shopping list already consists of healthy choices.")
            
            # Show current health rating
            health_rating = self.recommendation_engine.rate_shopping_list_healthiness(self.shopping_list)
            print(f"\n📊 Health Analysis:")
            print(f"   • Overall Score: {health_rating['overall_score']}/10")
            print(f"   • Health Grade: {health_rating['health_grade']}")
            
            for recommendation in health_rating['recommendations']:
                print(f"   • {recommendation}")
            return
        
        print("Here are some healthier alternatives for your shopping list:")
        print()
        
        for i, suggestion in enumerate(suggestions[:5], 1):  # Show top 5
            original = suggestion['original_item']
            recommendation = suggestion['recommendation']
            
            print(f"{i}. Instead of: {original.name.title()}")
            print(f"   Consider: {', '.join(recommendation['alternatives'][:2])}")
            print(f"   💡 Why: {recommendation['reason']}")
            print(f"   🏥 Health Impact: {recommendation['health_score']}/10")
            print()
        
        # Show nutrient boosters
        nutrient_boosters = self.recommendation_engine.suggest_nutrient_boosters(self.shopping_list)
        
        if nutrient_boosters:
            print("🌟 NUTRIENT BOOSTERS:")
            print("Consider adding these items to boost your nutrition:")
            
            for booster in nutrient_boosters[:3]:  # Top 3
                print(f"   • {booster['item'].title()} - {booster['reason']}")
    
    def view_purchase_history(self):
        """
        View purchase history and analytics
        """
        print("\n📊 PURCHASE HISTORY & ANALYTICS")
        print("="*40)
        
        if not self.purchase_history.all_purchases:
            print("No purchase history available.")
            print("\n💡 Tip: Purchase history is built automatically as you use the app.")
            print("   You can also simulate some purchases in the settings menu.")
            return
        
        # Show summary stats
        stats = self.purchase_history.get_summary_stats()
        
        print(f"📈 Summary Statistics:")
        print(f"   • Total purchases: {stats['total_purchases']}")
        print(f"   • Unique items: {stats['unique_items']}")
        print(f"   • Categories shopped: {stats['categories']}")
        
        if stats['date_range']:
            start_date, end_date = stats['date_range']
            print(f"   • Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        
        # Show most purchased items
        print(f"\n🏆 Most Purchased Items:")
        for item, count in stats['most_purchased']:
            print(f"   • {item.title()}: {count} times")
        
        # Show category preferences
        category_prefs = self.purchase_history.get_category_preferences()
        if category_prefs:
            print(f"\n📊 Category Preferences:")
            sorted_categories = sorted(category_prefs.items(), key=lambda x: x[1], reverse=True)
            for category, count in sorted_categories[:5]:
                print(f"   • {category.title()}: {count} items")
        
        # Show shopping patterns analysis
        patterns = self.rule_engine.analyze_shopping_patterns(self.purchase_history)
        
        print(f"\n🔍 Shopping Pattern Analysis:")
        print(f"   • Average items per week: {patterns.get('avg_items_per_week', 0)}")
        print(f"   • Shopping diversity: {patterns.get('shopping_diversity', 0):.2f}")
        
        if patterns.get('favorite_categories'):
            print(f"   • Favorite categories: {', '.join([cat[0].title() for cat in patterns['favorite_categories']])}")
    
    def show_settings_menu(self):
        """
        Show settings and utilities menu
        """
        print("\n⚙️ SETTINGS & UTILITIES")
        print("="*40)
        print("1. 👤 User Preferences")
        print("2. 📦 Data Management")
        print("3. 🧪 Add Sample Data")
        print("4. 📋 Mark Items as Purchased")
        print("5. 📊 App Statistics")
        print("6. 🔙 Back to Main Menu")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            self.manage_user_preferences()
        elif choice == '2':
            self.show_data_management_menu()
        elif choice == '3':
            self.add_sample_data()
        elif choice == '4':
            self.mark_items_purchased()
        elif choice == '5':
            self.show_app_statistics()
        elif choice == '6':
            return
        else:
            print("❌ Invalid choice.")
    
    def manage_user_preferences(self):
        """
        Manage user preferences
        """
        print("\n👤 USER PREFERENCES")
        print("="*30)
        
        print("Current preferences:")
        for key, value in self.user_preferences.items():
            if key != 'last_updated':
                print(f"   • {key.replace('_', ' ').title()}: {value}")
        
        print("\nWhat would you like to update?")
        print("1. Expiration reminder days")
        print("2. Prefer organic products")
        print("3. Dietary restrictions")
        print("4. Back")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            try:
                days = int(input("Enter days before expiration to remind (current: {}): ".format(
                    self.user_preferences['expiration_reminder_days'])))
                if days > 0:
                    self.user_preferences['expiration_reminder_days'] = days
                    print("✅ Preference updated!")
                else:
                    print("❌ Days must be positive.")
            except ValueError:
                print("❌ Invalid number.")
        
        elif choice == '2':
            prefer = input("Prefer organic products? (y/N): ").strip().lower()
            self.user_preferences['prefer_organic'] = prefer in ['y', 'yes']
            print("✅ Preference updated!")
        
        elif choice == '3':
            restrictions = input("Enter dietary restrictions (comma-separated): ").strip()
            if restrictions:
                self.user_preferences['dietary_restrictions'] = [r.strip() for r in restrictions.split(',')]
            else:
                self.user_preferences['dietary_restrictions'] = []
            print("✅ Dietary restrictions updated!")
        
        # Save preferences
        if choice in ['1', '2', '3']:
            self.data_manager.save_user_preferences(self.user_preferences)
    
    def show_data_management_menu(self):
        """
        Show data management options
        """
        print("\n📦 DATA MANAGEMENT")
        print("="*30)
        print("1. 💾 Backup Data")
        print("2. 📤 Export Data")
        print("3. 📥 Import Data")
        print("4. 🗑️  Clear All Data")
        print("5. 📊 Data Summary")
        print("6. 🔙 Back")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            if self.data_manager.backup_data():
                print("✅ Data backup created successfully!")
            else:
                print("❌ Backup failed.")
        
        elif choice == '2':
            filename = input("Enter export filename (default: grocery_data_export.json): ").strip()
            if not filename:
                filename = "grocery_data_export.json"
            
            if self.data_manager.export_data(filename):
                print(f"✅ Data exported to {filename}")
            else:
                print("❌ Export failed.")
        
        elif choice == '3':
            filename = input("Enter import filename: ").strip()
            if filename and os.path.exists(filename):
                if self.data_manager.import_data(filename):
                    # Reload data
                    self.shopping_list = self.data_manager.load_shopping_list()
                    self.purchase_history = self.data_manager.load_purchase_history()
                    self.user_preferences = self.data_manager.load_user_preferences()
                    print("✅ Data imported successfully!")
                else:
                    print("❌ Import failed.")
            else:
                print("❌ File not found.")
        
        elif choice == '4':
            confirm = input("⚠️  This will delete ALL data! Type 'DELETE' to confirm: ").strip()
            if confirm == 'DELETE':
                if self.data_manager.clear_all_data(confirm=True):
                    # Reload empty data
                    self.shopping_list = ShoppingList()
                    self.purchase_history = PurchaseHistory()
                    self.user_preferences = self.data_manager.load_user_preferences()
                    print("✅ All data cleared.")
                else:
                    print("❌ Clear operation failed.")
            else:
                print("❌ Operation cancelled.")
        
        elif choice == '5':
            summary = self.data_manager.get_data_summary()
            print("\n📊 Data Summary:")
            for file_type, exists in summary['files_exist'].items():
                status = "✅" if exists else "❌"
                print(f"   {status} {file_type.replace('_', ' ').title()}: ", end="")
                if exists:
                    count = summary['data_counts'].get(file_type, 'Unknown')
                    size = summary['file_sizes'].get(file_type, 0)
                    print(f"{count} items ({size} bytes)")
                else:
                    print("Not found")
    
    def add_sample_data(self):
        """
        Add sample data for demonstration
        """
        print("\n🧪 ADD SAMPLE DATA")
        print("="*30)
        
        print("This will add sample items to demonstrate the app features.")
        confirm = input("Continue? (y/N): ").strip().lower()
        
        if confirm not in ['y', 'yes']:
            return
        
        # Sample grocery items for purchase history
        sample_purchases = [
            GroceryItem("milk", "dairy", 1, "liters"),
            GroceryItem("bread", "grains", 1, "loaf"),
            GroceryItem("bananas", "fruits", 6, "pieces"),
            GroceryItem("chicken breast", "protein", 1, "kg"),
            GroceryItem("broccoli", "vegetables", 1, "head"),
            GroceryItem("eggs", "protein", 12, "pieces"),
            GroceryItem("rice", "grains", 2, "kg"),
            GroceryItem("apples", "fruits", 6, "pieces"),
            GroceryItem("yogurt", "dairy", 4, "cups"),
            GroceryItem("tomatoes", "vegetables", 1, "kg"),
        ]
        
        # Add to purchase history with different dates
        from datetime import timedelta
        base_date = datetime.now()
        
        for i, item in enumerate(sample_purchases):
            # Spread purchases over last 30 days
            item.purchase_date = base_date - timedelta(days=30-i*3)
            self.purchase_history.add_purchase(item)
        
        # Add some items to shopping list
        sample_list_items = [
            GroceryItem("pasta", "grains", 2, "boxes"),
            GroceryItem("cheese", "dairy", 1, "block"),
            GroceryItem("olive oil", "condiments", 1, "bottle"),
        ]
        
        for item in sample_list_items:
            self.shopping_list.add_item(item)
        
        # Save data
        self.data_manager.save_shopping_list(self.shopping_list)
        self.data_manager.save_purchase_history(self.purchase_history)
        
        print("✅ Sample data added successfully!")
        print(f"   • Added {len(sample_purchases)} items to purchase history")
        print(f"   • Added {len(sample_list_items)} items to shopping list")
    
    def mark_items_purchased(self):
        """
        Mark items from shopping list as purchased
        """
        print("\n📋 MARK ITEMS AS PURCHASED")
        print("="*40)
        
        if not self.shopping_list.items:
            print("No items in shopping list to mark as purchased.")
            return
        
        print("Items in your shopping list:")
        for i, item in enumerate(self.shopping_list.items, 1):
            print(f"{i}. {item}")
        
        choice = input("\nMark all as purchased? (y/N): ").strip().lower()
        
        if choice in ['y', 'yes']:
            # Add all items to purchase history
            for item in self.shopping_list.items:
                self.purchase_history.add_purchase(item)
            
            # Clear shopping list
            self.shopping_list.clear_list()
            
            # Save changes
            self.data_manager.save_shopping_list(self.shopping_list)
            self.data_manager.save_purchase_history(self.purchase_history)
            
            print("✅ All items marked as purchased and moved to history!")
        else:
            print("Operation cancelled.")
    
    def show_app_statistics(self):
        """
        Show application statistics
        """
        print("\n📊 APP STATISTICS")
        print("="*30)
        
        # Shopping list stats
        print("🛒 Shopping List:")
        print(f"   • Items: {self.shopping_list.item_count}")
        print(f"   • Total quantity: {self.shopping_list.total_quantity}")
        
        # Purchase history stats
        print("\n📈 Purchase History:")
        print(f"   • Total purchases: {self.purchase_history.total_purchases}")
        
        if self.purchase_history.all_purchases:
            stats = self.purchase_history.get_summary_stats()
            print(f"   • Unique items: {stats['unique_items']}")
            print(f"   • Categories: {stats['categories']}")
        
        # Health stats
        if self.shopping_list.items:
            health_rating = self.recommendation_engine.rate_shopping_list_healthiness(self.shopping_list)
            print(f"\n🏥 Health Score: {health_rating['overall_score']}/10")
        
        # Expiration stats
        expiration_summary = self.expiration_tracker.get_expiration_summary(self.purchase_history)
        print(f"\n⏰ Expiration Tracking:")
        print(f"   • Items tracked: {expiration_summary['total_items_tracked']}")
        print(f"   • Items expiring: {expiration_summary['total_expiring']}")
        print(f"   • Needs attention: {'Yes' if expiration_summary['needs_attention'] else 'No'}")
    
    def exit_application(self):
        """
        Exit the application
        """
        print("\n👋 Thank you for using Smart Grocery Shopping Assistant!")
        print("\n💾 Saving your data...")
        
        # Save all data before exiting
        self.data_manager.save_shopping_list(self.shopping_list)
        self.data_manager.save_purchase_history(self.purchase_history)
        self.data_manager.save_user_preferences(self.user_preferences)
        
        print("✅ Data saved successfully!")
        print("\n🛒 Happy shopping! 🛒")
        
        self.running = False

def main():
    """
    Main entry point
    """
    try:
        app = SmartGroceryAssistant()
        app.run()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        print("Please report this issue if it persists.")

if __name__ == "__main__":
    main()
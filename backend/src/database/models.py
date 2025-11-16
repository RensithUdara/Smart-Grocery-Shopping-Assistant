"""
SQLAlchemy models for Smart Grocery Assistant
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.config import Base
from datetime import datetime
from typing import Dict, Any, List, Optional

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True)
    preferences = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    shopping_lists = relationship("ShoppingList", back_populates="user")
    purchases = relationship("Purchase", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(7), default='#2196F3')  # Hex color
    icon = Column(String(50), default='category')
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    items = relationship("Item", back_populates="category")

class Item(Base):
    __tablename__ = 'items'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    barcode = Column(String(50), unique=True, index=True)
    nutrition = Column(JSON, default={})  # Nutritional information
    average_price = Column(Float, default=0.0)
    default_unit = Column(String(20), default='piece')
    expiration_days = Column(Integer, default=7)
    is_organic = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="items")
    shopping_list_items = relationship("ShoppingListItem", back_populates="item")
    purchases = relationship("Purchase", back_populates="item")
    store_prices = relationship("StorePrice", back_populates="item")

class ShoppingList(Base):
    __tablename__ = 'shopping_lists'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), default='My Shopping List')
    is_active = Column(Boolean, default=True)
    total_estimated_cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="shopping_lists")
    items = relationship("ShoppingListItem", back_populates="shopping_list")

class ShoppingListItem(Base):
    __tablename__ = 'shopping_list_items'
    
    id = Column(Integer, primary_key=True, index=True)
    shopping_list_id = Column(Integer, ForeignKey('shopping_lists.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(20), default='piece')
    estimated_price = Column(Float, default=0.0)
    is_purchased = Column(Boolean, default=False)
    notes = Column(Text)
    priority = Column(String(10), default='medium')  # low, medium, high
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="items")
    item = relationship("Item", back_populates="shopping_list_items")

class Purchase(Base):
    __tablename__ = 'purchases'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    store_id = Column(Integer, ForeignKey('stores.id'))
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    price_per_unit = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    expiration_date = Column(DateTime(timezone=True))
    is_organic = Column(Boolean, default=False)
    receipt_url = Column(String(255))
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    item = relationship("Item", back_populates="purchases")
    store = relationship("Store", back_populates="purchases")

class Store(Base):
    __tablename__ = 'stores'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String(20))
    website = Column(String(255))
    store_type = Column(String(50))  # supermarket, grocery, organic, etc.
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    purchases = relationship("Purchase", back_populates="store")
    store_prices = relationship("StorePrice", back_populates="store")

class StorePrice(Base):
    __tablename__ = 'store_prices'
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey('stores.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    is_on_sale = Column(Boolean, default=False)
    sale_price = Column(Float)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    store = relationship("Store", back_populates="store_prices")
    item = relationship("Item", back_populates="store_prices")

class Recipe(Base):
    __tablename__ = 'recipes'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    ingredients = Column(JSON, nullable=False)  # List of ingredients with quantities
    instructions = Column(JSON, nullable=False)  # List of instruction steps
    prep_time = Column(Integer, default=0)  # Minutes
    cook_time = Column(Integer, default=0)  # Minutes
    servings = Column(Integer, default=1)
    difficulty = Column(String(20), default='medium')  # easy, medium, hard
    cuisine_type = Column(String(50))
    dietary_tags = Column(JSON, default=[])  # vegetarian, vegan, gluten-free, etc.
    nutrition = Column(JSON, default={})
    rating = Column(Float, default=0.0)
    image_url = Column(String(255))
    created_by = Column(Integer, ForeignKey('users.id'))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")
    meal_plan_items = relationship("MealPlanItem", back_populates="recipe")

class MealPlan(Base):
    __tablename__ = 'meal_plans'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), default='Weekly Meal Plan')
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    total_estimated_cost = Column(Float, default=0.0)
    total_calories = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    meals = relationship("MealPlanItem", back_populates="meal_plan")

class MealPlanItem(Base):
    __tablename__ = 'meal_plan_items'
    
    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey('meal_plans.id'), nullable=False)
    recipe_id = Column(Integer, ForeignKey('recipes.id'), nullable=False)
    meal_date = Column(DateTime(timezone=True), nullable=False)
    meal_type = Column(String(20), nullable=False)  # breakfast, lunch, dinner, snack
    servings = Column(Integer, default=1)
    
    # Relationships
    meal_plan = relationship("MealPlan", back_populates="meals")
    recipe = relationship("Recipe", back_populates="meal_plan_items")

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # expiration, budget, deal, etc.
    is_read = Column(Boolean, default=False)
    priority = Column(String(10), default='medium')  # low, medium, high
    action_url = Column(String(255))
    metadata = Column(JSON, default={})
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class BudgetGoal(Base):
    __tablename__ = 'budget_goals'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    name = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    period = Column(String(20), default='monthly')  # weekly, monthly, yearly
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    category = relationship("Category")
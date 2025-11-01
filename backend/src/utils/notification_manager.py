#!/usr/bin/env python3
"""
Smart Notification System for Grocery Shopping Assistant

Handles real-time notifications for expiration alerts, budget warnings,
shopping reminders, and price changes with customizable preferences.

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum

class NotificationType(Enum):
    """Types of notifications supported"""
    EXPIRATION_ALERT = "expiration_alert"
    BUDGET_WARNING = "budget_warning"
    SHOPPING_REMINDER = "shopping_reminder"
    PRICE_CHANGE = "price_change"
    MEAL_PREP_REMINDER = "meal_prep_reminder"
    INVENTORY_LOW = "inventory_low"
    WEEKLY_SUMMARY = "weekly_summary"

class NotificationPriority(Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Notification:
    """Individual notification object"""
    
    def __init__(self, notification_type: NotificationType, title: str, message: str, 
                 priority: NotificationPriority = NotificationPriority.MEDIUM,
                 data: Optional[Dict] = None):
        self.id = datetime.now().isoformat()
        self.type = notification_type
        self.title = title
        self.message = message
        self.priority = priority
        self.data = data or {}
        self.created_at = datetime.now()
        self.read = False
        self.dismissed = False

    def to_dict(self) -> Dict:
        """Convert notification to dictionary"""
        return {
            'id': self.id,
            'type': self.type.value,
            'title': self.title,
            'message': self.message,
            'priority': self.priority.value,
            'data': self.data,
            'created_at': self.created_at.isoformat(),
            'read': self.read,
            'dismissed': self.dismissed
        }

class NotificationManager:
    """
    Comprehensive notification management system with customizable preferences
    """
    
    def __init__(self):
        self.notifications: List[Notification] = []
        self.preferences = self._load_notification_preferences()
        self._load_existing_notifications()
    
    def _load_notification_preferences(self) -> Dict:
        """Load user notification preferences"""
        try:
            prefs_file = os.path.join('data', 'notification_preferences.json')
            if os.path.exists(prefs_file):
                with open(prefs_file, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        
        # Default preferences
        return {
            'enabled': True,
            'expiration_alerts': {
                'enabled': True,
                'advance_days': 3,
                'times': ['09:00', '18:00']
            },
            'budget_warnings': {
                'enabled': True,
                'threshold_percentage': 80,
                'frequency': 'daily'
            },
            'shopping_reminders': {
                'enabled': True,
                'frequency': 'weekly',
                'day': 'sunday',
                'time': '10:00'
            },
            'meal_prep_reminders': {
                'enabled': True,
                'day': 'sunday',
                'time': '15:00'
            },
            'quiet_hours': {
                'enabled': True,
                'start': '22:00',
                'end': '08:00'
            }
        }
    
    def _save_notification_preferences(self):
        """Save notification preferences to file"""
        try:
            os.makedirs('data', exist_ok=True)
            prefs_file = os.path.join('data', 'notification_preferences.json')
            with open(prefs_file, 'w') as f:
                json.dump(self.preferences, f, indent=2)
        except Exception as e:
            print(f"Error saving notification preferences: {e}")
    
    def _load_existing_notifications(self):
        """Load existing notifications from storage"""
        try:
            notif_file = os.path.join('data', 'notifications.json')
            if os.path.exists(notif_file):
                with open(notif_file, 'r') as f:
                    data = json.load(f)
                    for item in data:
                        notification = Notification(
                            NotificationType(item['type']),
                            item['title'],
                            item['message'],
                            NotificationPriority(item['priority']),
                            item['data']
                        )
                        notification.id = item['id']
                        notification.created_at = datetime.fromisoformat(item['created_at'])
                        notification.read = item['read']
                        notification.dismissed = item['dismissed']
                        self.notifications.append(notification)
        except Exception as e:
            print(f"Error loading notifications: {e}")
    
    def _save_notifications(self):
        """Save notifications to storage"""
        try:
            os.makedirs('data', exist_ok=True)
            notif_file = os.path.join('data', 'notifications.json')
            data = [notification.to_dict() for notification in self.notifications]
            with open(notif_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving notifications: {e}")
    
    def create_notification(self, notification_type: NotificationType, title: str, 
                          message: str, priority: NotificationPriority = NotificationPriority.MEDIUM,
                          data: Optional[Dict] = None) -> Notification:
        """Create and store a new notification"""
        if not self.preferences.get('enabled', True):
            return None
        
        # Check if this type of notification is enabled
        type_key = notification_type.value
        if type_key in self.preferences and not self.preferences[type_key].get('enabled', True):
            return None
        
        notification = Notification(notification_type, title, message, priority, data)
        self.notifications.append(notification)
        self._save_notifications()
        
        return notification
    
    def get_active_notifications(self) -> List[Notification]:
        """Get all active (unread and undismissed) notifications"""
        return [n for n in self.notifications if not n.read and not n.dismissed]
    
    def get_notifications_by_type(self, notification_type: NotificationType) -> List[Notification]:
        """Get notifications by specific type"""
        return [n for n in self.notifications if n.type == notification_type]
    
    def mark_as_read(self, notification_id: str):
        """Mark notification as read"""
        for notification in self.notifications:
            if notification.id == notification_id:
                notification.read = True
                break
        self._save_notifications()
    
    def dismiss_notification(self, notification_id: str):
        """Dismiss a notification"""
        for notification in self.notifications:
            if notification.id == notification_id:
                notification.dismissed = True
                break
        self._save_notifications()
    
    def clear_old_notifications(self, days_old: int = 30):
        """Clear notifications older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days_old)
        self.notifications = [
            n for n in self.notifications 
            if n.created_at > cutoff_date or not (n.read and n.dismissed)
        ]
        self._save_notifications()
    
    def update_preferences(self, new_preferences: Dict):
        """Update notification preferences"""
        self.preferences.update(new_preferences)
        self._save_notification_preferences()
    
    def check_expiration_alerts(self, items: List[Dict]) -> List[Notification]:
        """Check for items nearing expiration and create alerts"""
        if not self.preferences.get('expiration_alerts', {}).get('enabled', True):
            return []
        
        advance_days = self.preferences['expiration_alerts'].get('advance_days', 3)
        alert_date = datetime.now() + timedelta(days=advance_days)
        
        expiring_items = []
        notifications_created = []
        
        for item in items:
            if 'expiration_date' in item and item['expiration_date']:
                try:
                    exp_date = datetime.fromisoformat(item['expiration_date'])
                    if exp_date <= alert_date:
                        expiring_items.append(item)
                except:
                    continue
        
        if expiring_items:
            if len(expiring_items) == 1:
                title = "Item Expiring Soon"
                message = f"{expiring_items[0]['name']} expires on {expiring_items[0]['expiration_date']}"
            else:
                title = f"{len(expiring_items)} Items Expiring Soon"
                message = f"You have {len(expiring_items)} items expiring within {advance_days} days"
            
            notification = self.create_notification(
                NotificationType.EXPIRATION_ALERT,
                title,
                message,
                NotificationPriority.HIGH,
                {'expiring_items': expiring_items}
            )
            if notification:
                notifications_created.append(notification)
        
        return notifications_created
    
    def check_budget_warnings(self, current_spending: float, budget_limit: float) -> Optional[Notification]:
        """Check budget spending and create warnings if needed"""
        if not self.preferences.get('budget_warnings', {}).get('enabled', True):
            return None
        
        threshold = self.preferences['budget_warnings'].get('threshold_percentage', 80)
        spending_percentage = (current_spending / budget_limit) * 100 if budget_limit > 0 else 0
        
        if spending_percentage >= threshold:
            priority = NotificationPriority.URGENT if spending_percentage >= 100 else NotificationPriority.HIGH
            
            title = "Budget Alert"
            if spending_percentage >= 100:
                message = f"You've exceeded your budget by {spending_percentage - 100:.1f}%"
            else:
                message = f"You've used {spending_percentage:.1f}% of your budget"
            
            return self.create_notification(
                NotificationType.BUDGET_WARNING,
                title,
                message,
                priority,
                {
                    'current_spending': current_spending,
                    'budget_limit': budget_limit,
                    'percentage': spending_percentage
                }
            )
        
        return None
    
    def create_shopping_reminder(self, items_needed: List[str]) -> Optional[Notification]:
        """Create shopping reminder notification"""
        if not self.preferences.get('shopping_reminders', {}).get('enabled', True):
            return None
        
        if items_needed:
            title = "Shopping Reminder"
            if len(items_needed) == 1:
                message = f"Don't forget to buy {items_needed[0]}"
            else:
                message = f"You have {len(items_needed)} items on your shopping list"
            
            return self.create_notification(
                NotificationType.SHOPPING_REMINDER,
                title,
                message,
                NotificationPriority.MEDIUM,
                {'items': items_needed}
            )
        
        return None
    
    def create_meal_prep_reminder(self, recipes: List[str]) -> Optional[Notification]:
        """Create meal prep reminder notification"""
        if not self.preferences.get('meal_prep_reminders', {}).get('enabled', True):
            return None
        
        title = "Meal Prep Time"
        message = f"Time to prep your meals for the week! You have {len(recipes)} recipes planned."
        
        return self.create_notification(
            NotificationType.MEAL_PREP_REMINDER,
            title,
            message,
            NotificationPriority.MEDIUM,
            {'recipes': recipes}
        )
    
    def get_notification_summary(self) -> Dict:
        """Get summary of all notifications"""
        active_notifications = self.get_active_notifications()
        
        summary = {
            'total_active': len(active_notifications),
            'by_priority': {
                'urgent': len([n for n in active_notifications if n.priority == NotificationPriority.URGENT]),
                'high': len([n for n in active_notifications if n.priority == NotificationPriority.HIGH]),
                'medium': len([n for n in active_notifications if n.priority == NotificationPriority.MEDIUM]),
                'low': len([n for n in active_notifications if n.priority == NotificationPriority.LOW])
            },
            'by_type': {}
        }
        
        for notification_type in NotificationType:
            type_notifications = [n for n in active_notifications if n.type == notification_type]
            summary['by_type'][notification_type.value] = len(type_notifications)
        
        return summary
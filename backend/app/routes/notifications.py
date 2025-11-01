"""
Notification API Routes for Smart Grocery Assistant

Handles real-time notifications, preferences management, and notification history.

Author: CS 6340 Mini Project Enhancement
Date: November 2025
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import sys
import os

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.utils.notification_manager import NotificationManager, NotificationType, NotificationPriority

# Create blueprint
notifications_bp = Blueprint('notifications', __name__)

# Initialize notification manager
notification_manager = NotificationManager()

@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get all active notifications"""
    try:
        active_notifications = notification_manager.get_active_notifications()
        
        return jsonify({
            'status': 'success',
            'notifications': [notification.to_dict() for notification in active_notifications],
            'count': len(active_notifications)
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to retrieve notifications: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/summary', methods=['GET'])
def get_notification_summary():
    """Get notification summary statistics"""
    try:
        summary = notification_manager.get_notification_summary()
        
        return jsonify({
            'status': 'success',
            'summary': summary
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to retrieve notification summary: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/<notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        notification_manager.mark_as_read(notification_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Notification marked as read'
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to mark notification as read: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/<notification_id>/dismiss', methods=['POST'])
def dismiss_notification(notification_id):
    """Dismiss a notification"""
    try:
        notification_manager.dismiss_notification(notification_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Notification dismissed'
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to dismiss notification: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/preferences', methods=['GET'])
def get_notification_preferences():
    """Get current notification preferences"""
    try:
        return jsonify({
            'status': 'success',
            'preferences': notification_manager.preferences
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to retrieve preferences: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/preferences', methods=['POST'])
def update_notification_preferences():
    """Update notification preferences"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No preference data provided'
            }), 400
        
        notification_manager.update_preferences(data)
        
        return jsonify({
            'status': 'success',
            'message': 'Notification preferences updated successfully',
            'preferences': notification_manager.preferences
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to update preferences: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/create', methods=['POST'])
def create_notification():
    """Create a new notification (for testing/manual creation)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No notification data provided'
            }), 400
        
        required_fields = ['type', 'title', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Parse notification type and priority
        try:
            notification_type = NotificationType(data['type'])
            priority = NotificationPriority(data.get('priority', 'medium'))
        except ValueError as e:
            return jsonify({
                'status': 'error',
                'message': f'Invalid notification type or priority: {str(e)}'
            }), 400
        
        notification = notification_manager.create_notification(
            notification_type,
            data['title'],
            data['message'],
            priority,
            data.get('data')
        )
        
        if notification:
            return jsonify({
                'status': 'success',
                'message': 'Notification created successfully',
                'notification': notification.to_dict()
            })
        else:
            return jsonify({
                'status': 'info',
                'message': 'Notification not created (disabled in preferences)'
            })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to create notification: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/check-expiration', methods=['POST'])
def check_expiration_alerts():
    """Check for expiration alerts and create notifications"""
    try:
        data = request.get_json()
        if not data or 'items' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No items provided for expiration check'
            }), 400
        
        notifications_created = notification_manager.check_expiration_alerts(data['items'])
        
        return jsonify({
            'status': 'success',
            'message': f'Expiration check completed. {len(notifications_created)} notifications created.',
            'notifications': [n.to_dict() for n in notifications_created]
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to check expiration alerts: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/check-budget', methods=['POST'])
def check_budget_warnings():
    """Check budget and create warning notifications if needed"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No budget data provided'
            }), 400
        
        required_fields = ['current_spending', 'budget_limit']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        notification = notification_manager.check_budget_warnings(
            float(data['current_spending']),
            float(data['budget_limit'])
        )
        
        if notification:
            return jsonify({
                'status': 'success',
                'message': 'Budget warning notification created',
                'notification': notification.to_dict()
            })
        else:
            return jsonify({
                'status': 'info',
                'message': 'No budget warning needed'
            })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to check budget warnings: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/shopping-reminder', methods=['POST'])
def create_shopping_reminder():
    """Create shopping reminder notification"""
    try:
        data = request.get_json()
        if not data or 'items' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No items provided for shopping reminder'
            }), 400
        
        notification = notification_manager.create_shopping_reminder(data['items'])
        
        if notification:
            return jsonify({
                'status': 'success',
                'message': 'Shopping reminder created',
                'notification': notification.to_dict()
            })
        else:
            return jsonify({
                'status': 'info',
                'message': 'Shopping reminder not created (disabled in preferences)'
            })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to create shopping reminder: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/meal-prep-reminder', methods=['POST'])
def create_meal_prep_reminder():
    """Create meal prep reminder notification"""
    try:
        data = request.get_json()
        if not data or 'recipes' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No recipes provided for meal prep reminder'
            }), 400
        
        notification = notification_manager.create_meal_prep_reminder(data['recipes'])
        
        if notification:
            return jsonify({
                'status': 'success',
                'message': 'Meal prep reminder created',
                'notification': notification.to_dict()
            })
        else:
            return jsonify({
                'status': 'info',
                'message': 'Meal prep reminder not created (disabled in preferences)'
            })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to create meal prep reminder: {str(e)}'
        }), 500

@notifications_bp.route('/notifications/cleanup', methods=['POST'])
def cleanup_old_notifications():
    """Clean up old notifications"""
    try:
        data = request.get_json() or {}
        days_old = int(data.get('days_old', 30))
        
        notification_manager.clear_old_notifications(days_old)
        
        return jsonify({
            'status': 'success',
            'message': f'Cleaned up notifications older than {days_old} days'
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to cleanup notifications: {str(e)}'
        }), 500
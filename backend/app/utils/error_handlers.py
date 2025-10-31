from flask import jsonify
from datetime import datetime

def serialize_datetime(obj):
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object {obj} is not JSON serializable")

def register_error_handlers(app):
    """Register error handlers for the Flask app"""
    
    @app.errorhandler(Exception)
    def handle_error(error):
        return jsonify({'error': str(error)}), 500
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(400)
    def handle_bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
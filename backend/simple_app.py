#!/usr/bin/env python3
"""
Simplified Flask Application for Smart Grocery Assistant
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    CORS(app)
    
    # Basic configuration
    app.config['DEBUG'] = True
    app.config['JSON_SORT_KEYS'] = False
    
    # Basic health check endpoint
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'ok',
            'message': 'Smart Grocery Assistant API is running',
            'version': '1.0.0'
        })
    
    @app.route('/api/health')
    def api_health():
        return jsonify({
            'status': 'healthy',
            'timestamp': '2024-11-24T00:00:00Z',
            'services': {
                'api': 'running',
                'database': 'connected' 
            }
        })
    
    # Simple recommendations endpoint for testing
    @app.route('/api/recommendations')
    def get_recommendations():
        return jsonify({
            'success': True,
            'data': {
                'recommendations': [
                    {
                        'item': 'Milk',
                        'category': 'dairy',
                        'reason': 'You often buy milk on weekends',
                        'confidence': 0.85
                    },
                    {
                        'item': 'Bread',
                        'category': 'bakery', 
                        'reason': 'Goes well with your shopping pattern',
                        'confidence': 0.78
                    }
                ]
            }
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting Smart Grocery Assistant API Server...")
    print("📍 API available at: http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/")
    print("📋 Recommendations: http://localhost:5000/api/recommendations")
    app.run(host='0.0.0.0', port=5000, debug=True)
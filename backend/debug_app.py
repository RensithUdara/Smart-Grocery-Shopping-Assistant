#!/usr/bin/env python3
"""
Debug version of app.py with error handling
"""
from flask import Flask
from flask_cors import CORS
import sys
import os
import traceback

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def create_app():
    """Application factory pattern"""
    try:
        app = Flask(__name__)
        CORS(app)
        
        # Configuration
        app.config['DEBUG'] = True
        app.config['JSON_SORT_KEYS'] = False
        
        print("Basic Flask app created...")
        
        # Error handlers
        try:
            from app.utils.error_handlers import register_error_handlers
            register_error_handlers(app)
            print("Error handlers registered...")
        except Exception as e:
            print(f"Error registering error handlers: {e}")
            traceback.print_exc()
        
        # Register blueprints
        try:
            from app.routes.shopping_list import shopping_bp
            app.register_blueprint(shopping_bp, url_prefix='/api')
            print("Shopping blueprint registered...")
        except Exception as e:
            print(f"Error registering shopping blueprint: {e}")
            traceback.print_exc()
            
        try:
            from app.routes.suggestions import suggestions_bp
            app.register_blueprint(suggestions_bp, url_prefix='/api')
            print("Suggestions blueprint registered...")
        except Exception as e:
            print(f"Error registering suggestions blueprint: {e}")
            traceback.print_exc()
            
        try:
            from app.routes.health import health_bp
            app.register_blueprint(health_bp, url_prefix='/api')
            print("Health blueprint registered...")
        except Exception as e:
            print(f"Error registering health blueprint: {e}")
            traceback.print_exc()
            
        try:
            from app.routes.expiration import expiration_bp
            app.register_blueprint(expiration_bp, url_prefix='/api')
            print("Expiration blueprint registered...")
        except Exception as e:
            print(f"Error registering expiration blueprint: {e}")
            traceback.print_exc()
            
        try:
            from app.routes.analytics import analytics_bp
            app.register_blueprint(analytics_bp, url_prefix='/api')
            print("Analytics blueprint registered...")
        except Exception as e:
            print(f"Error registering analytics blueprint: {e}")
            traceback.print_exc()
        
        print("Flask app created successfully!")
        return app
        
    except Exception as e:
        print(f"Error creating Flask app: {e}")
        traceback.print_exc()
        return None

if __name__ == '__main__':
    print("Starting Flask application...")
    app = create_app()
    if app:
        print("Running Flask app on 127.0.0.1:5000...")
        app.run(host='127.0.0.1', port=5000, debug=True)
    else:
        print("Failed to create Flask app!")
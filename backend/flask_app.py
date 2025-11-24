from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    app.config['JSON_SORT_KEYS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database configuration
    app.config['USE_DATABASE'] = os.getenv('USE_DATABASE', 'false').lower() == 'true'
    app.config['DATABASE_URL'] = os.getenv('DATABASE_URL', 'sqlite:///smart_grocery.db')
    
    # Initialize database if using database mode
    if app.config['USE_DATABASE']:
        try:
            from src.database import init_db
            init_db()
            print("✅ Database initialized successfully")
        except Exception as e:
            print(f"⚠️  Database initialization warning: {e}")
            print("   You can run 'python setup_database.py' to set up the database")
    
    # Error handlers
    try:
        from app.utils.error_handlers import register_error_handlers
        register_error_handlers(app)
    except ImportError as e:
        print(f"Warning: Could not load error handlers: {e}")
    
    # Basic health endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'API is running'})
    
    # Register blueprints with error handling
    blueprint_imports = [
        ('app.routes.shopping_list', 'shopping_bp', '/api'),
        ('app.routes.suggestions', 'suggestions_bp', '/api'),
        ('app.routes.health', 'health_bp', '/api'),
        ('app.routes.expiration', 'expiration_bp', '/api'),
        ('app.routes.analytics', 'analytics_bp', '/api'),
        ('app.routes.budget', 'budget_bp', '/api'),
        ('app.routes.meal_planning', 'meal_planning_bp', '/api'),
        ('app.routes.notifications', 'notifications_bp', '/api'),
        ('app.routes.store', 'store_bp', ''),
        ('app.routes.nutrition', 'nutrition_bp', '/api'),
        ('app.routes.recipe', 'recipe_bp', ''),
    ]
    
    # Temporarily disable ML routes until import issues are resolved
    # try:
    #     from app.routes.ml import ml_bp
    #     blueprint_imports.append(('app.routes.ml', 'ml_bp', ''))
    # except ImportError as e:
    #     print(f"Warning: Could not load ML routes: {e}")
    #     print("Basic functionality will work, but advanced AI features may be limited")
    
    # Register available blueprints
    for module_path, blueprint_name, url_prefix in blueprint_imports:
        try:
            module = __import__(module_path, fromlist=[blueprint_name])
            blueprint = getattr(module, blueprint_name)
            if url_prefix:
                app.register_blueprint(blueprint, url_prefix=url_prefix)
            else:
                app.register_blueprint(blueprint)
            print(f"✅ Loaded {blueprint_name}")
        except Exception as e:
            print(f"⚠️  Could not load {blueprint_name}: {e}")

    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
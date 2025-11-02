from flask import Flask
from flask_cors import CORS
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['DEBUG'] = True
    app.config['JSON_SORT_KEYS'] = False
    
    # Error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Register blueprints
    from app.routes.shopping_list import shopping_bp
    from app.routes.suggestions import suggestions_bp
    from app.routes.health import health_bp
    from app.routes.expiration import expiration_bp
    from app.routes.analytics import analytics_bp
    from app.routes.budget import budget_bp
    from app.routes.meal_planning import meal_planning_bp
    from app.routes.notifications import notifications_bp
    from app.routes.store import store_bp
    from app.routes.ml import ml_bp
    from app.routes.nutrition import nutrition_bp
    
    app.register_blueprint(shopping_bp, url_prefix='/api')
    app.register_blueprint(suggestions_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(expiration_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(budget_bp, url_prefix='/api')
    app.register_blueprint(meal_planning_bp, url_prefix='/api')
    app.register_blueprint(notifications_bp, url_prefix='/api')
    app.register_blueprint(store_bp)
    app.register_blueprint(ml_bp)
    app.register_blueprint(nutrition_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
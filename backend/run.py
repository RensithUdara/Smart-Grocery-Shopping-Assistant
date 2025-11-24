#!/usr/bin/env python3
"""
Smart Grocery Assistant Backend Server
Run this script to start the Flask API server for the web application.
"""

import sys
import os

# Ensure we can import our modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import create_app from flask_app.py
from flask_app import create_app

def main():
    """Main entry point for the backend server"""
    print("🚀 Starting Smart Grocery Assistant Backend Server...")
    print("📍 API will be available at: http://localhost:5000")
    print("🌐 CORS enabled for frontend development")
    print("📖 API Documentation: Check the routes in app/routes/")
    print("\n" + "="*50)
    
    app = create_app()
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server shutdown requested by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
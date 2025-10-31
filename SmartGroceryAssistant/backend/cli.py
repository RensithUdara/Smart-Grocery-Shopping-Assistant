#!/usr/bin/env python3
"""
Smart Grocery Assistant CLI Application
Run this script to use the original command-line interface.
"""

import sys
import os

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import and run the main CLI application
if __name__ == '__main__':
    try:
        from main import main
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
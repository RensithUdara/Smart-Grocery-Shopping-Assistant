#!/usr/bin/env python3
"""
Database management CLI for Smart Grocery Assistant
"""
import argparse
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from setup_database import (
    create_database, seed_database, migrate_json_data, 
    reset_database, check_database_connection
)

def main():
    parser = argparse.ArgumentParser(description='Smart Grocery Assistant Database Management')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Init command
    init_parser = subparsers.add_parser('init', help='Initialize database with tables and seed data')
    
    # Reset command
    reset_parser = subparsers.add_parser('reset', help='Reset database (drop and recreate)')
    
    # Migrate command
    migrate_parser = subparsers.add_parser('migrate', help='Migrate JSON data to database')
    
    # Check command
    check_parser = subparsers.add_parser('check', help='Check database connection')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Show database status')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    print("🚀 Smart Grocery Assistant - Database CLI")
    print("=" * 50)
    
    if args.command == 'check':
        return 0 if check_database_connection() else 1
    
    elif args.command == 'init':
        success = True
        success &= check_database_connection()
        success &= create_database()
        success &= seed_database()
        
        if success:
            print("\n🎉 Database initialization completed successfully!")
            # Ask if user wants to migrate existing JSON data
            try:
                response = input("\n❓ Migrate existing JSON data? (y/N): ").strip().lower()
                if response in ['y', 'yes']:
                    migrate_json_data()
            except KeyboardInterrupt:
                print("\nSkipping data migration.")
        
        return 0 if success else 1
    
    elif args.command == 'reset':
        print("⚠️  This will delete all existing data!")
        try:
            response = input("Are you sure? (y/N): ").strip().lower()
            if response in ['y', 'yes']:
                success = reset_database()
                return 0 if success else 1
            else:
                print("Reset cancelled.")
                return 0
        except KeyboardInterrupt:
            print("\nReset cancelled.")
            return 0
    
    elif args.command == 'migrate':
        success = True
        success &= check_database_connection()
        if success:
            success &= migrate_json_data()
        return 0 if success else 1
    
    elif args.command == 'status':
        return show_database_status()
    
    else:
        parser.print_help()
        return 1

def show_database_status():
    """Show database status information"""
    try:
        from src.database import SessionLocal
        from src.database.models import User, Category, Item, ShoppingList, Purchase
        
        if not check_database_connection():
            return 1
        
        db = SessionLocal()
        
        # Count records
        user_count = db.query(User).count()
        category_count = db.query(Category).count()
        item_count = db.query(Item).count()
        shopping_list_count = db.query(ShoppingList).count()
        purchase_count = db.query(Purchase).count()
        
        print("📊 Database Status:")
        print(f"  Users: {user_count}")
        print(f"  Categories: {category_count}")
        print(f"  Items: {item_count}")
        print(f"  Shopping Lists: {shopping_list_count}")
        print(f"  Purchase Records: {purchase_count}")
        
        # Database configuration
        print("\n⚙️  Configuration:")
        print(f"  Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
        print(f"  Use SQLite: {os.getenv('USE_SQLITE', 'false')}")
        print(f"  Use Database: {os.getenv('USE_DATABASE', 'false')}")
        
        db.close()
        return 0
        
    except Exception as e:
        print(f"❌ Error checking database status: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
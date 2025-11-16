#!/bin/bash
# Quick PostgreSQL setup script for Smart Grocery Assistant

echo "🚀 Smart Grocery Assistant - PostgreSQL Quick Setup"
echo "===================================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo "  - macOS: brew install postgresql"
    echo "  - Linux: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if database exists
DB_NAME="smart_grocery_db"
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    createdb $DB_NAME
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "📝 Please edit .env file with your database credentials"
else
    echo "✅ .env file already exists"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Test database connection
echo "🔌 Testing database connection..."
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

try:
    from src.database.config import engine
    connection = engine.connect()
    connection.close()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('Please check your DATABASE_URL in .env file')
    exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Initialize database
echo "🏗️  Initializing database..."
python setup_database.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 PostgreSQL setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review your .env file configuration"
    echo "2. Start the application: python run.py"
    echo "3. The app will run in PostgreSQL mode automatically"
    echo ""
    echo "🔧 Useful commands:"
    echo "  python db_cli.py status    # Check database status"
    echo "  python db_cli.py migrate   # Migrate JSON data"
    echo "  python db_cli.py reset     # Reset database"
else
    echo "❌ Database initialization failed"
    exit 1
fi
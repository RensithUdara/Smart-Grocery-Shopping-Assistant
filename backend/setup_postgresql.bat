@echo off
REM Quick PostgreSQL setup script for Smart Grocery Assistant (Windows)

echo 🚀 Smart Grocery Assistant - PostgreSQL Quick Setup
echo ====================================================

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed.
    echo Please install PostgreSQL first:
    echo   - Download from: https://www.postgresql.org/download/windows/
    exit /b 1
)

echo ✅ PostgreSQL found

REM Create database
echo 📦 Creating database 'smart_grocery_db'...
createdb smart_grocery_db
if %errorlevel% equ 0 (
    echo ✅ Database created successfully
) else (
    echo ⚠️  Database might already exist, continuing...
)

REM Check if .env file exists
if not exist .env (
    echo 📄 Creating .env file...
    copy .env.example .env
    echo ✅ Created .env file from template
    echo 📝 Please edit .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Initialize database
echo 🏗️  Initializing database...
python setup_database.py

if %errorlevel% equ 0 (
    echo.
    echo 🎉 PostgreSQL setup completed successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Review your .env file configuration
    echo 2. Start the application: python run.py
    echo 3. The app will run in PostgreSQL mode automatically
    echo.
    echo 🔧 Useful commands:
    echo   python db_cli.py status    # Check database status
    echo   python db_cli.py migrate   # Migrate JSON data
    echo   python db_cli.py reset     # Reset database
) else (
    echo ❌ Database initialization failed
    exit /b 1
)

pause
# PostgreSQL Setup with VS Code Extension

## 🚀 Quick Setup Guide

### Step 1: Install PostgreSQL
If PostgreSQL isn't installed yet:

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and remember your password for the `postgres` user
3. Add PostgreSQL to your PATH (usually: `C:\Program Files\PostgreSQL\15\bin`)

**Alternative - Using Chocolatey:**
```powershell
choco install postgresql
```

### Step 2: Verify Installation
```powershell
psql --version
```

### Step 3: Create Your Project Database
```powershell
# Connect to PostgreSQL as admin
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE smart_grocery_db;
CREATE USER grocery_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_grocery_db TO grocery_user;
\q
```

## 🔧 VS Code PostgreSQL Extension Configuration

### Method 1: Using PostgreSQL Extension (ckolkman.vscode-postgres)

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type:** "PostgreSQL: New Connection"
3. **Configure connection:**
   - **Hostname:** localhost
   - **User:** grocery_user (or postgres)
   - **Password:** your_password
   - **Port:** 5432
   - **Database:** smart_grocery_db

### Method 2: Using Database Client Extension (cweijan.vscode-postgresql-client2)

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type:** "Database Client: New Connection"
3. **Select:** PostgreSQL
4. **Configure:**
   ```json
   {
     "host": "localhost",
     "port": 5432,
     "user": "grocery_user",
     "password": "your_password",
     "database": "smart_grocery_db"
   }
   ```

## 🏗️ Initialize Your Project Database

### Option 1: Using Project Setup Script
```powershell
cd "G:\6340 Mini Project\backend"
python setup_database.py
```

### Option 2: Using Database CLI
```powershell
cd "G:\6340 Mini Project\backend"
python db_cli.py init
```

### Option 3: Manual SQL Execution

Create a `.vscode/settings.json` file for database configuration:

```json
{
  "postgresql.connections": [
    {
      "label": "Smart Grocery DB",
      "host": "localhost",
      "user": "grocery_user",
      "password": "your_password",
      "port": "5432",
      "database": "smart_grocery_db"
    }
  ]
}
```

## 📊 Using VS Code Database Extensions

### Common Tasks:

1. **View Tables:**
   - Open PostgreSQL extension panel
   - Connect to your database
   - Browse tables and data

2. **Run Queries:**
   - Create new `.sql` file
   - Write your queries
   - Execute with `Ctrl+Enter` or command palette

3. **Table Management:**
   - Right-click on tables for context menu
   - View/Edit data directly
   - Export/Import data

### Sample Queries to Test:

```sql
-- View all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check users table
SELECT * FROM users LIMIT 5;

-- View shopping lists
SELECT sl.name, sl.created_at, u.username 
FROM shopping_lists sl 
JOIN users u ON sl.user_id = u.id;

-- Analytics query
SELECT 
    c.name as category,
    COUNT(sli.id) as item_count,
    AVG(sli.quantity) as avg_quantity
FROM shopping_list_items sli
JOIN items i ON sli.item_id = i.id
JOIN categories c ON i.category_id = c.id
GROUP BY c.name
ORDER BY item_count DESC;
```

## 🔍 Database Schema Browser

Your project database includes these tables:
- `users` - User accounts
- `categories` - Item categories
- `items` - Grocery items
- `shopping_lists` - User shopping lists
- `shopping_list_items` - Items in shopping lists
- `purchases` - Purchase history
- `stores` - Store information
- `recipes` - Recipe data
- `meal_plans` - Meal planning
- `notifications` - User notifications
- `budget_goals` - Budget tracking
- `user_preferences` - User settings
- `analytics_data` - Analytics storage

## 🛠️ Troubleshooting

### Connection Issues:
1. **Check PostgreSQL Service:**
   ```powershell
   Get-Service postgresql*
   ```

2. **Start PostgreSQL Service:**
   ```powershell
   Start-Service postgresql-x64-15  # Adjust version number
   ```

3. **Check Connection:**
   ```powershell
   psql -U postgres -h localhost -p 5432 -d smart_grocery_db
   ```

### Extension Issues:
1. **Reload VS Code:** `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check Extension Settings:** File → Preferences → Settings → Extensions → PostgreSQL
3. **View Output Panel:** View → Output → Select PostgreSQL extension

## 📝 Environment Configuration

Create or update your `.env` file:

```env
# Database Configuration
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://grocery_user:your_password@localhost:5432/smart_grocery_db

# Connection Pool Settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_RECYCLE=3600

# Development Settings
FLASK_ENV=development
FLASK_DEBUG=True
```

## 🔗 Integration with Your Flask App

Your Flask app is already configured for PostgreSQL! Just ensure:

1. **Environment Variables Set:**
   ```powershell
   $env:DATABASE_TYPE = "postgresql"
   $env:DATABASE_URL = "postgresql://grocery_user:your_password@localhost:5432/smart_grocery_db"
   ```

2. **Start Your App:**
   ```powershell
   cd "G:\6340 Mini Project\backend"
   python app.py
   ```

The app will automatically:
- Connect to PostgreSQL
- Create tables if they don't exist
- Migrate data from JSON files if needed
- Start the Flask development server

## 🎯 Next Steps

1. **Connect to Database** using VS Code extension
2. **Run Setup Script** to initialize tables
3. **Browse Schema** using extension UI
4. **Test Queries** with sample SQL
5. **Start Development** with full database integration

Happy coding! 🚀
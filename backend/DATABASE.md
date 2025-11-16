# PostgreSQL Database Integration

## Overview

The Smart Grocery Assistant now supports PostgreSQL database storage alongside the existing JSON-based system. This provides better scalability, data integrity, and advanced querying capabilities while maintaining backward compatibility.

## Features

- **Dual-mode support**: JSON files (development) and PostgreSQL (production)
- **Automatic migration**: Migrate existing JSON data to PostgreSQL
- **Backward compatibility**: Existing code continues to work unchanged
- **Database models**: Comprehensive SQLAlchemy models for all entities
- **Connection pooling**: Efficient database connections
- **Data integrity**: ACID transactions and foreign key constraints

## Database Schema

### Core Tables
- **users**: User accounts and preferences
- **categories**: Food categories (fruits, vegetables, etc.)
- **items**: Grocery items with nutritional information
- **shopping_lists**: User shopping lists
- **shopping_list_items**: Items in shopping lists
- **purchases**: Purchase history records
- **stores**: Store information and locations
- **store_prices**: Store-specific pricing data

### Recipe & Meal Planning
- **recipes**: Recipe database with ingredients and instructions
- **meal_plans**: Weekly/monthly meal plans
- **meal_plan_items**: Individual meals in plans

### Notifications & Budget
- **notifications**: User notifications and alerts
- **budget_goals**: Budget tracking and goals

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. PostgreSQL Setup

#### Option A: PostgreSQL (Recommended for Production)

1. **Install PostgreSQL**:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**:
   ```sql
   createdb smart_grocery_db
   ```

3. **Create User** (optional):
   ```sql
   CREATE USER grocery_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE smart_grocery_db TO grocery_user;
   ```

#### Option B: SQLite (Development/Testing)

For quick development, you can use SQLite instead:

```bash
# In backend/.env
USE_SQLITE=true
```

### 3. Environment Configuration

Create `.env` file in backend directory:

```bash
# Copy example file
cp .env.example .env

# Edit configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_grocery_db
USE_DATABASE=true
```

### 4. Initialize Database

```bash
# Method 1: Using setup script
python setup_database.py

# Method 2: Using CLI tool
python db_cli.py init

# Method 3: Manual setup
python -c "from setup_database import main; main()"
```

### 5. Migrate Existing Data (Optional)

If you have existing JSON data:

```bash
# Migrate JSON data to database
python db_cli.py migrate
```

## Usage

### Starting the Application

The application automatically detects the database mode:

```bash
# With database enabled
USE_DATABASE=true python run.py

# With JSON files (legacy mode)
USE_DATABASE=false python run.py
```

### Database CLI Commands

```bash
# Check database connection
python db_cli.py check

# Initialize database
python db_cli.py init

# Reset database (careful!)
python db_cli.py reset

# Migrate JSON data
python db_cli.py migrate

# Show database status
python db_cli.py status
```

## Configuration Options

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_grocery_db
USE_DATABASE=true
USE_SQLITE=false

# Flask
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key

# Connection pooling
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
```

### Application Configuration

```python
# In your application code
from src.utils.data_manager_factory import get_data_manager_instance

# This automatically returns the appropriate data manager
data_manager = get_data_manager_instance()

# Works with both JSON and database modes
shopping_list = data_manager.load_shopping_list()
```

## Development Workflow

### 1. Development (JSON mode)
```bash
# Quick development with JSON files
USE_DATABASE=false python run.py
```

### 2. Testing (SQLite)
```bash
# Lightweight database testing
USE_SQLITE=true
USE_DATABASE=true
python run.py
```

### 3. Production (PostgreSQL)
```bash
# Full PostgreSQL deployment
DATABASE_URL=postgresql://user:pass@prod-host:5432/grocery_db
USE_DATABASE=true
python run.py
```

## Data Migration

### JSON to PostgreSQL Migration

The system can automatically migrate your existing JSON data:

1. **Backup existing data**:
   ```bash
   cp -r data/ data_backup/
   ```

2. **Run migration**:
   ```bash
   python db_cli.py migrate
   ```

3. **Verify migration**:
   ```bash
   python db_cli.py status
   ```

### Migration Process

The migration transfers:
- Shopping list items → `shopping_lists` + `shopping_list_items`
- Purchase history → `purchases`
- User preferences → `users.preferences`
- Categories are auto-created based on item categories

## API Compatibility

All existing API endpoints continue to work unchanged. The data manager abstraction ensures compatibility:

```python
# This works in both modes
data_manager = get_data_manager_instance()
shopping_list = data_manager.load_shopping_list()
```

## Database Schema Details

### Relationships

```
User (1) -> (*) ShoppingList -> (*) ShoppingListItem -> (1) Item
User (1) -> (*) Purchase -> (1) Item
Item (1) -> (1) Category
Store (1) -> (*) StorePrice -> (1) Item
Recipe (1) -> (*) MealPlanItem -> (1) MealPlan
```

### Indexes

- Primary keys on all tables
- Foreign key indexes for performance
- Text search indexes on item names
- Composite indexes for common queries

### Data Types

- **JSON columns**: For flexible data (preferences, nutrition, ingredients)
- **Timestamps**: All tables have created_at/updated_at
- **Decimals**: For precise price calculations
- **Text search**: Full-text search capabilities

## Performance Considerations

### Connection Pooling
- Pool size: 10 connections
- Max overflow: 20 connections
- Connection recycling enabled

### Query Optimization
- Eager loading for related data
- Efficient pagination
- Optimized indexes for common queries

### Caching Strategy
- Application-level caching for categories
- Query result caching for analytics
- Session-based caching for user data

## Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check PostgreSQL is running
   sudo service postgresql status
   
   # Verify database exists
   psql -l | grep smart_grocery
   ```

2. **Migration errors**
   ```bash
   # Reset and retry
   python db_cli.py reset
   python db_cli.py init
   ```

3. **Permission errors**
   ```bash
   # Check database permissions
   GRANT ALL PRIVILEGES ON DATABASE smart_grocery_db TO your_user;
   ```

### Debug Mode

Enable debug logging:

```bash
FLASK_DEBUG=true
DATABASE_DEBUG=true
python run.py
```

## Production Deployment

### Database Setup
1. Set up PostgreSQL on production server
2. Configure connection pooling
3. Set up SSL connections
4. Configure backups

### Application Configuration
```bash
DATABASE_URL=postgresql://user:pass@prod-db:5432/grocery_db
USE_DATABASE=true
FLASK_ENV=production
SECRET_KEY=production-secret-key
```

### Security Considerations
- Use environment variables for sensitive data
- Enable SSL for database connections
- Regular security updates
- Database access logging

## Backup & Recovery

### Database Backup
```bash
# Full backup
pg_dump smart_grocery_db > backup.sql

# Schema only
pg_dump --schema-only smart_grocery_db > schema.sql
```

### Data Export
```bash
# Export to JSON (for portability)
python -c "from src.utils.database_data_manager import DatabaseDataManager; dm = DatabaseDataManager(True); print(dm.load_shopping_list())"
```

This comprehensive PostgreSQL integration provides a solid foundation for scaling the Smart Grocery Assistant while maintaining full backward compatibility with the existing JSON-based system.
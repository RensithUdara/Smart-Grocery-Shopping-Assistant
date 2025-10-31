# Smart Grocery Assistant - Backend API

Flask-based REST API server for the Smart Grocery Shopping Assistant web application.

## 🏗️ Architecture

The backend is organized using Flask blueprints for modular route management:

```
backend/
├── app.py                      # Main Flask application factory
├── run.py                     # Web server startup script
├── cli.py                     # CLI application launcher
├── main.py                    # Original CLI application
├── requirements.txt           # Python dependencies
├── test_app.py               # Application tests
├── api_server_old.py         # Legacy API server (backup)
├── app/                      # Web application modules
│   ├── __init__.py           # Package initialization
│   ├── routes/               # API route blueprints
│   │   ├── __init__.py
│   │   ├── shopping_list.py  # Shopping list CRUD operations
│   │   ├── suggestions.py    # AI suggestions and patterns
│   │   ├── health.py         # Health recommendations
│   │   ├── expiration.py     # Expiration tracking
│   │   └── analytics.py      # Analytics and data management
│   └── utils/
│       ├── __init__.py
│       └── error_handlers.py # Error handling utilities
├── src/                      # Core application logic
│   ├── models/               # Data models
│   │   ├── grocery_item.py   # Grocery item model
│   │   ├── shopping_list.py  # Shopping list model
│   │   └── purchase_history.py # Purchase history model
│   ├── engines/              # AI/Logic engines
│   │   ├── rule_engine.py    # Rule-based suggestion engine
│   │   └── recommendation_engine.py # Health recommendation engine
│   └── utils/                # Utility modules
│       ├── data_manager.py   # Data persistence layer
│       └── expiration_tracker.py # Expiration tracking logic
├── config/                   # Configuration files
│   └── alternatives.json     # Healthy alternatives database
├── data/                     # Data storage
│   ├── grocery_list.json     # Current shopping list
│   ├── purchase_history.json # Purchase history
│   └── user_preferences.json # User settings
└── README.md                 # This documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**

   **Web API Server (for React frontend):**
   ```bash
   python run.py
   ```
   The API server will start on `http://localhost:5000`

   **Command Line Interface (original CLI):**
   ```bash
   python cli.py
   # or directly:
   python main.py
   ```

## 📡 API Endpoints

### Shopping List Management (`/api/shopping-list`)
- `GET /api/shopping-list` - Get current shopping list
- `POST /api/shopping-list/items` - Add item to shopping list
- `DELETE /api/shopping-list/items/<item_name>` - Remove item
- `PUT /api/shopping-list/items/<item_name>/quantity` - Update quantity
- `DELETE /api/shopping-list/clear` - Clear entire list
- `GET /api/shopping-list/summary` - Get shopping list statistics

### AI Suggestions (`/api/suggestions`)
- `GET /api/suggestions` - Get AI-generated suggestions
- `GET /api/suggestions/patterns` - Get shopping pattern analysis
- `POST /api/suggestions/refresh` - Force refresh suggestions
- `GET /api/purchase-history` - Get purchase history
- `POST /api/purchase-history/items` - Add purchase record
- `POST /api/purchase-history/mark-purchased` - Mark items as purchased
- `GET /api/purchase-history/stats` - Get purchase statistics

### Health Recommendations (`/api/health`)
- `GET /api/health/alternatives/<item_name>` - Get healthy alternative for item
- `GET /api/health/list-rating` - Get health rating for shopping list
- `GET /api/health/suggestions` - Get healthier shopping suggestions
- `GET /api/health/nutrient-boosters` - Get nutrient enhancement suggestions
- `GET /api/health/score` - Get overall health score
- `GET /api/health/alternatives` - Get all healthy alternatives
- `GET /api/health/analysis` - Get detailed nutritional analysis

### Expiration Tracking (`/api/expiration`)
- `GET /api/expiration/check?days=<N>` - Check items expiring in N days
- `GET /api/expiration/reminders` - Get expiration reminders
- `GET /api/expiration/meal-suggestions` - Get meal suggestions for expiring items
- `GET /api/expiration/items` - Get detailed expiring items list
- `GET /api/expiration/meals` - Get meal plans

### Analytics & Data (`/api/analytics`, `/api/data`, `/api/preferences`)
- `GET /api/analytics` - Get comprehensive analytics data
- `GET /api/data/summary` - Get data usage summary
- `POST /api/data/backup` - Create data backup
- `DELETE /api/data/clear` - Clear all data
- `POST /api/data/sample` - Add sample data for testing
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `FLASK_DEBUG`: Enable/disable debug mode
- `PORT`: API server port (default: 5000)

### CORS Configuration
CORS is enabled for all origins during development. For production, configure specific allowed origins in `app.py`.

## 🧪 Testing

### Test with curl:
```bash
# Get shopping list
curl http://localhost:5000/api/shopping-list

# Add item
curl -X POST http://localhost:5000/api/shopping-list/items \
  -H "Content-Type: application/json" \
  -d '{"name": "milk", "category": "dairy", "quantity": 1}'

# Get suggestions
curl http://localhost:5000/api/suggestions
```

### Add Sample Data:
```bash
curl -X POST http://localhost:5000/api/data/sample
```

## 🏭 Production Deployment

### Using Gunicorn (recommended):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

### Using Docker:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "run.py"]
```

## 🔍 Development

### Adding New Routes:
1. Create new route file in `app/routes/`
2. Define Blueprint with routes
3. Register Blueprint in `app.py`

### Error Handling:
All routes automatically use centralized error handling from `app/utils/error_handlers.py`

### Data Access:
All routes use the `DataManager` from the original `src/utils/data_manager.py` for consistent data access.

## 📁 Data Storage

The backend uses the existing JSON-based data storage:
- `data/grocery_list.json` - Current shopping list
- `data/purchase_history.json` - Purchase history
- `data/user_preferences.json` - User preferences

## 🐛 Troubleshooting

### Common Issues:

**Import Errors:**
- Ensure you're running from the `backend/` directory
- Check that `src/` directory is accessible from the project root

**CORS Errors:**
- CORS is enabled for all origins in development
- Check that frontend is making requests to `http://localhost:5000`

**Module Not Found:**
- Verify virtual environment is activated
- Install requirements: `pip install -r requirements.txt`

### Debug Mode:
Run with debug logging:
```bash
FLASK_DEBUG=1 python run.py
```

## 🤝 Integration

This backend integrates seamlessly with:
- React frontend (in `../frontend/`)
- Original Python CLI application (in `../`)
- All existing models and engines from `../src/`

The API serves as a bridge between the original Python logic and the modern web frontend.
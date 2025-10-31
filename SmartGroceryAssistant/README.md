# Smart Grocery Shopping Assistant - Web Application

A comprehensive React-based web application for intelligent grocery shopping with AI-powered recommendations, health tracking, and analytics.

## 🚀 Features

### Core Functionality
- **Smart Shopping Lists**: Create, manage, and organize grocery items with categories, quantities, and expiration tracking
- **AI-Powered Suggestions**: Get personalized recommendations based on shopping patterns and preferences
- **Expiration Tracker**: Monitor food freshness, receive alerts, and get meal planning suggestions
- **Health Recommendations**: Receive nutritional guidance and healthier alternatives for your items
- **Comprehensive Analytics**: Detailed insights into spending habits, shopping trends, and nutritional patterns
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile

### Advanced Features
- **Purchase History Tracking**: Automatic tracking of your shopping patterns
- **Budget Management**: Set and monitor spending limits with detailed breakdowns
- **Nutritional Analysis**: Track macronutrients, vitamins, and dietary balance
- **Seasonal Recommendations**: Context-aware suggestions based on time of year
- **Export/Import Data**: Full data portability and backup capabilities
- **Real-time Notifications**: Expiration alerts, price changes, and shopping reminders

## 🏗️ Architecture

### Backend (Python Flask API)
- **API Server**: `api_server.py` - RESTful API serving all application logic
- **Models**: Existing Python models for items, health analysis, and purchase tracking
- **Engines**: AI recommendation engine and suggestion algorithms
- **Data Persistence**: JSON-based data storage with automatic backups

### Frontend (React 18)
- **Modern React**: Hooks, functional components, and modern JavaScript
- **Responsive UI**: Mobile-first design with utility CSS classes
- **Component Architecture**: Reusable components and modular design
- **State Management**: Custom hooks for API integration and local state
- **Routing**: React Router for single-page application navigation

## 📁 Project Structure

```
SmartGroceryAssistant/
├── api_server.py                     # Flask backend API
├── src/                              # Original Python application
│   ├── models/                       # Data models
│   ├── engines/                      # AI engines
│   └── utils/                        # Utilities
├── frontend/                         # React web application
│   ├── package.json                  # Dependencies and scripts
│   ├── src/
│   │   ├── App.js                    # Main application component
│   │   ├── services/
│   │   │   └── apiService.js         # API communication layer
│   │   ├── hooks/
│   │   │   └── useApi.js             # Custom React hooks
│   │   ├── components/
│   │   │   ├── common.js             # Reusable UI components
│   │   │   └── GroceryItems.js       # Grocery-specific components
│   │   ├── pages/                    # Main application pages
│   │   │   ├── Dashboard.js          # Overview and quick actions
│   │   │   ├── ShoppingList.js       # Shopping list management
│   │   │   ├── Suggestions.js        # AI recommendations
│   │   │   ├── ExpirationTracker.js  # Food freshness monitoring
│   │   │   ├── HealthRecommendations.js # Nutritional guidance
│   │   │   ├── Analytics.js          # Shopping analytics
│   │   │   └── Settings.js           # User preferences
│   │   └── styles/
│   │       └── index.css             # Application styles
│   └── public/
└── README.md                         # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. **Install Python dependencies:**
   ```bash
   pip install flask flask-cors
   ```

2. **Start the Flask API server:**
   ```bash
   python api_server.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The web application will be available at `http://localhost:3000`

## 📱 Usage

### Getting Started
1. **Add Items**: Start by adding grocery items to your shopping list
2. **Mark Purchases**: Mark items as purchased to build your shopping history
3. **Explore Suggestions**: Visit the Suggestions page to see AI recommendations
4. **Track Health**: Use Health Recommendations for nutritional guidance
5. **Monitor Expiration**: Keep track of food freshness in Expiration Tracker
6. **View Analytics**: Analyze your shopping patterns in the Analytics page
7. **Customize Settings**: Adjust preferences in the Settings page

### Key Workflows
- **Weekly Shopping**: Use Dashboard quick actions and suggestions for planning
- **Health Optimization**: Follow health recommendations and track nutritional balance
- **Budget Tracking**: Monitor spending in Analytics and set limits in Settings
- **Meal Planning**: Use expiration tracker for meal suggestions based on expiring items

## 🎨 UI Components

### Common Components
- **LoadingSpinner**: Consistent loading indicators
- **EmptyState**: Informative empty state messages
- **Modal**: Reusable modal dialogs
- **Badge**: Status and category indicators
- **StatCard**: Metric display cards
- **AlertBanner**: Important notifications
- **ConfirmDialog**: Confirmation prompts
- **Tabs**: Navigation tabs for multi-section pages

### Grocery Components
- **GroceryItemCard**: Individual item display
- **AddItemForm**: Item creation and editing
- **ShoppingListSummary**: List overview and statistics

## 📊 API Endpoints

### Shopping List Management
- `GET /api/shopping_list` - Retrieve shopping list
- `POST /api/shopping_list` - Add new item
- `PUT /api/shopping_list/<id>` - Update item
- `DELETE /api/shopping_list/<id>` - Delete item

### AI Recommendations
- `GET /api/suggestions` - Get AI suggestions
- `GET /api/suggestions/patterns` - Get shopping patterns

### Health & Nutrition
- `GET /api/health/score` - Get health score
- `GET /api/health/alternatives` - Get healthy alternatives
- `GET /api/health/analysis` - Get nutritional analysis

### Expiration Tracking
- `GET /api/expiration/items` - Get expiring items
- `GET /api/expiration/meals` - Get meal suggestions

### Analytics
- `GET /api/analytics` - Get comprehensive analytics data

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `API_PORT`: API server port (default: 5000)
- `CORS_ORIGINS`: Allowed CORS origins

### Frontend Configuration
- API base URL configured in `src/services/apiService.js`
- Responsive breakpoints in CSS utility classes
- Chart colors and themes in Analytics components

## 🚀 Production Deployment

### Backend Deployment
1. Use a production WSGI server like Gunicorn
2. Configure environment variables
3. Set up proper logging and monitoring
4. Implement data persistence (database)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Serve static files from `build/` directory
3. Configure proper routing for SPA
4. Set up CDN for assets if needed

## CLI Usage (Original Python Application)
1. Run `python main.py` to start the CLI application
2. Use the menu options to:
   - View your current grocery list
   - Add or remove items
   - Get smart suggestions based on your history
   - Check for expiring items
   - Get healthy alternative recommendations
- **Data Storage**: JSON files for persistence
- **Architecture**: Object-oriented design with modular components
- **Interface**: Command-line interface (CLI)

## Authors
Created for CS 6340 Mini Project - November 2025
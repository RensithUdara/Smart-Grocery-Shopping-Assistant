# Smart Grocery Shopping Assistant

## Overview
An AI-powered grocery shopping assistant that helps users manage grocery lists, suggests missing items based on purchase patterns, recommends healthier alternatives, and tracks expiring products.

## Features
- **Grocery List Management**: Add, remove, and update items with quantities
- **Rule-Based Reasoning**: Analyzes purchase patterns and suggests items you might need
- **Health Recommendations**: Suggests healthier alternatives for common grocery items
- **Expiration Tracking**: Monitors expiring items and provides timely reminders
- **Data Persistence**: Saves your shopping history and preferences

## Installation
1. Ensure Python 3.7+ is installed
2. Clone or download this project
3. Run: `python main.py`

## Usage
1. Run `python main.py` to start the application
2. Use the menu options to:
   - View your current grocery list
   - Add or remove items
   - Get smart suggestions based on your history
   - Check for expiring items
   - Get healthy alternative recommendations

## Project Structure
```
SmartGroceryAssistant/
├── src/
│   ├── models/
│   │   ├── grocery_item.py
│   │   ├── shopping_list.py
│   │   └── purchase_history.py
│   ├── engines/
│   │   ├── rule_engine.py
│   │   └── recommendation_engine.py
│   └── utils/
│       └── data_manager.py
├── data/
│   ├── grocery_list.json
│   ├── purchase_history.json
│   └── user_preferences.json
├── config/
│   └── alternatives.json
└── main.py
```

## Implementation Details
- **Language**: Python 3.7+
- **Data Storage**: JSON files for persistence
- **Architecture**: Object-oriented design with modular components
- **Interface**: Command-line interface (CLI)

## Authors
Created for CS 6340 Mini Project - November 2025
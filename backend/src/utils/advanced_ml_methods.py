    def _analyze_advanced_patterns(self):
        """Perform advanced pattern analysis and train ML models"""
        if not self.purchase_history:
            return
        
        df = pd.DataFrame(self.purchase_history)
        df['date'] = pd.to_datetime(df['date'])
        
        # Prepare features for ML models
        features = self._prepare_ml_features(df)
        
        if len(features) > 10:  # Need sufficient data for training
            self._train_prediction_models(features)
            self._perform_user_clustering(features)
            self.models_trained = True
    
    def _prepare_ml_features(self, df):
        """Prepare feature matrix for ML models"""
        features = []
        
        # Create time-based features
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['month'] = df['date'].dt.month
        
        # Aggregate by date to create basket-level features
        daily_baskets = df.groupby('date').agg({
            'quantity': 'sum',
            'price': 'mean',
            'category': lambda x: len(set(x)),  # Category diversity
            'item': 'count'  # Number of items
        }).reset_index()
        
        daily_baskets['day_of_year'] = daily_baskets['date'].dt.dayofyear
        daily_baskets['month'] = daily_baskets['date'].dt.month
        daily_baskets['day_of_week'] = daily_baskets['date'].dt.dayofweek
        
        return daily_baskets
    
    def _train_prediction_models(self, features):
        """Train ML models for purchase prediction"""
        try:
            # Prepare target variables
            features_sorted = features.sort_values('date')
            
            # Predict if user will shop next day (classification)
            X_class = features_sorted[['day_of_year', 'month', 'day_of_week', 
                                     'quantity', 'category', 'item']].values[:-1]
            
            # Create target: 1 if shopping next day, 0 otherwise
            dates = features_sorted['date'].values
            y_class = []
            for i in range(len(dates) - 1):
                next_shop_gap = (dates[i+1] - dates[i]).astype('timedelta64[D]').astype(int)
                y_class.append(1 if next_shop_gap <= 3 else 0)  # Shopping within 3 days
            
            if len(X_class) > 5:  # Minimum samples for training
                self.purchase_predictor.fit(X_class, y_class)
                
                # Train quantity predictor
                X_reg = X_class[:-1]
                y_reg = features_sorted['quantity'].values[1:]  # Predict next basket size
                
                if len(X_reg) > 3:
                    self.quantity_predictor.fit(X_reg, y_reg)
                    
            print("ML models trained successfully")
            
        except Exception as e:
            print(f"Error training ML models: {e}")
    
    def _perform_user_clustering(self, features):
        """Perform user behavior clustering"""
        try:
            if len(features) < 5:
                return
                
            # Create user behavior vector
            user_vector = [
                features['quantity'].mean(),
                features['price'].mean(),
                features['category'].mean(),
                features['item'].mean(),
                len(features),  # Shopping frequency
                features['quantity'].std() if len(features) > 1 else 0
            ]
            
            # For now, store user vector - in production, cluster multiple users
            self.user_similarity_model = np.array(user_vector).reshape(1, -1)
            
        except Exception as e:
            print(f"Error in user clustering: {e}")
    
    def predict_next_shopping_day(self) -> Dict[str, any]:
        """Predict when user will likely shop next"""
        if not self.models_trained:
            return {'prediction': 'Need more data for prediction', 'confidence': 0.0}
        
        try:
            # Get current features
            current_date = datetime.now()
            current_features = np.array([[
                current_date.timetuple().tm_yday,  # day of year
                current_date.month,
                current_date.weekday(),
                5.0,  # average quantity
                3.0,  # average categories
                6.0   # average items
            ]])
            
            # Predict probability of shopping
            shop_probability = self.purchase_predictor.predict_proba(current_features)[0][1]
            
            # Predict likely basket size
            predicted_quantity = self.quantity_predictor.predict(current_features)[0]
            
            return {
                'shop_probability': float(shop_probability),
                'predicted_basket_size': max(1, int(predicted_quantity)),
                'confidence': float(shop_probability),
                'prediction_date': current_date.strftime('%Y-%m-%d')
            }
            
        except Exception as e:
            return {'error': str(e), 'confidence': 0.0}
    
    def get_personalized_recommendations(self, current_list: List[str] = None, 
                                       limit: int = 10) -> List[Dict[str, any]]:
        """Generate advanced personalized recommendations"""
        if 'default_user' not in self.user_profiles:
            return self._get_basic_recommendations(limit)
        
        user_profile = self.user_profiles['default_user']
        recommendations = []
        
        # 1. Collaborative filtering based recommendations
        collab_recs = self._get_collaborative_recommendations(user_profile, current_list)
        recommendations.extend(collab_recs)
        
        # 2. Content-based recommendations using item embeddings
        content_recs = self._get_content_based_recommendations(user_profile, current_list)
        recommendations.extend(content_recs)
        
        # 3. Seasonal and trend-based recommendations
        seasonal_recs = self._get_seasonal_recommendations(user_profile)
        recommendations.extend(seasonal_recs)
        
        # 4. Health-optimized recommendations
        health_recs = self._get_health_recommendations(user_profile, current_list)
        recommendations.extend(health_recs)
        
        # 5. Budget-conscious recommendations
        budget_recs = self._get_budget_recommendations(user_profile)
        recommendations.extend(budget_recs)
        
        # Remove duplicates and sort by confidence
        unique_recs = self._deduplicate_recommendations(recommendations, current_list)
        unique_recs.sort(key=lambda x: x['confidence'], reverse=True)
        
        return unique_recs[:limit]
    
    def _get_collaborative_recommendations(self, user_profile, current_list):
        """Collaborative filtering recommendations"""
        recommendations = []
        
        # Use purchase patterns from user profile
        patterns = user_profile.get('purchase_patterns', {})
        combinations = patterns.get('frequent_combinations', {})
        
        current_categories = set()
        if current_list:
            # Map items to categories (simplified)
            for item in current_list:
                category = self._guess_item_category(item)
                current_categories.add(category)
        
        # Recommend items from frequently bought together categories
        for combo, frequency in combinations.items():
            if frequency > 2:  # Significant frequency
                for category in combo:
                    if category not in current_categories:
                        # Get representative items from this category
                        items = self._get_category_items(category)
                        for item in items[:2]:  # Top 2 items per category
                            recommendations.append({
                                'item': item,
                                'category': category,
                                'reason': f'Frequently bought with your selected items',
                                'confidence': min(0.8, frequency / 10.0),
                                'type': 'collaborative'
                            })
        
        return recommendations
    
    def _get_content_based_recommendations(self, user_profile, current_list):
        """Content-based recommendations using item embeddings"""
        recommendations = []
        
        if not current_list:
            return recommendations
        
        # Calculate user's category preference vector
        category_prefs = user_profile.get('category_preferences', {})
        
        # Find similar categories using embeddings
        for item in current_list[:3]:  # Process first 3 items to avoid too many recommendations
            item_category = self._guess_item_category(item)
            
            if item_category in self.category_embeddings:
                item_embedding = self.category_embeddings[item_category]
                
                # Find most similar categories
                similarities = {}
                for category, embedding in self.category_embeddings.items():
                    if category != item_category:
                        similarity = cosine_similarity(
                            item_embedding.reshape(1, -1),
                            embedding.reshape(1, -1)
                        )[0][0]
                        similarities[category] = similarity
                
                # Recommend from most similar categories
                top_similar = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:2]
                
                for similar_category, similarity in top_similar:
                    if similarity > 0.7:  # High similarity threshold
                        items = self._get_category_items(similar_category)
                        for rec_item in items[:1]:  # One item per similar category
                            recommendations.append({
                                'item': rec_item,
                                'category': similar_category,
                                'reason': f'Similar to {item} (Similarity: {similarity:.1%})',
                                'confidence': similarity * 0.7,
                                'type': 'content_based'
                            })
        
        return recommendations
    
    def _get_seasonal_recommendations(self, user_profile):
        """Seasonal recommendations with user preference weighting"""
        recommendations = []
        current_month = datetime.now().month
        
        seasonal_prefs = user_profile.get('seasonal_preferences', {})
        current_seasonal = seasonal_prefs.get(current_month, {})
        
        # Recommend seasonal items based on historical preferences
        for category, quantity in current_seasonal.items():
            if quantity > 2:  # User bought this category significantly this month before
                seasonal_factor = self.seasonal_patterns.get(category, {}).get(current_month, 1.0)
                
                if seasonal_factor > 1.1:  # Peak season for this category
                    items = self._get_category_items(category)
                    for item in items[:2]:
                        recommendations.append({
                            'item': item,
                            'category': category,
                            'reason': f'Perfect season for {category} (Peak season: {seasonal_factor:.1%} increase)',
                            'confidence': min(0.75, seasonal_factor * 0.5),
                            'type': 'seasonal'
                        })
        
        return recommendations
    
    def _get_health_recommendations(self, user_profile, current_list):
        """Health-conscious recommendations"""
        recommendations = []
        health_score = user_profile.get('health_consciousness', 0.5)
        
        if health_score < 0.6:  # User could improve health choices
            healthy_items = [
                ('Spinach', 'vegetables'), ('Blueberries', 'fruits'),
                ('Salmon', 'meat'), ('Quinoa', 'grains'),
                ('Greek Yogurt', 'dairy'), ('Almonds', 'snacks')
            ]
            
            for item, category in healthy_items[:3]:
                recommendations.append({
                    'item': item,
                    'category': category,
                    'reason': f'Healthy choice to boost your nutrition (Current health score: {health_score:.1%})',
                    'confidence': 0.6 + (0.6 - health_score) * 0.5,
                    'type': 'health_focused'
                })
        
        return recommendations
    
    def _get_budget_recommendations(self, user_profile):
        """Budget-conscious recommendations"""
        recommendations = []
        avg_basket_value = user_profile.get('avg_basket_value', 50.0)
        
        # If user typically spends a lot, suggest budget-friendly alternatives
        if avg_basket_value > 60:
            budget_items = [
                ('Rice', 'grains', 4.0), ('Beans', 'protein', 3.5),
                ('Potatoes', 'vegetables', 3.0), ('Oats', 'grains', 5.0),
                ('Eggs', 'dairy', 3.5)
            ]
            
            for item, category, price in budget_items[:2]:
                recommendations.append({
                    'item': item,
                    'category': category,
                    'reason': f'Budget-friendly option (${price:.2f} - Your avg basket: ${avg_basket_value:.2f})',
                    'confidence': 0.5,
                    'type': 'budget_conscious'
                })
        
        return recommendations
    
    def _get_basic_recommendations(self, limit):
        """Fallback basic recommendations when no user data available"""
        basic_items = [
            ('Milk', 'dairy', 'Essential dairy product'),
            ('Bread', 'bakery', 'Pantry staple'),
            ('Eggs', 'dairy', 'Versatile protein source'),
            ('Bananas', 'fruits', 'Popular healthy snack'),
            ('Rice', 'grains', 'Versatile grain base')
        ]
        
        return [{
            'item': item,
            'category': category,
            'reason': reason,
            'confidence': 0.4,
            'type': 'basic'
        } for item, category, reason in basic_items[:limit]]
    
    def _deduplicate_recommendations(self, recommendations, current_list):
        """Remove duplicates and items already in current list"""
        seen = set()
        if current_list:
            seen.update(item.lower() for item in current_list)
        
        unique_recs = []
        for rec in recommendations:
            item_key = rec['item'].lower()
            if item_key not in seen:
                seen.add(item_key)
                unique_recs.append(rec)
        
        return unique_recs
    
    def _guess_item_category(self, item_name):
        """Guess category of an item"""
        item_lower = item_name.lower()
        
        category_keywords = {
            'fruits': ['apple', 'banana', 'orange', 'berry', 'grape', 'lemon'],
            'vegetables': ['tomato', 'onion', 'carrot', 'potato', 'lettuce', 'spinach'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
            'meat': ['chicken', 'beef', 'fish', 'salmon', 'pork'],
            'grains': ['bread', 'rice', 'pasta', 'oats', 'cereal', 'quinoa'],
            'beverages': ['juice', 'coffee', 'tea', 'soda', 'water']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in item_lower for keyword in keywords):
                return category
        
        return 'other'
    
    def _get_category_items(self, category):
        """Get representative items for a category"""
        category_items = {
            'fruits': ['Apples', 'Bananas', 'Oranges', 'Strawberries'],
            'vegetables': ['Tomatoes', 'Onions', 'Carrots', 'Broccoli'],
            'dairy': ['Milk', 'Cheese', 'Yogurt', 'Butter'],
            'meat': ['Chicken Breast', 'Ground Beef', 'Salmon', 'Eggs'],
            'grains': ['Bread', 'Rice', 'Pasta', 'Oats'],
            'beverages': ['Orange Juice', 'Coffee', 'Tea', 'Water']
        }
        
        return category_items.get(category, ['Generic Item'])
    
    def _save_user_data(self):
        """Save user data and models"""
        try:
            user_data = {
                'purchase_history': self.purchase_history,
                'user_profiles': self.user_profiles,
                'last_updated': datetime.now().isoformat()
            }
            
            with open(os.path.join(self.model_path, 'user_data.json'), 'w') as f:
                json.dump(user_data, f, indent=2)
                
            print("User data saved successfully")
        except Exception as e:
            print(f"Error saving user data: {e}")
    
    def get_ai_insights(self):
        """Get comprehensive AI insights about user behavior"""
        if 'default_user' not in self.user_profiles:
            return {'message': 'Insufficient data for AI insights'}
        
        profile = self.user_profiles['default_user']
        
        # Next purchase prediction
        next_shop_prediction = self.predict_next_shopping_day()
        
        insights = {
            'user_profile_summary': {
                'total_purchases': profile['total_purchases'],
                'avg_basket_value': round(profile['avg_basket_value'], 2),
                'shopping_frequency': round(profile['shopping_frequency'], 1),
                'health_score': round(profile['health_consciousness'], 2),
                'price_sensitivity': round(profile['price_sensitivity'], 2)
            },
            'behavioral_patterns': {
                'most_preferred_categories': sorted(
                    profile['category_preferences'].items(),
                    key=lambda x: x[1]['preference_score'],
                    reverse=True
                )[:3],
                'shopping_patterns': profile['purchase_patterns'],
                'seasonal_preferences': profile.get('seasonal_preferences', {})
            },
            'predictions': next_shop_prediction,
            'recommendations_available': self.models_trained,
            'data_points': len(self.purchase_history)
        }
        
        return insights

# Create a backward-compatible alias
MLEngine = AdvancedMLEngine
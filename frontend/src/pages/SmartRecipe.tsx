import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    TextField,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    ExpandMore,
    Search,
    Restaurant,
    AccessTime,
    Person,
    Star,
    MenuBook,
    Add,
    Remove,
    LocalDining,
    SwapHoriz
} from '@mui/icons-material';
import api from '../services/api';

interface Recipe {
    id: string;
    title: string;
    description: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    cuisine_type: string;
    dietary_tags: string[];
    ingredients: Array<{
        name: string;
        amount: string;
        unit: string;
    }>;
    instructions: string[];
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    rating: number;
    image_url?: string;
}

interface RecipeMatch {
    recipe: Recipe;
    match_score: number;
    matching_ingredients: string[];
    missing_ingredients: string[];
}

interface RecipeRecommendation {
    recipe: Recipe;
    score: number;
    reasons: string[];
}

interface MealPlan {
    date: string;
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    total_calories: number;
    total_cost: number;
}

const SmartRecipe: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Recipe Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [searchFilters, setSearchFilters] = useState({
        max_prep_time: 60,
        max_cook_time: 60,
        cuisine: '',
        difficulty: '',
        dietary_tags: [] as string[]
    });

    // Ingredient-based Search State
    const [availableIngredients, setAvailableIngredients] = useState<string>('');
    const [recipeMatches, setRecipeMatches] = useState<RecipeMatch[]>([]);

    // Recommendations State
    const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
    const [userPreferences, setUserPreferences] = useState({
        cuisine_preferences: [] as string[],
        dietary_restrictions: [] as string[],
        cooking_time_preference: 30,
        difficulty_preference: 'medium'
    });

    // Meal Planning State
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [mealPlanDays, setMealPlanDays] = useState(7);
    const [budgetConstraint, setBudgetConstraint] = useState(200);

    // Dialog State
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const formatTime = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const openRecipeDialog = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/recipe/search', {
                query: searchQuery,
                filters: searchFilters
            });
            setSearchResults(response.data.recipes || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to search recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleIngredientSearch = async () => {
        if (!availableIngredients.trim()) return;
        
        setLoading(true);
        setError(null);
        try {
            const ingredients = availableIngredients.split(',').map(i => i.trim());
            const response = await api.post('/recipe/find-by-ingredients', {
                ingredients,
                min_match_threshold: 0.3
            });
            setRecipeMatches(response.data.matches || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to find recipes by ingredients');
        } finally {
            setLoading(false);
        }
    };

    const handleGetRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/recipe/recommendations', {
                user_preferences: userPreferences,
                limit: 10
            });
            setRecommendations(response.data.recommendations || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMealPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/recipe/meal-plan', {
                days: mealPlanDays,
                preferences: userPreferences,
                budget_constraint: budgetConstraint
            });
            setMealPlans(response.data.meal_plans || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate meal plan');
        } finally {
            setLoading(false);
        }
    };

    const RecipeCard: React.FC<{ recipe: Recipe; showMatchScore?: boolean; matchScore?: number }> = ({ 
        recipe, 
        showMatchScore, 
        matchScore 
    }) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {recipe.title}
                    </Typography>
                    {showMatchScore && matchScore && (
                        <Chip 
                            label={`${Math.round(matchScore * 100)}% match`} 
                            color="primary" 
                            size="small" 
                        />
                    )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {recipe.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip icon={<AccessTime />} label={formatTime(recipe.prep_time + recipe.cook_time)} size="small" />
                    <Chip icon={<Person />} label={`${recipe.servings} servings`} size="small" />
                    <Chip icon={<Star />} label={recipe.rating.toFixed(1)} size="small" />
                    <Chip label={recipe.difficulty} size="small" color="secondary" />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {recipe.dietary_tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                </Box>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={() => openRecipeDialog(recipe)}>
                    View Recipe
                </Button>
            </CardActions>
        </Card>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Recipe Search
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Recipe Search
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Search recipes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    disabled={loading}
                                    startIcon={<Search />}
                                >
                                    Search
                                </Button>
                            </Box>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Advanced Filters</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                                        <Box>
                                            <Typography gutterBottom>Max Prep Time: {formatTime(searchFilters.max_prep_time)}</Typography>
                                            <Slider
                                                value={searchFilters.max_prep_time}
                                                onChange={(_, value) => setSearchFilters(prev => ({ ...prev, max_prep_time: value as number }))}
                                                min={5}
                                                max={180}
                                                step={5}
                                                marks={[{ value: 30, label: '30m' }, { value: 60, label: '1h' }, { value: 120, label: '2h' }]}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography gutterBottom>Max Cook Time: {formatTime(searchFilters.max_cook_time)}</Typography>
                                            <Slider
                                                value={searchFilters.max_cook_time}
                                                onChange={(_, value) => setSearchFilters(prev => ({ ...prev, max_cook_time: value as number }))}
                                                min={5}
                                                max={180}
                                                step={5}
                                                marks={[{ value: 30, label: '30m' }, { value: 60, label: '1h' }, { value: 120, label: '2h' }]}
                                            />
                                        </Box>
                                        <FormControl fullWidth>
                                            <InputLabel>Cuisine Type</InputLabel>
                                            <Select
                                                value={searchFilters.cuisine}
                                                onChange={(e) => setSearchFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                                            >
                                                <MenuItem value="">Any</MenuItem>
                                                <MenuItem value="italian">Italian</MenuItem>
                                                <MenuItem value="chinese">Chinese</MenuItem>
                                                <MenuItem value="indian">Indian</MenuItem>
                                                <MenuItem value="mexican">Mexican</MenuItem>
                                                <MenuItem value="thai">Thai</MenuItem>
                                                <MenuItem value="american">American</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <InputLabel>Difficulty</InputLabel>
                                            <Select
                                                value={searchFilters.difficulty}
                                                onChange={(e) => setSearchFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                                            >
                                                <MenuItem value="">Any</MenuItem>
                                                <MenuItem value="easy">Easy</MenuItem>
                                                <MenuItem value="medium">Medium</MenuItem>
                                                <MenuItem value="hard">Hard</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Autocomplete
                                            multiple
                                            options={['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto']}
                                            value={searchFilters.dietary_tags}
                                            onChange={(_, value) => setSearchFilters(prev => ({ ...prev, dietary_tags: value }))}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Dietary Tags" placeholder="Select dietary preferences" />
                                            )}
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Paper>

                        {searchResults.length > 0 && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                                {searchResults.map((recipe) => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </Box>
                        )}
                    </Box>
                );

            case 1: // By Ingredients
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Find Recipes by Available Ingredients
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Available ingredients (comma-separated)"
                                    value={availableIngredients}
                                    onChange={(e) => setAvailableIngredients(e.target.value)}
                                    placeholder="chicken, rice, tomatoes, onions..."
                                    multiline
                                    rows={2}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleIngredientSearch}
                                    disabled={loading}
                                    startIcon={<Restaurant />}
                                >
                                    Find Recipes
                                </Button>
                            </Box>
                        </Paper>

                        {recipeMatches.length > 0 && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                                {recipeMatches.map((match) => (
                                    <RecipeCard
                                        key={match.recipe.id}
                                        recipe={match.recipe}
                                        showMatchScore={true}
                                        matchScore={match.match_score}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                );

            case 2: // Recommendations
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Personalized Recipe Recommendations
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleGetRecommendations}
                                disabled={loading}
                                startIcon={<Star />}
                            >
                                Get Recommendations
                            </Button>
                        </Paper>

                        {recommendations.length > 0 && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                                {recommendations.map((rec) => (
                                    <Card key={rec.recipe.id} sx={{ height: '100%', position: 'relative' }}>
                                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                            <Chip
                                                label={`${Math.round(rec.score * 100)}% match`}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                        <RecipeCard recipe={rec.recipe} />
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                );

            case 3: // Meal Planning
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Smart Meal Planning
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                                <TextField
                                    type="number"
                                    label="Days to plan"
                                    value={mealPlanDays}
                                    onChange={(e) => setMealPlanDays(Number(e.target.value))}
                                    inputProps={{ min: 1, max: 14 }}
                                />
                                <TextField
                                    type="number"
                                    label="Budget (LKR)"
                                    value={budgetConstraint}
                                    onChange={(e) => setBudgetConstraint(Number(e.target.value))}
                                    inputProps={{ min: 100 }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleGenerateMealPlan}
                                disabled={loading}
                                startIcon={<MenuBook />}
                            >
                                Generate Meal Plan
                            </Button>
                        </Paper>

                        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

                        {mealPlans.length > 0 && (
                            <Box sx={{ display: 'grid', gap: 3 }}>
                                {mealPlans.map((plan, index) => (
                                    <Paper key={index} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {new Date(plan.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                                            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                                const meal = plan[mealType as keyof typeof plan] as Recipe | null;
                                                return (
                                                    <Card key={mealType} variant="outlined">
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                                            </Typography>
                                                            {meal ? (
                                                                <Box>
                                                                    <Typography variant="subtitle1" gutterBottom>
                                                                        {meal.title}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                                        <Chip
                                                                            icon={<AccessTime />}
                                                                            label={formatTime(meal.prep_time + meal.cook_time)}
                                                                            size="small"
                                                                        />
                                                                        <Chip
                                                                            label={`${meal.nutrition.calories} cal`}
                                                                            size="small"
                                                                            color="secondary"
                                                                        />
                                                                    </Box>
                                                                    <Button
                                                                        size="small"
                                                                        onClick={() => openRecipeDialog(meal)}
                                                                    >
                                                                        View Recipe
                                                                    </Button>
                                                                </Box>
                                                            ) : (
                                                                <Typography color="text.secondary">
                                                                    No meal planned
                                                                </Typography>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Daily Nutrition Summary
                                                </Typography>
                                                <Typography variant="body2">
                                                    Total Calories: {plan.total_calories}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Estimated Cost
                                                </Typography>
                                                <Typography variant="body2">
                                                    LKR {plan.total_cost.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Smart Recipe Integration
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Discover personalized recipes, plan meals, and cook with ingredients you have
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Recipe Search" icon={<Search />} iconPosition="start" />
                    <Tab label="By Ingredients" icon={<Restaurant />} iconPosition="start" />
                    <Tab label="Recommendations" icon={<Star />} iconPosition="start" />
                    <Tab label="Meal Planning" icon={<MenuBook />} iconPosition="start" />
                </Tabs>
            </Paper>

            {renderTabContent()}

            {/* Recipe Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedRecipe?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedRecipe && (
                        <Box>
                            <Typography variant="body1" paragraph>
                                {selectedRecipe.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                <Chip icon={<AccessTime />} label={formatTime(selectedRecipe.prep_time + selectedRecipe.cook_time)} />
                                <Chip icon={<Person />} label={`${selectedRecipe.servings} servings`} />
                                <Chip label={selectedRecipe.difficulty} color="secondary" />
                                <Chip label={selectedRecipe.cuisine_type} variant="outlined" />
                            </Box>

                            <Typography variant="h6" gutterBottom>
                                Ingredients
                            </Typography>
                            <List dense>
                                {selectedRecipe.ingredients.map((ingredient, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                Instructions
                            </Typography>
                            <List>
                                {selectedRecipe.instructions.map((instruction, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`${index + 1}. ${instruction}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                Nutrition Information
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Calories</Typography>
                                    <Typography variant="h6">{selectedRecipe.nutrition.calories}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Protein</Typography>
                                    <Typography variant="h6">{selectedRecipe.nutrition.protein}g</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Carbs</Typography>
                                    <Typography variant="h6">{selectedRecipe.nutrition.carbs}g</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Fat</Typography>
                                    <Typography variant="h6">{selectedRecipe.nutrition.fat}g</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Fiber</Typography>
                                    <Typography variant="h6">{selectedRecipe.nutrition.fiber}g</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SmartRecipe;
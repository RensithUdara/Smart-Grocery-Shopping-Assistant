import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Divider,
} from '@mui/material';
import {
    Restaurant,
    Schedule,
    Lightbulb,
    ExpandMore,
    Kitchen,
    ShoppingCart,
    Favorite,
    Timer,
    Group,
    LocalDining,
    TrendingUp,
    CheckCircle,
    Add,
} from '@mui/icons-material';

// Meal Planning API functions (to be added to services/api.ts)
const mealPlanningApi = {
    getSuggestions: () =>
        fetch('/api/meal-planning/suggestions').then(res => res.json()),

    generateWeeklyPlan: (preferences: any) =>
        fetch('/api/meal-planning/weekly-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences)
        }).then(res => res.json()),

    getBatchSuggestions: () =>
        fetch('/api/meal-planning/batch-suggestions').then(res => res.json()),

    getRecipes: (filters: any = {}) => {
        const params = new URLSearchParams(filters);
        return fetch(`/api/meal-planning/recipes?${params}`).then(res => res.json());
    },

    checkIngredients: (recipeId: string) =>
        fetch('/api/meal-planning/ingredients-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe_id: recipeId })
        }).then(res => res.json()),

    getRecipeNutrition: (recipeId: string) =>
        fetch(`/api/meal-planning/recipe/${recipeId}/nutrition`).then(res => res.json()),

    generateShoppingList: (recipeIds: string[]) =>
        fetch('/api/meal-planning/shopping-list-from-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selected_recipes: recipeIds })
        }).then(res => res.json()),

    getDietaryOptions: () =>
        fetch('/api/meal-planning/dietary-options').then(res => res.json())
};

interface Recipe {
    recipe_id: string;
    name: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    category: string;
    difficulty: string;
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    ingredients: string[];
    instructions: string[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`meal-planning-tabpanel-${index}`}
            aria-labelledby={`meal-planning-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const MealPlanning: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [mealData, setMealData] = useState({
        suggestions: [] as any[],
        weeklyPlan: null as any,
        batchSuggestions: [] as any[],
        recipes: [] as Recipe[],
        dietaryOptions: null as any,
    });

    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const [planPreferences, setPlanPreferences] = useState({
        dietary_type: 'any',
        cooking_time: 'any',
        servings: 4
    });
    const [recipeDialog, setRecipeDialog] = useState<{ open: boolean, recipe: Recipe | null }>({
        open: false,
        recipe: null
    });

    const loadMealData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [suggestions, batchSuggestions, recipes, dietaryOptions] = await Promise.all([
                mealPlanningApi.getSuggestions().catch(() => []),
                mealPlanningApi.getBatchSuggestions().catch(() => []),
                mealPlanningApi.getRecipes().catch(() => []),
                mealPlanningApi.getDietaryOptions().catch(() => null)
            ]);

            setMealData({
                suggestions,
                weeklyPlan: null,
                batchSuggestions,
                recipes,
                dietaryOptions,
            });
        } catch (err) {
            setError('Failed to load meal planning data');
            console.error('Meal planning error:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateWeeklyPlan = async () => {
        try {
            setLoading(true);
            const weeklyPlan = await mealPlanningApi.generateWeeklyPlan(planPreferences);
            setMealData(prev => ({ ...prev, weeklyPlan }));
        } catch (err) {
            setError('Failed to generate weekly meal plan');
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeSelect = (recipeId: string) => {
        setSelectedRecipes(prev =>
            prev.includes(recipeId)
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const generateShoppingListFromRecipes = async () => {
        if (selectedRecipes.length === 0) {
            setError('Please select some recipes first');
            return;
        }

        try {
            const shoppingList = await mealPlanningApi.generateShoppingList(selectedRecipes);
            // Here you would typically navigate to shopping list page or show the results
            alert(`Generated shopping list with ${shoppingList.total_items} items!`);
        } catch (err) {
            setError('Failed to generate shopping list');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '#4caf50';
            case 'medium': return '#ff9800';
            case 'hard': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'breakfast': return <LocalDining />;
            case 'asian': return <Restaurant />;
            case 'italian': return <Restaurant />;
            case 'comfort': return <LocalDining />;
            case 'baking': return <Kitchen />;
            case 'salad': return <LocalDining />;
            default: return <Restaurant />;
        }
    };

    useEffect(() => {
        loadMealData();
    }, []);

    if (loading && tabValue === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
                🍽️ Meal Planning
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Recipe Suggestions" icon={<Lightbulb />} />
                    <Tab label="Weekly Meal Plan" icon={<Schedule />} />
                    <Tab label="Batch Cooking" icon={<Cook />} />
                    <Tab label="Recipe Browser" icon={<Restaurant />} />
                </Tabs>
            </Box>

            {/* Recipe Suggestions Tab */}
            <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    🥗 Recipes for Your Expiring Items
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Use up ingredients before they expire with these recipe suggestions
                </Typography>

                {mealData.suggestions.length === 0 ? (
                    <Alert severity="info">
                        No expiring items found. Check back when you have items nearing expiration!
                    </Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {mealData.suggestions.slice(0, 6).map((suggestion, index) => (
                            <Card key={index} sx={{ cursor: 'pointer' }} onClick={() => setRecipeDialog({ open: true, recipe: suggestion })}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getCategoryIcon(suggestion.category)}
                                            <Typography variant="h6">{suggestion.recipe_name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                size="small"
                                                label={suggestion.difficulty}
                                                sx={{ backgroundColor: getDifficultyColor(suggestion.difficulty), color: 'white' }}
                                            />
                                            <Chip size="small" label={`${suggestion.prep_time + suggestion.cook_time} min`} />
                                            <Chip size="small" label={`${suggestion.servings} servings`} />
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {suggestion.recommendation_reason}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Uses:</Typography>
                                        {suggestion.matching_ingredients.map((ingredient: string, i: number) => (
                                            <Chip key={i} size="small" label={ingredient} color="primary" variant="outlined" />
                                        ))}
                                    </Box>

                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">
                                            🔥 {suggestion.nutrition.calories} cal | 🥩 {suggestion.nutrition.protein}g protein
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant={selectedRecipes.includes(suggestion.recipe_id) ? "contained" : "outlined"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRecipeSelect(suggestion.recipe_id);
                                            }}
                                        >
                                            {selectedRecipes.includes(suggestion.recipe_id) ? 'Selected' : 'Select'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </TabPanel>

            {/* Weekly Meal Plan Tab */}
            <TabPanel value={tabValue} index={1}>
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Generate Weekly Meal Plan
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Dietary Type</InputLabel>
                                <Select
                                    value={planPreferences.dietary_type}
                                    label="Dietary Type"
                                    onChange={(e) => setPlanPreferences(prev => ({ ...prev, dietary_type: e.target.value }))}
                                >
                                    <MenuItem value="any">Any</MenuItem>
                                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                                    <MenuItem value="quick_meals">Quick Meals</MenuItem>
                                    <MenuItem value="healthy">Healthy</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Cooking Time</InputLabel>
                                <Select
                                    value={planPreferences.cooking_time}
                                    label="Cooking Time"
                                    onChange={(e) => setPlanPreferences(prev => ({ ...prev, cooking_time: e.target.value }))}
                                >
                                    <MenuItem value="any">Any</MenuItem>
                                    <MenuItem value="quick">Quick (≤15 min)</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                type="number"
                                label="Servings"
                                value={planPreferences.servings}
                                onChange={(e) => setPlanPreferences(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                                sx={{ width: 100 }}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            onClick={generateWeeklyPlan}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Schedule />}
                        >
                            Generate Meal Plan
                        </Button>
                    </CardContent>
                </Card>

                {mealData.weeklyPlan && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Weekly Meal Plan - {mealData.weeklyPlan.week_start}
                            </Typography>

                            {Object.entries(mealData.weeklyPlan.daily_meals || {}).map(([date, meals]: [string, any]) => (
                                <Box key={date} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        {['breakfast', 'lunch', 'dinner'].map(mealType => {
                                            const meal = meals[mealType];
                                            return meal ? (
                                                <Card key={mealType} sx={{ minWidth: 200, flex: 1 }}>
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {mealType.toUpperCase()}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {meal.name}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            ⏱️ {meal.prep_time + meal.cook_time} min
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ) : null;
                                        })}
                                    </Box>
                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))}

                            {mealData.weeklyPlan.shopping_additions?.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        Additional Shopping Items Needed
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {mealData.weeklyPlan.shopping_additions.slice(0, 10).map((item: any, index: number) => (
                                            <Chip key={index} size="small" label={item.ingredient} />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}
            </TabPanel>

            {/* Batch Cooking Tab */}
            <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    🥘 Batch Cooking Suggestions
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Prepare meals in advance to save time during the week
                </Typography>

                {mealData.batchSuggestions.length === 0 ? (
                    <Alert severity="info">
                        Add more ingredients to your shopping list to get batch cooking suggestions!
                    </Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {mealData.batchSuggestions.map((batch, index) => (
                            <Card key={index}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6">{batch.recipe.name}</Typography>
                                        <Chip label={`${batch.portions} portions`} color="primary" />
                                    </Box>

                                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                                        {batch.prep_benefit}
                                    </Typography>

                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        <strong>Storage:</strong> {batch.storage_tips}
                                    </Typography>

                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        <strong>Reheating:</strong> {batch.reheating_instructions}
                                    </Typography>

                                    {batch.missing_ingredients.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Still need:</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                                {batch.missing_ingredients.map((ingredient: string, i: number) => (
                                                    <Chip key={i} size="small" label={ingredient} variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </TabPanel>

            {/* Recipe Browser Tab */}
            <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    📚 Browse All Recipes
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {mealData.recipes.slice(0, 8).map((recipe) => (
                        <Card key={recipe.recipe_id} sx={{ cursor: 'pointer' }} onClick={() => setRecipeDialog({ open: true, recipe })}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getCategoryIcon(recipe.category)}
                                        <Typography variant="h6">{recipe.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            size="small"
                                            label={recipe.difficulty}
                                            sx={{ backgroundColor: getDifficultyColor(recipe.difficulty), color: 'white' }}
                                        />
                                        <Chip size="small" label={`${recipe.prep_time + recipe.cook_time} min`} />
                                        <Chip size="small" label={`${recipe.servings} servings`} />
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">
                                        🔥 {recipe.nutrition.calories} cal | 🥩 {recipe.nutrition.protein}g protein
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant={selectedRecipes.includes(recipe.recipe_id) ? "contained" : "outlined"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRecipeSelect(recipe.recipe_id);
                                        }}
                                    >
                                        {selectedRecipes.includes(recipe.recipe_id) ? 'Selected' : 'Select'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </TabPanel>

            {/* Selected Recipes Summary */}
            {selectedRecipes.length > 0 && (
                <Card sx={{ position: 'fixed', bottom: 16, right: 16, minWidth: 300, zIndex: 1000 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Selected Recipes ({selectedRecipes.length})
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={generateShoppingListFromRecipes}
                            startIcon={<ShoppingCart />}
                            sx={{ mt: 1 }}
                        >
                            Generate Shopping List
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Recipe Details Dialog */}
            <Dialog
                open={recipeDialog.open}
                onClose={() => setRecipeDialog({ open: false, recipe: null })}
                maxWidth="md"
                fullWidth
            >
                {recipeDialog.recipe && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getCategoryIcon(recipeDialog.recipe.category)}
                                {recipeDialog.recipe.name || recipeDialog.recipe.recipe_name}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small"
                                    label={recipeDialog.recipe.difficulty}
                                    sx={{ backgroundColor: getDifficultyColor(recipeDialog.recipe.difficulty), color: 'white' }}
                                />
                                <Chip size="small" label={`⏱️ ${(recipeDialog.recipe.prep_time || 0) + (recipeDialog.recipe.cook_time || 0)} min`} />
                                <Chip size="small" label={`👥 ${recipeDialog.recipe.servings} servings`} />
                                <Chip size="small" label={`🔥 ${recipeDialog.recipe.nutrition.calories} cal`} />
                            </Box>

                            <Typography variant="h6" sx={{ mb: 1 }}>Ingredients:</Typography>
                            <List dense>
                                {recipeDialog.recipe.ingredients.map((ingredient: string, index: number) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CheckCircle fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={ingredient} />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Instructions:</Typography>
                            <List>
                                {recipeDialog.recipe.instructions.map((step: string, index: number) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <Chip size="small" label={index + 1} />
                                        </ListItemIcon>
                                        <ListItemText primary={step} />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setRecipeDialog({ open: false, recipe: null })}>
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleRecipeSelect(recipeDialog.recipe!.recipe_id);
                                    setRecipeDialog({ open: false, recipe: null });
                                }}
                            >
                                {selectedRecipes.includes(recipeDialog.recipe.recipe_id) ? 'Remove from Selection' : 'Add to Selection'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default MealPlanning;
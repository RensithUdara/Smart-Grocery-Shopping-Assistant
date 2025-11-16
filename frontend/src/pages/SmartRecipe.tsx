import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tab,
    Tabs,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Alert,
    Slider,
    CircularProgress,
    Rating,
    Divider,
    IconButton,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    Restaurant,
    AccessTime,
    Person,
    LocalOffer,
    Kitchen,
    ExpandMore,
    Search,
    FilterList,
    Schedule,
    ShoppingCart,
    Lightbulb,
    MenuBook,
    Close,
    Star,
    TimerOutlined,
    LocalDining,
    Nutrition,
    SwapHoriz
} from '@mui/icons-material';
import { api } from '../services/api';

interface Recipe {
    id: string;
    name: string;
    description: string;
    ingredients: Array<{
        item: string;
        amount: number;
        unit: string;
        optional: boolean;
    }>;
    instructions: string[];
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    cuisine_type: string;
    dietary_tags: string[];
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    rating: number;
    image_url: string;
}

interface RecipeMatch {
    recipe: Recipe;
    match_score: number;
    missing_ingredients: string[];
    missing_count: number;
}

interface RecipeRecommendation {
    recipe: Recipe;
    recommendation_score: number;
    score_factors: {
        cuisine: number;
        time: number;
        difficulty: number;
        ingredients: number;
        rating: number;
    };
    dietary_compatible: boolean;
}

interface MealPlan {
    date: string;
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
    snack: Recipe | null;
    total_nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    estimated_cost: number;
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
        max_cook_time: 120,
        difficulty: [] as string[],
        cuisine_type: [] as string[],
        dietary_tags: [] as string[]
    });

    // Ingredient-based Recipe State
    const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
    const [ingredientInput, setIngredientInput] = useState('');
    const [recipeMatches, setRecipeMatches] = useState<RecipeMatch[]>([]);
    const [matchThreshold, setMatchThreshold] = useState(0.6);

    // Recipe Recommendations State
    const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);

    // Meal Planning State
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [mealPlanDays, setMealPlanDays] = useState(7);
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

    // Recipe Details Dialog
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);

    // Categories
    const [categories, setCategories] = useState({
        cuisines: [] as string[],
        difficulties: [] as string[],
        dietary_tags: [] as string[],
        prep_time_range: { min: 0, max: 180 },
        cook_time_range: { min: 0, max: 300 }
    });

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
        loadRecommendations();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await api.get('/api/recipe/categories');
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/recipe/recommendations');
            if (response.data.success) {
                setRecommendations(response.data.recommendations);
            }
        } catch (err) {
            setError('Failed to load recommendations');
            console.error('Error loading recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                query: searchQuery,
                max_prep_time: searchFilters.max_prep_time.toString(),
                max_cook_time: searchFilters.max_cook_time.toString(),
                difficulty: searchFilters.difficulty.join(','),
                cuisine_type: searchFilters.cuisine_type.join(','),
                dietary_tags: searchFilters.dietary_tags.join(',')
            });

            const response = await api.get(`/api/recipe/search?${params}`);
            if (response.data.success) {
                setSearchResults(response.data.recipes.map((result: any) => result.recipe || result));
            }
        } catch (err) {
            setError('Failed to search recipes');
            console.error('Error searching recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIngredient = () => {
        if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim())) {
            setAvailableIngredients([...availableIngredients, ingredientInput.trim()]);
            setIngredientInput('');
        }
    };

    const handleRemoveIngredient = (ingredient: string) => {
        setAvailableIngredients(availableIngredients.filter(ing => ing !== ingredient));
    };

    const findRecipesByIngredients = async () => {
        if (availableIngredients.length === 0) {
            setError('Please add at least one ingredient');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/api/recipe/by-ingredients', {
                ingredients: availableIngredients,
                match_threshold: matchThreshold
            });

            if (response.data.success) {
                setRecipeMatches(response.data.matches);
            }
        } catch (err) {
            setError('Failed to find recipes by ingredients');
            console.error('Error finding recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateMealPlan = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/api/recipe/meal-plan', {
                days: mealPlanDays,
                dietary_preferences: dietaryPreferences
            });

            if (response.data.success) {
                setMealPlans(response.data.meal_plans);
            }
        } catch (err) {
            setError('Failed to generate meal plan');
            console.error('Error generating meal plan:', err);
        } finally {
            setLoading(false);
        }
    };

    const openRecipeDialog = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setRecipeDialogOpen(true);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'error';
            default: return 'default';
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const RecipeCard = ({ recipe, showMatchScore, matchScore, missingIngredients }: {
        recipe: Recipe;
        showMatchScore?: boolean;
        matchScore?: number;
        missingIngredients?: string[];
    }) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="200"
                image={recipe.image_url || '/images/default-recipe.jpg'}
                alt={recipe.name}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                    {recipe.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                    {recipe.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    <Chip
                        icon={<AccessTime />}
                        label={`${formatTime(recipe.prep_time + recipe.cook_time)}`}
                        size="small"
                    />
                    <Chip
                        icon={<Person />}
                        label={`${recipe.servings} servings`}
                        size="small"
                    />
                    <Chip
                        label={recipe.difficulty}
                        size="small"
                        color={getDifficultyColor(recipe.difficulty) as any}
                    />
                    <Chip
                        label={recipe.cuisine_type}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {showMatchScore && matchScore !== undefined && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="primary">
                            Match Score: {Math.round(matchScore * 100)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={matchScore * 100}
                            sx={{ mt: 0.5 }}
                        />
                        {missingIngredients && missingIngredients.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                Missing: {missingIngredients.slice(0, 3).join(', ')}
                                {missingIngredients.length > 3 && ` +${missingIngredients.length - 3} more`}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={recipe.rating} readOnly precision={0.1} size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                        {recipe.rating.toFixed(1)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {recipe.dietary_tags.slice(0, 3).map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            color="secondary"
                        />
                    ))}
                    {recipe.dietary_tags.length > 3 && (
                        <Chip
                            label={`+${recipe.dietary_tags.length - 3}`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => openRecipeDialog(recipe)}
                >
                    View Recipe
                </Button>
            </Box>
        </Card>
    );

    const tabContent = () => {
        switch (activeTab) {
            case 0: // Recipe Search
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Search recipes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton onClick={handleSearch} disabled={loading}>
                                                <Search />
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FilterList sx={{ mr: 1 }} />
                                        <Typography>Advanced Filters</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography gutterBottom>Max Prep Time: {formatTime(searchFilters.max_prep_time)}</Typography>
                                            <Slider
                                                value={searchFilters.max_prep_time}
                                                onChange={(_, value) => setSearchFilters({ ...searchFilters, max_prep_time: value as number })}
                                                min={5}
                                                max={180}
                                                step={5}
                                                marks={[
                                                    { value: 15, label: '15m' },
                                                    { value: 60, label: '1h' },
                                                    { value: 120, label: '2h' }
                                                ]}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography gutterBottom>Max Cook Time: {formatTime(searchFilters.max_cook_time)}</Typography>
                                            <Slider
                                                value={searchFilters.max_cook_time}
                                                onChange={(_, value) => setSearchFilters({ ...searchFilters, max_cook_time: value as number })}
                                                min={0}
                                                max={300}
                                                step={15}
                                                marks={[
                                                    { value: 30, label: '30m' },
                                                    { value: 120, label: '2h' },
                                                    { value: 240, label: '4h' }
                                                ]}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Cuisine Type</InputLabel>
                                                <Select
                                                    multiple
                                                    value={searchFilters.cuisine_type}
                                                    onChange={(e) => setSearchFilters({ ...searchFilters, cuisine_type: e.target.value as string[] })}
                                                >
                                                    {categories.cuisines.map((cuisine) => (
                                                        <MenuItem key={cuisine} value={cuisine}>
                                                            {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Difficulty</InputLabel>
                                                <Select
                                                    multiple
                                                    value={searchFilters.difficulty}
                                                    onChange={(e) => setSearchFilters({ ...searchFilters, difficulty: e.target.value as string[] })}
                                                >
                                                    {categories.difficulties.map((difficulty) => (
                                                        <MenuItem key={difficulty} value={difficulty}>
                                                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Dietary Tags</InputLabel>
                                                <Select
                                                    multiple
                                                    value={searchFilters.dietary_tags}
                                                    onChange={(e) => setSearchFilters({ ...searchFilters, dietary_tags: e.target.value as string[] })}
                                                >
                                                    {categories.dietary_tags.map((tag) => (
                                                        <MenuItem key={tag} value={tag}>
                                                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Paper>

                        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

                        {searchResults.length > 0 && (
                            <Grid container spacing={3}>
                                {searchResults.map((recipe) => (
                                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                                        <RecipeCard recipe={recipe} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );

            case 1: // Ingredient-Based Recipes
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Find Recipes with Your Ingredients
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Add ingredient..."
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                />
                                <Button variant="contained" onClick={handleAddIngredient}>
                                    Add
                                </Button>
                            </Box>

                            {availableIngredients.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Available Ingredients ({availableIngredients.length}):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {availableIngredients.map((ingredient) => (
                                            <Chip
                                                key={ingredient}
                                                label={ingredient}
                                                onDelete={() => handleRemoveIngredient(ingredient)}
                                                color="primary"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ mb: 3 }}>
                                <Typography gutterBottom>
                                    Match Threshold: {Math.round(matchThreshold * 100)}%
                                </Typography>
                                <Slider
                                    value={matchThreshold}
                                    onChange={(_, value) => setMatchThreshold(value as number)}
                                    min={0.3}
                                    max={1.0}
                                    step={0.1}
                                    marks={[
                                        { value: 0.3, label: '30%' },
                                        { value: 0.6, label: '60%' },
                                        { value: 1.0, label: '100%' }
                                    ]}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                onClick={findRecipesByIngredients}
                                disabled={availableIngredients.length === 0 || loading}
                                startIcon={<Search />}
                            >
                                Find Recipes
                            </Button>
                        </Paper>

                        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

                        {recipeMatches.length > 0 && (
                            <Grid container spacing={3}>
                                {recipeMatches.map((match) => (
                                    <Grid item xs={12} sm={6} md={4} key={match.recipe.id}>
                                        <RecipeCard
                                            recipe={match.recipe}
                                            showMatchScore={true}
                                            matchScore={match.match_score}
                                            missingIngredients={match.missing_ingredients}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );

            case 2: // Personalized Recommendations
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Personalized Recipe Recommendations
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Based on your preferences, cooking skills, and dietary requirements
                            </Typography>
                            <Button variant="outlined" onClick={loadRecommendations} disabled={loading}>
                                Refresh Recommendations
                            </Button>
                        </Paper>

                        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

                        {recommendations.length > 0 && (
                            <Grid container spacing={3}>
                                {recommendations.map((rec) => (
                                    <Grid item xs={12} sm={6} md={4} key={rec.recipe.id}>
                                        <Card sx={{ height: '100%', position: 'relative' }}>
                                            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                                <Chip
                                                    label={`${Math.round(rec.recommendation_score * 100)}% Match`}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                            <RecipeCard recipe={rec.recipe} />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
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

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Number of Days</InputLabel>
                                    <Select
                                        value={mealPlanDays}
                                        onChange={(e) => setMealPlanDays(e.target.value as number)}
                                    >
                                        <MenuItem value={3}>3 days</MenuItem>
                                        <MenuItem value={7}>1 week</MenuItem>
                                        <MenuItem value={14}>2 weeks</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Dietary Preferences</InputLabel>
                                    <Select
                                        multiple
                                        value={dietaryPreferences}
                                        onChange={(e) => setDietaryPreferences(e.target.value as string[])}
                                    >
                                        {categories.dietary_tags.map((tag) => (
                                            <MenuItem key={tag} value={tag}>
                                                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>                                    variant="contained"
                            onClick={generateMealPlan}
                            disabled={loading}
                            startIcon={<MenuBook />}
                                >
                            Generate Meal Plan
                        </Button>
                    </Box>
                        </Paper >

    { loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

{
    mealPlans.length > 0 && (
        <Grid container spacing={3}>
            {mealPlans.map((plan, index) => (
                <Grid item xs={12} key={index}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {new Date(plan.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>

                        <Grid container spacing={2}>
                            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                const meal = plan[mealType as keyof typeof plan] as Recipe | null;
                                return (
                                    <Grid item xs={12} md={4} key={mealType}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                                </Typography>
                                                {meal ? (
                                                    <Box>
                                                        <Typography variant="body1" gutterBottom>
                                                            {meal.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                            <Chip
                                                                icon={<AccessTime />}
                                                                label={formatTime(meal.prep_time + meal.cook_time)}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={`${meal.nutrition.calories} cal`}
                                                                size="small"
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
                                    </Box>
                                );
                            })}
                        </Box>                                            <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Daily Nutrition Summary
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip label={`${Math.round(plan.total_nutrition.calories)} calories`} />
                                    <Chip label={`${Math.round(plan.total_nutrition.protein)}g protein`} />
                                    <Chip label={`${Math.round(plan.total_nutrition.carbs)}g carbs`} />
                                    <Chip label={`${Math.round(plan.total_nutrition.fat)}g fat`} />
                                    <Chip label={`${Math.round(plan.total_nutrition.fiber)}g fiber`} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Estimated Cost
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    Rs.{plan.estimated_cost.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    )
}
                    </Box >
                );

            default:
return null;
        }
    };

return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Restaurant sx={{ mr: 2, color: 'primary.main' }} />
            Smart Recipe Integration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Discover recipes, plan meals, and optimize your cooking with AI-powered recommendations
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
                <Tab icon={<Search />} label="Recipe Search" />
                <Tab icon={<Kitchen />} label="By Ingredients" />
                <Tab icon={<Star />} label="Recommendations" />
                <Tab icon={<MenuBook />} label="Meal Planning" />
            </Tabs>
        </Paper>

        {tabContent()}

        {/* Recipe Details Dialog */}
        <Dialog
            open={recipeDialogOpen}
            onClose={() => setRecipeDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            {selectedRecipe && (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">{selectedRecipe.name}</Typography>
                        <IconButton onClick={() => setRecipeDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 3 }}>
                            <img
                                src={selectedRecipe.image_url || '/images/default-recipe.jpg'}
                                alt={selectedRecipe.name}
                                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </Box>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {selectedRecipe.description}
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    <Chip icon={<TimerOutlined />} label={`Prep: ${formatTime(selectedRecipe.prep_time)}`} />
                                    <Chip icon={<AccessTime />} label={`Cook: ${formatTime(selectedRecipe.cook_time)}`} />
                                    <Chip icon={<Person />} label={`${selectedRecipe.servings} servings`} />
                                    <Chip
                                        label={selectedRecipe.difficulty}
                                        color={getDifficultyColor(selectedRecipe.difficulty) as any}
                                    />
                                </Box>

                                <Typography variant="h6" gutterBottom>
                                    Ingredients
                                </Typography>
                                <List dense>
                                    {selectedRecipe.ingredients.map((ingredient, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
                                                secondary={ingredient.optional ? 'Optional' : ''}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Instructions
                                </Typography>
                                {selectedRecipe.instructions.map((instruction, index) => (
                                    <Box key={index} sx={{ mb: 2, display: 'flex' }}>
                                        <Typography variant="h6" sx={{ mr: 2, color: 'primary.main' }}>
                                            {index + 1}.
                                        </Typography>
                                        <Typography variant="body1">
                                            {instruction}
                                        </Typography>
                                    </Box>
                                ))}

                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                    Nutrition (per serving)
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip label={`${selectedRecipe.nutrition.calories} calories`} variant="outlined" />
                                    <Chip label={`${selectedRecipe.nutrition.protein}g protein`} variant="outlined" />
                                    <Chip label={`${selectedRecipe.nutrition.carbs}g carbs`} variant="outlined" />
                                    <Chip label={`${selectedRecipe.nutrition.fat}g fat`} variant="outlined" />
                                </Box>

                                {selectedRecipe.dietary_tags.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Dietary Tags
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selectedRecipe.dietary_tags.map((tag) => (
                                                <Chip key={tag} label={tag} size="small" color="secondary" />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button startIcon={<ShoppingCart />} variant="outlined">
                            Add to Shopping List
                        </Button>
                        <Button onClick={() => setRecipeDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    </Box>
);
};

export default SmartRecipe;
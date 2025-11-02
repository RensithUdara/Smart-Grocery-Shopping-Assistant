import React, { useState } from 'react';
import { 
    Box, Typography, Card, CardContent, TextField, Button, Chip, Alert, 
    Tabs, Tab, LinearProgress, Divider, List, ListItem, ListItemText,
    FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { 
    LocalHospital as LocalHospitalIcon,
    Restaurant as RestaurantIcon,
    Warning as WarningIcon,
    Lightbulb as LightbulbIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import apiService from '../services/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Nutrition: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [itemsText, setItemsText] = useState('banana,1\nmilk,1\nbread,2\negg,2');
    const [analysis, setAnalysis] = useState<any>(null);
    const [allergiesText, setAllergiesText] = useState('milk,egg,nuts');
    const [allergenResult, setAllergenResult] = useState<any>(null);
    const [substitutions, setSubstitutions] = useState<any>(null);
    const [healthySwaps, setHealthySwaps] = useState<any>(null);
    const [mealCompliance, setMealCompliance] = useState<any>(null);
    const [dietaryGoal, setDietaryGoal] = useState('weight_loss');
    const [loading, setLoading] = useState(false);

    const parseItems = (text: string) => {
        return text.split('\n').map(line => {
            const parts = line.split(',').map(p => p.trim());
            return { name: parts[0], servings: parts[1] ? Number(parts[1]) : 1 };
        });
    };

    const runAnalysis = async () => {
        const items = parseItems(itemsText);
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/analyze', { items });
            setAnalysis(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const runAllergenCheck = async () => {
        const items = parseItems(itemsText).map(i => i.name);
        const allergies = allergiesText.split(',').map(s => s.trim()).filter(Boolean);
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/check-allergens', { items, allergies });
            setAllergenResult(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const runSubstitutions = async (item: string) => {
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/substitutions', { item });
            setSubstitutions(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const runHealthySwaps = async () => {
        const items = parseItems(itemsText).map(i => i.name);
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/healthy-swaps', { items });
            setHealthySwaps(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const runMealCompliance = async () => {
        const items = parseItems(itemsText);
        const goals = { diet_type: dietaryGoal };
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/meal-compliance', { items, goals });
            setMealCompliance(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalHospitalIcon /> Nutrition & Health Intelligence
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab icon={<RestaurantIcon />} label="Meal Analysis" />
                    <Tab icon={<WarningIcon />} label="Allergen Check" />
                    <Tab icon={<LightbulbIcon />} label="Smart Substitutions" />
                    <Tab icon={<CheckCircleIcon />} label="Health Goals" />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mt: 2 }} />}

            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Analyze Meal / Recipe</Typography>
                            <Typography variant="caption" color="text.secondary" paragraph>
                                Enter one item per line: name,servings
                            </Typography>
                            <TextField
                                multiline
                                minRows={6}
                                fullWidth
                                sx={{ mb: 2 }}
                                value={itemsText}
                                onChange={(e) => setItemsText(e.target.value)}
                                placeholder="banana,1&#10;milk,1&#10;bread,2&#10;egg,2"
                            />
                            <Button variant="contained" onClick={runAnalysis} disabled={loading} fullWidth>
                                Analyze Nutrition
                            </Button>
                        </CardContent>
                    </Card>

                    {analysis && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Nutrition Summary</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Calories</Typography>
                                        <Typography variant="h6">{analysis.summary.calories}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Protein</Typography>
                                        <Typography variant="h6">{analysis.summary.protein_g}g</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Carbs</Typography>
                                        <Typography variant="h6">{analysis.summary.carbs_g}g</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Fat</Typography>
                                        <Typography variant="h6">{analysis.summary.fat_g}g</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Fiber</Typography>
                                        <Typography variant="h6">{analysis.summary.fiber_g}g</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Sugar</Typography>
                                        <Typography variant="h6">{analysis.summary.sugar_g}g</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Chip 
                                    label={`Nutrition Score: ${analysis.nutrition_score}/100`} 
                                    color={analysis.nutrition_score >= 70 ? "success" : analysis.nutrition_score >= 50 ? "warning" : "error"}
                                    sx={{ mt: 1 }} 
                                />
                                {analysis.detailed_breakdown && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Item Breakdown:</Typography>
                                        <List dense>
                                            {analysis.detailed_breakdown.map((item: any, idx: number) => (
                                                <ListItem key={idx}>
                                                    <ListItemText 
                                                        primary={`${item.name} (${item.servings}x)`}
                                                        secondary={`${item.calories} cal, ${item.protein_g}g protein`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Allergen Safety Check</Typography>
                            <Typography variant="caption" color="text.secondary" paragraph>
                                Enter comma-separated allergies (e.g., milk, egg, nuts)
                            </Typography>
                            <TextField 
                                fullWidth 
                                sx={{ mb: 2 }} 
                                value={allergiesText} 
                                onChange={(e) => setAllergiesText(e.target.value)}
                                placeholder="milk,egg,nuts,gluten"
                            />
                            <Button variant="contained" onClick={runAllergenCheck} disabled={loading} fullWidth>
                                Check for Allergens
                            </Button>
                        </CardContent>
                    </Card>

                    {allergenResult && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Allergen Analysis</Typography>
                                {allergenResult.safe ? (
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">All Clear!</Typography>
                                        No allergen matches found in your meal.
                                    </Alert>
                                ) : (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">Allergen Alert!</Typography>
                                        Found potential allergen matches.
                                    </Alert>
                                )}
                                {allergenResult.issues && allergenResult.issues.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>Detected Issues:</Typography>
                                        <List dense>
                                            {allergenResult.issues.map((issue: any, idx: number) => (
                                                <ListItem key={idx}>
                                                    <ListItemText 
                                                        primary={issue.item}
                                                        secondary={`Contains: ${issue.allergens.join(', ')}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Smart Substitutions</Typography>
                            <Button 
                                variant="contained" 
                                onClick={runHealthySwaps} 
                                disabled={loading}
                                sx={{ mr: 2, mb: 2 }}
                            >
                                Get Healthy Swaps
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => runSubstitutions('milk')} 
                                disabled={loading}
                                sx={{ mb: 2 }}
                            >
                                Substitute Milk
                            </Button>
                            <Typography variant="caption" display="block" color="text.secondary">
                                Get healthier alternatives for your ingredients based on nutrition and dietary goals.
                            </Typography>
                        </CardContent>
                    </Card>

                    {(healthySwaps || substitutions) && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Recommendations</Typography>
                                {healthySwaps && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Healthy Swaps:</Typography>
                                        <List dense>
                                            {healthySwaps.map((swap: any, idx: number) => (
                                                <ListItem key={idx}>
                                                    <ListItemText 
                                                        primary={`${swap.original} → ${swap.substitute}`}
                                                        secondary={swap.reason}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                                {substitutions && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>Substitution Options:</Typography>
                                        <List dense>
                                            {substitutions.map((sub: string, idx: number) => (
                                                <ListItem key={idx}>
                                                    <ListItemText primary={sub} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Dietary Goal Compliance</Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Dietary Goal</InputLabel>
                                <Select
                                    value={dietaryGoal}
                                    label="Dietary Goal"
                                    onChange={(e) => setDietaryGoal(e.target.value)}
                                >
                                    <MenuItem value="weight_loss">Weight Loss</MenuItem>
                                    <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                                    <MenuItem value="heart_healthy">Heart Healthy</MenuItem>
                                    <MenuItem value="low_sodium">Low Sodium</MenuItem>
                                    <MenuItem value="diabetic">Diabetic Friendly</MenuItem>
                                    <MenuItem value="keto">Ketogenic</MenuItem>
                                </Select>
                            </FormControl>
                            <Button 
                                variant="contained" 
                                onClick={runMealCompliance} 
                                disabled={loading}
                                fullWidth
                            >
                                Check Goal Compliance
                            </Button>
                        </CardContent>
                    </Card>

                    {mealCompliance && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Compliance Analysis</Typography>
                                <Alert 
                                    severity={mealCompliance.compliant ? "success" : "warning"} 
                                    sx={{ mb: 2 }}
                                >
                                    <Typography variant="subtitle2">
                                        {mealCompliance.compliant ? "Goal Compliant!" : "Needs Adjustment"}
                                    </Typography>
                                    {mealCompliance.message}
                                </Alert>
                                
                                {mealCompliance.score !== undefined && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Compliance Score: {mealCompliance.score}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={mealCompliance.score} 
                                            color={mealCompliance.score >= 70 ? "success" : "warning"}
                                        />
                                    </Box>
                                )}

                                {mealCompliance.recommendations && mealCompliance.recommendations.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                                        <List dense>
                                            {mealCompliance.recommendations.map((rec: string, idx: number) => (
                                                <ListItem key={idx}>
                                                    <ListItemText primary={rec} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </TabPanel>
        </Box>
    );
};

export default Nutrition;

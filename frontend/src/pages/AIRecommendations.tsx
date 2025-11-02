import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Tabs,
    Tab,
    LinearProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import {
    Psychology as AIIcon,
    TrendingUp as TrendingUpIcon,
    Lightbulb as RecommendationIcon,
    Timeline as PredictionIcon,
    OptimizeIcon,
    CalendarToday as SeasonalIcon,
    ExpandMore as ExpandMoreIcon,
    Star as StarIcon,
    ShoppingCart as CartIcon,
    Category as CategoryIcon,
    Speed as EfficiencyIcon,
    Insights as InsightsIcon,
    AutoAwesome as MagicIcon,
    Schedule as ScheduleIcon
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
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const AIRecommendations: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<any>(null);
    const [seasonalForecast, setSeasonalForecast] = useState<any>(null);
    const [purchaseIntelligence, setPurchaseIntelligence] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [shoppingInsights, setShoppingInsights] = useState<any>(null);
    const [modelStats, setModelStats] = useState<any>(null);

    // Form states
    const [recommendationLimit, setRecommendationLimit] = useState(10);
    const [predictionDays, setPredictionDays] = useState(7);
    const [forecastMonths, setForecastMonths] = useState(3);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadRecommendations(),
                loadPredictions(),
                loadSeasonalForecast(),
                loadPurchaseIntelligence(),
                loadUserProfile(),
                loadShoppingInsights(),
                loadModelStats()
            ]);
        } catch (error) {
            console.error('Error loading AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendations = async () => {
        try {
            const response = await apiService.get(`/api/ml/recommendations?limit=${recommendationLimit}`);
            setRecommendations(response.data.data?.recommendations || []);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    };

    const loadPredictions = async () => {
        try {
            const response = await apiService.get(`/api/ml/predictions?days_ahead=${predictionDays}`);
            setPredictions(response.data.data?.predictions);
        } catch (error) {
            console.error('Error loading predictions:', error);
        }
    };

    const loadSeasonalForecast = async () => {
        try {
            const response = await apiService.get(`/api/ml/seasonal-forecast?months_ahead=${forecastMonths}`);
            setSeasonalForecast(response.data.data?.forecast);
        } catch (error) {
            console.error('Error loading seasonal forecast:', error);
        }
    };

    const loadPurchaseIntelligence = async () => {
        try {
            const response = await apiService.get('/api/ml/purchase-intelligence');
            setPurchaseIntelligence(response.data.data?.analysis);
        } catch (error) {
            console.error('Error loading purchase intelligence:', error);
        }
    };

    const loadUserProfile = async () => {
        try {
            const response = await apiService.get('/api/ml/user-profile');
            setUserProfile(response.data.data);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const loadShoppingInsights = async () => {
        try {
            const response = await apiService.get('/api/ml/shopping-insights');
            setShoppingInsights(response.data.data);
        } catch (error) {
            console.error('Error loading shopping insights:', error);
        }
    };

    const loadModelStats = async () => {
        try {
            const response = await apiService.get('/api/ml/model-stats');
            setModelStats(response.data.data);
        } catch (error) {
            console.error('Error loading model stats:', error);
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'primary';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AIIcon /> AI-Powered Shopping Intelligence
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Leverage machine learning to optimize your shopping experience with personalized recommendations,
                predictive analytics, and intelligent insights.
            </Typography>

            {/* Model Performance Summary */}
            {modelStats && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2">
                            <strong>AI Model Active:</strong> {modelStats.model_info?.algorithm_type}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Confidence:</strong> {modelStats.performance_metrics?.recommendation_confidence}%
                        </Typography>
                        <Typography variant="body2">
                            <strong>Data Points:</strong> {modelStats.model_info?.training_data_points}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Categories:</strong> {modelStats.model_info?.categories_tracked}
                        </Typography>
                    </Box>
                </Alert>
            )}

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Main Tabs */}
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Smart Recommendations" icon={<RecommendationIcon />} />
                <Tab label="Predictive Analytics" icon={<PredictionIcon />} />
                <Tab label="Seasonal Intelligence" icon={<SeasonalIcon />} />
                <Tab label="Purchase Intelligence" icon={<InsightsIcon />} />
                <Tab label="User Profile" icon={<CategoryIcon />} />
            </Tabs>

            {/* Smart Recommendations Tab */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Personalized Recommendations</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Items"
                            type="number"
                            size="small"
                            value={recommendationLimit}
                            onChange={(e) => setRecommendationLimit(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                        <Button variant="outlined" onClick={loadRecommendations} disabled={loading}>
                            Refresh
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 2 }}>
                    {recommendations.map((rec, index) => (
                        <Card key={index} sx={{ border: rec.confidence_score >= 80 ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h6" color="primary">
                                        {rec.item_name}
                                    </Typography>
                                    <Chip
                                        icon={<StarIcon />}
                                        label={`${rec.confidence_score}%`}
                                        size="small"
                                        color={getConfidenceColor(rec.confidence_score)}
                                    />
                                </Box>

                                <Typography color="text.secondary" gutterBottom>
                                    <CategoryIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    {rec.category}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Estimated Price:</strong> ${rec.estimated_price}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Suggested Quantity:</strong> {rec.predicted_quantity}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Seasonal Factor:</strong> ×{rec.seasonal_factor}
                                    </Typography>
                                </Box>

                                <Alert severity="info" size="small" sx={{ mb: 1 }}>
                                    {rec.reason}
                                </Alert>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={rec.purchase_urgency}
                                        size="small"
                                        color={getUrgencyColor(rec.purchase_urgency)}
                                    />
                                    {rec.health_benefit && (
                                        <Chip label="Health+" size="small" color="success" variant="outlined" />
                                    )}
                                    {rec.seasonal_factor > 1.2 && (
                                        <Chip label="Seasonal Peak" size="small" color="warning" variant="outlined" />
                                    )}
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={<CartIcon />}
                                    size="small"
                                    sx={{ mt: 2 }}
                                    fullWidth
                                >
                                    Add to Shopping List
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </TabPanel>

            {/* Predictive Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Shopping Behavior Predictions</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Days Ahead"
                            type="number"
                            size="small"
                            value={predictionDays}
                            onChange={(e) => setPredictionDays(Number(e.target.value))}
                            sx={{ width: 120 }}
                        />
                        <Button variant="outlined" onClick={loadPredictions} disabled={loading}>
                            Update Forecast
                        </Button>
                    </Box>
                </Box>

                {predictions && (
                    <Box>
                        {/* Summary Cards */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        ${predictions.estimated_spending?.toFixed(2) || '0.00'}
                                    </Typography>
                                    <Typography color="text.secondary">Predicted Spending</Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        {predictions.shopping_frequency || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Shopping Trips</Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        {predictions.predicted_items?.length || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Items Predicted</Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        {Math.round((predictions.confidence_level || 0) * 100)}%
                                    </Typography>
                                    <Typography color="text.secondary">Confidence Level</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Predicted Items */}
                        {predictions.predicted_items && predictions.predicted_items.length > 0 && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <ScheduleIcon sx={{ mr: 1 }} />
                                        Items You'll Likely Need
                                    </Typography>

                                    <List>
                                        {predictions.predicted_items.map((item: any, index: number) => (
                                            <ListItem key={index} divider>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body1">{item.item}</Typography>
                                                            <Chip
                                                                label={`${Math.round(item.confidence * 100)}% confidence`}
                                                                size="small"
                                                                color={getConfidenceColor(item.confidence * 100)}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                Category: {item.category} |
                                                                Quantity: {item.predicted_quantity} |
                                                                Est. Price: ${item.estimated_price}
                                                            </Typography>
                                                            <Typography variant="body2" color="warning.main">
                                                                {item.days_until_needed === 0 ? 'Needed now' : `Needed in ${item.days_until_needed} days`}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Category Breakdown */}
                        {predictions.category_breakdown && Object.keys(predictions.category_breakdown).length > 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Spending by Category</Typography>

                                    {Object.entries(predictions.category_breakdown).map(([category, amount]: [string, any]) => (
                                        <Box key={category} sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">{category}</Typography>
                                                <Typography variant="body2">${Number(amount).toFixed(2)}</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(Number(amount) / predictions.estimated_spending) * 100}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}
            </TabPanel>

            {/* Seasonal Intelligence Tab */}
            <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Seasonal Shopping Forecast</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Months"
                            type="number"
                            size="small"
                            value={forecastMonths}
                            onChange={(e) => setForecastMonths(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                        <Button variant="outlined" onClick={loadSeasonalForecast} disabled={loading}>
                            Update Forecast
                        </Button>
                    </Box>
                </Box>

                {seasonalForecast && (
                    <Box>
                        {/* Monthly Predictions */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                            {seasonalForecast.monthly_predictions?.map((month: any, index: number) => (
                                <Card key={index}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {month.month}
                                        </Typography>

                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            Budget Factor: <strong>×{month.budget_multiplier?.toFixed(2)}</strong>
                                        </Typography>

                                        {month.recommended_items?.map((item: any, idx: number) => (
                                            <Alert
                                                key={idx}
                                                severity={item.action === 'stock_up' ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ mb: 1 }}
                                            >
                                                <Typography variant="body2">
                                                    <strong>{item.category}:</strong> {item.reason}
                                                </Typography>
                                            </Alert>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {/* Category Trends */}
                        {seasonalForecast.category_trends && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <TrendingUpIcon sx={{ mr: 1 }} />
                                        Category Trends
                                    </Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                        {Object.entries(seasonalForecast.category_trends).map(([category, trend]: [string, any]) => (
                                            <Card key={category} variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle1">{category}</Typography>
                                                    <Chip
                                                        label={trend.trend}
                                                        size="small"
                                                        color={
                                                            trend.trend === 'increasing' ? 'success' :
                                                                trend.trend === 'decreasing' ? 'error' : 'primary'
                                                        }
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        Avg Factor: ×{trend.avg_factor?.toFixed(2)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seasonal Recommendations */}
                        {seasonalForecast.seasonal_recommendations && seasonalForecast.seasonal_recommendations.length > 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <MagicIcon sx={{ mr: 1 }} />
                                        Seasonal Recommendations
                                    </Typography>

                                    {seasonalForecast.seasonal_recommendations.map((rec: any, index: number) => (
                                        <Alert
                                            key={index}
                                            severity={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                                            sx={{ mb: 1 }}
                                        >
                                            <Typography variant="body2">
                                                <strong>{rec.category}:</strong> {rec.recommendation}
                                            </Typography>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}
            </TabPanel>

            {/* Purchase Intelligence Tab */}
            <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>Advanced Purchase Analytics</Typography>

                {purchaseIntelligence && (
                    <Box>
                        {/* User Segment */}
                        {purchaseIntelligence.user_segments && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>User Profile Analysis</Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">Primary Segment:</Typography>
                                        <Chip
                                            label={purchaseIntelligence.user_segments.primary_segment}
                                            color="primary"
                                            sx={{ mt: 0.5, mb: 1 }}
                                        />
                                        <Typography variant="body2">
                                            Confidence: {Math.round(purchaseIntelligence.user_segments.confidence * 100)}%
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {purchaseIntelligence.user_segments.segments?.map((segment: string, index: number) => (
                                            <Chip key={index} label={segment} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Spending Insights */}
                        {purchaseIntelligence.spending_insights && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Spending Analysis</Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Total Spending</Typography>
                                            <Typography variant="h6">${purchaseIntelligence.spending_insights.total_spending}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Avg Transaction</Typography>
                                            <Typography variant="h6">${purchaseIntelligence.spending_insights.average_transaction}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Top Category</Typography>
                                            <Typography variant="h6">{purchaseIntelligence.spending_insights.largest_category}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Efficiency Metrics */}
                        {purchaseIntelligence.efficiency_metrics && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <EfficiencyIcon sx={{ mr: 1 }} />
                                        Efficiency Metrics
                                    </Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2">Estimated Waste</Typography>
                                            <Typography variant="h6" color="error.main">
                                                ${purchaseIntelligence.efficiency_metrics.estimated_waste}
                                            </Typography>
                                            <Typography variant="caption">
                                                ({purchaseIntelligence.efficiency_metrics.waste_percentage}% of perishables)
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2">Price Efficiency</Typography>
                                            <Typography variant="h6" color="success.main">
                                                {purchaseIntelligence.efficiency_metrics.price_efficiency}%
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2">Avg Item Cost</Typography>
                                            <Typography variant="h6">
                                                ${purchaseIntelligence.efficiency_metrics.average_item_cost}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Behavioral Insights */}
                        {purchaseIntelligence.behavioral_insights && purchaseIntelligence.behavioral_insights.length > 0 && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Behavioral Insights</Typography>

                                    {purchaseIntelligence.behavioral_insights.map((insight: any, index: number) => (
                                        <Alert
                                            key={index}
                                            severity={insight.priority === 'high' ? 'error' : insight.priority === 'medium' ? 'warning' : 'info'}
                                            sx={{ mb: 1 }}
                                        >
                                            <Typography variant="body2">
                                                <strong>{insight.type.toUpperCase()}:</strong> {insight.message}
                                            </Typography>
                                            <Typography variant="caption">
                                                Impact: {insight.potential_impact}
                                            </Typography>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Optimization Opportunities */}
                        {purchaseIntelligence.optimization_opportunities && purchaseIntelligence.optimization_opportunities.length > 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <OptimizeIcon sx={{ mr: 1 }} />
                                        Optimization Opportunities
                                    </Typography>

                                    {purchaseIntelligence.optimization_opportunities.map((opp: any, index: number) => (
                                        <Accordion key={index}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                                    <Typography variant="subtitle1">{opp.type.replace('_', ' ').toUpperCase()}</Typography>
                                                    <Chip label={opp.potential_savings} size="small" color="success" />
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    {opp.description}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip label={`Effort: ${opp.effort}`} size="small" />
                                                    <Chip label={`Savings: ${opp.potential_savings}`} size="small" color="success" />
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}
            </TabPanel>

            {/* User Profile Tab */}
            <TabPanel value={tabValue} index={4}>
                <Typography variant="h6" gutterBottom>ML-Generated User Profile</Typography>

                {userProfile && (
                    <Box>
                        {/* Category Preferences */}
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Category Preferences</Typography>

                                {Object.entries(userProfile.category_preferences || {}).map(([category, preference]: [string, any]) => (
                                    <Box key={category} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2">{category}</Typography>
                                            <Typography variant="body2">{Math.round(Number(preference) * 100)}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Number(preference) * 100}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Profile Metrics */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="success.main">
                                        {Math.round((userProfile.health_consciousness || 0) * 100)}%
                                    </Typography>
                                    <Typography color="text.secondary">Health Consciousness</Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">
                                        {userProfile.price_sensitivity?.toFixed(2) || '1.00'}
                                    </Typography>
                                    <Typography color="text.secondary">Price Sensitivity</Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="info.main">
                                        {userProfile.purchase_patterns?.total_items_tracked || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Items Tracked</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Repurchase Cycles */}
                        {userProfile.purchase_patterns?.repurchase_cycles && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Repurchase Patterns</Typography>

                                    <List>
                                        {Object.entries(userProfile.purchase_patterns.repurchase_cycles).map(([item, days]: [string, any]) => (
                                            <ListItem key={item} divider>
                                                <ListItemText
                                                    primary={item}
                                                    secondary={`Repurchased every ${Math.round(Number(days))} days`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Shopping Insights Quick Tips */}
                        {shoppingInsights?.quick_tips && shoppingInsights.quick_tips.length > 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <MagicIcon sx={{ mr: 1 }} />
                                        AI Shopping Tips
                                    </Typography>

                                    {shoppingInsights.quick_tips.map((tip: any, index: number) => (
                                        <Alert key={index} severity="info" sx={{ mb: 1 }}>
                                            <Typography variant="body2">
                                                <strong>{tip.type.toUpperCase()}:</strong> {tip.tip}
                                            </Typography>
                                            <Typography variant="caption">
                                                Expected Impact: {tip.impact}
                                            </Typography>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}
            </TabPanel>
        </Box>
    );
};

export default AIRecommendations;
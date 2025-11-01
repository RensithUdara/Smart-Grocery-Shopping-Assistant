import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Button,
    Chip,
    LinearProgress,
    Divider,
} from '@mui/material';
import {
    TrendingUp,
    ShoppingCart,
    AttachMoney,
    Category,
    Assessment,
    Restaurant,
    RecyclingOutlined,
    Psychology,
    HealthAndSafety,
    CalendarMonth,
    Refresh,
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
            id={`analytics-tabpanel-${index}`}
            aria-labelledby={`analytics-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const EnhancedAnalytics: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Enhanced analytics data states
    const [dashboardSummary, setDashboardSummary] = useState<any>(null);
    const [spendingTrends, setSpendingTrends] = useState<any>(null);
    const [nutritionalAnalysis, setNutritionalAnalysis] = useState<any>(null);
    const [seasonalPatterns, setSeasonalPatterns] = useState<any>(null);
    const [wasteReduction, setWasteReduction] = useState<any>(null);
    const [predictiveInsights, setPredictiveInsights] = useState<any>(null);

    useEffect(() => {
        loadAllAnalytics();
    }, []);

    const loadAllAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load enhanced analytics
            const [summaryRes, spendingRes, nutritionRes, seasonalRes, wasteRes, predictiveRes] = await Promise.all([
                apiService.get('/analytics/enhanced/dashboard-summary'),
                apiService.get('/analytics/enhanced/spending-trends?days=30'),
                apiService.get('/analytics/enhanced/nutritional-analysis?days=30'),
                apiService.get('/analytics/enhanced/seasonal-patterns'),
                apiService.get('/analytics/enhanced/waste-reduction'),
                apiService.get('/analytics/enhanced/predictive-insights'),
            ]);

            setDashboardSummary(summaryRes.data.data);
            setSpendingTrends(spendingRes.data.data);
            setNutritionalAnalysis(nutritionRes.data.data);
            setSeasonalPatterns(seasonalRes.data.data);
            setWasteReduction(wasteRes.data.data);
            setPredictiveInsights(predictiveRes.data.data);

        } catch (error) {
            console.error('Failed to load analytics:', error);
            setError('Failed to load analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Loading Advanced Analytics...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" action={
                    <Button color="inherit" size="small" onClick={loadAllAnalytics}>
                        Retry
                    </Button>
                }>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    📊 Advanced Analytics Dashboard
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadAllAnalytics}
                    disabled={loading}
                >
                    Refresh Data
                </Button>
            </Box>

            {/* Summary Cards */}
            {dashboardSummary && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Monthly Spending</Typography>
                            <Typography variant="h4">${dashboardSummary.spending.total_30_days.toFixed(2)}</Typography>
                            <Chip
                                label={`${dashboardSummary.spending.trend} ${dashboardSummary.spending.change_percent.toFixed(1)}%`}
                                size="small"
                                sx={{ mt: 1, color: 'white', borderColor: 'white' }}
                                variant="outlined"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Health Score</Typography>
                            <Typography variant="h4">{dashboardSummary.nutrition.health_score.toFixed(1)}/100</Typography>
                            <Typography variant="body2">{dashboardSummary.nutrition.recommendations_count} recommendations</Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Efficiency Score</Typography>
                            <Typography variant="h4">{dashboardSummary.efficiency.efficiency_score.toFixed(1)}%</Typography>
                            <Typography variant="body2">{dashboardSummary.efficiency.waste_rate.toFixed(1)}% waste rate</Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Predictions</Typography>
                            <Typography variant="h4">{dashboardSummary.predictions.items_predicted}</Typography>
                            <Typography variant="body2">{dashboardSummary.predictions.high_confidence} high confidence</Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Analytics Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
                    <Tab icon={<TrendingUp />} label="Spending Trends" />
                    <Tab icon={<HealthAndSafety />} label="Nutritional Analysis" />
                    <Tab icon={<CalendarMonth />} label="Seasonal Patterns" />
                    <Tab icon={<RecyclingOutlined />} label="Waste Reduction" />
                    <Tab icon={<Psychology />} label="Predictive Insights" />
                </Tabs>
            </Box>

            {/* Spending Trends Tab */}
            <TabPanel value={tabValue} index={0}>
                {spendingTrends && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Spending Trends Analysis</Typography>

                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                            <Card sx={{ flex: 1, minWidth: 250 }}>
                                <CardContent>
                                    <Typography variant="h6">Total Spending (30 days)</Typography>
                                    <Typography variant="h4" color="primary">${spendingTrends.total_spent.toFixed(2)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Average daily: ${spendingTrends.average_daily.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, minWidth: 250 }}>
                                <CardContent>
                                    <Typography variant="h6">Spending Trend</Typography>
                                    <Chip
                                        label={spendingTrends.trend_analysis.trend}
                                        color={spendingTrends.trend_analysis.trend === 'increasing' ? 'warning' :
                                            spendingTrends.trend_analysis.trend === 'decreasing' ? 'success' : 'default'}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {spendingTrends.trend_analysis.change_percent.toFixed(1)}% change
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                                {Object.entries(spendingTrends.category_breakdown || {}).map(([category, amount]: [string, any]) => (
                                    <Box key={category} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">{category}</Typography>
                                            <Typography variant="body2" fontWeight="bold">${amount.toFixed(2)}</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(amount / Math.max(...Object.values(spendingTrends.category_breakdown))) * 100}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </TabPanel>

            {/* Nutritional Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
                {nutritionalAnalysis && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Nutritional Analysis</Typography>

                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Overall Health Score</Typography>
                                    <Typography variant="h3" color="primary">
                                        {nutritionalAnalysis.health_score.overall_score.toFixed(1)}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={nutritionalAnalysis.health_score.overall_score}
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Protein Score</Typography>
                                    <Typography variant="h4">{nutritionalAnalysis.health_score.protein_score.toFixed(1)}</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={nutritionalAnalysis.health_score.protein_score}
                                        color="secondary"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Fiber Score</Typography>
                                    <Typography variant="h4">{nutritionalAnalysis.health_score.fiber_score.toFixed(1)}</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={nutritionalAnalysis.health_score.fiber_score}
                                        color="success"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Box>

                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Nutritional Recommendations</Typography>
                                {nutritionalAnalysis.recommendations.map((rec: string, index: number) => (
                                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                                        {rec}
                                    </Alert>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </TabPanel>

            {/* Seasonal Patterns Tab */}
            <TabPanel value={tabValue} index={2}>
                {seasonalPatterns && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Seasonal Shopping Patterns</Typography>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Current Season: {seasonalPatterns.seasonal_recommendations.current_season}
                        </Alert>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Seasonal Preferences</Typography>
                                {Object.entries(seasonalPatterns.seasonal_preferences || {}).map(([season, categories]: [string, any]) => (
                                    <Box key={season} sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{season}</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {Object.entries(categories).map(([category, count]: [string, any]) => (
                                                <Chip key={category} label={`${category} (${count})`} variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </TabPanel>

            {/* Waste Reduction Tab */}
            <TabPanel value={tabValue} index={3}>
                {wasteReduction && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Food Waste Analysis</Typography>

                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Waste Rate</Typography>
                                    <Typography variant="h3" color={wasteReduction.waste_rate_percentage > 20 ? 'error' : 'success'}>
                                        {wasteReduction.waste_rate_percentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2">of tracked items</Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Efficiency Score</Typography>
                                    <Typography variant="h3" color="primary">
                                        {wasteReduction.efficiency_score.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={wasteReduction.efficiency_score}
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, minWidth: 200 }}>
                                <CardContent>
                                    <Typography variant="h6">Estimated Waste Cost</Typography>
                                    <Typography variant="h3" color="warning.main">
                                        ${wasteReduction.estimated_waste_cost.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2">could have been saved</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Waste Reduction Suggestions</Typography>
                                {wasteReduction.reduction_suggestions.map((suggestion: string, index: number) => (
                                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                        {suggestion}
                                    </Alert>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </TabPanel>

            {/* Predictive Insights Tab */}
            <TabPanel value={tabValue} index={4}>
                {predictiveInsights && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Predictive Shopping Insights</Typography>

                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Items You Might Need Soon</Typography>
                                {predictiveInsights.predicted_needs.length > 0 ? (
                                    predictiveInsights.predicted_needs.slice(0, 10).map((prediction: any, index: number) => (
                                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body1" fontWeight="bold">{prediction.item}</Typography>
                                                <Chip
                                                    label={`${prediction.confidence}% confidence`}
                                                    color={prediction.confidence > 80 ? 'error' : prediction.confidence > 60 ? 'warning' : 'default'}
                                                    size="small"
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Last purchased {prediction.days_since_last} days ago •
                                                Typical frequency: {prediction.estimated_frequency.toFixed(1)} days
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Alert severity="info">No predictions available yet. More purchase history needed.</Alert>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Shopping Pattern Insights</Typography>
                                {predictiveInsights.shopping_patterns && (
                                    <Box>
                                        <Typography variant="body1" gutterBottom>
                                            You typically shop every {predictiveInsights.shopping_patterns.average_days_between_trips} days
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            Total shopping trips recorded: {predictiveInsights.shopping_patterns.total_shopping_trips}
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                                        {predictiveInsights.recommendations.map((rec: string, index: number) => (
                                            <Alert key={index} severity="success" sx={{ mb: 1 }}>
                                                {rec}
                                            </Alert>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </TabPanel>
        </Box>
    );
};

export default EnhancedAnalytics;
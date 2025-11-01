import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
} from '@mui/material';
import {
    AccountBalanceWallet,
    TrendingUp,
    Warning,
    Lightbulb,
    AttachMoney,
    Assessment,
    Settings,
    ShoppingCart,
    SaveAlt,
} from '@mui/icons-material';

// Budget API functions (to be added to services/api.ts)
const budgetApi = {
    setSummary: (amount: number) => 
        fetch('/api/budget/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        }).then(res => res.json()),
    
    getSummary: (days: number = 30) => 
        fetch(`/api/budget/summary?days=${days}`).then(res => res.json()),
    
    getAlerts: () => 
        fetch('/api/budget/alerts').then(res => res.json()),
    
    getOptimizations: () => 
        fetch('/api/budget/optimizations').then(res => res.json()),
    
    getRecommendations: () => 
        fetch('/api/budget/recommendations').then(res => res.json()),
    
    getCategoryBreakdown: (days: number = 30) => 
        fetch(`/api/budget/category-breakdown?days=${days}`).then(res => res.json()),
    
    getTrends: () => 
        fetch('/api/budget/trends').then(res => res.json())
};

interface BudgetAlert {
    type: string;
    severity: string;
    message: string;
    amount_spent?: number;
    budget_limit?: number;
    suggestion?: string;
}

interface CategoryBreakdown {
    category: string;
    amount_spent: number;
    percentage_of_total: number;
    category_budget: number;
    budget_usage: number;
    status: string;
}

const Budget: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [budgetData, setBudgetData] = useState({
        summary: null as any,
        alerts: [] as BudgetAlert[],
        optimizations: [] as any[],
        recommendations: [] as string[],
        categoryBreakdown: null as any,
        trends: null as any,
    });
    const [setBudgetOpen, setSetBudgetOpen] = useState(false);
    const [newBudget, setNewBudget] = useState('300');
    const [error, setError] = useState<string | null>(null);

    const loadBudgetData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [summary, alerts, optimizations, recommendations, categoryBreakdown, trends] = await Promise.all([
                budgetApi.getSummary().catch(() => ({ data: null })),
                budgetApi.getAlerts().catch(() => ({ data: [] })),
                budgetApi.getOptimizations().catch(() => ({ data: [] })),
                budgetApi.getRecommendations().catch(() => ({ data: [] })),
                budgetApi.getCategoryBreakdown().catch(() => ({ data: null })),
                budgetApi.getTrends().catch(() => ({ data: null }))
            ]);

            setBudgetData({
                summary: summary.data || summary,
                alerts: alerts.data || alerts,
                optimizations: optimizations.data || optimizations,
                recommendations: recommendations.data || recommendations,
                categoryBreakdown: categoryBreakdown.data || categoryBreakdown,
                trends: trends.data || trends,
            });
        } catch (err) {
            setError('Failed to load budget data');
            console.error('Budget error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async () => {
        try {
            const amount = parseFloat(newBudget);
            if (amount <= 0) {
                setError('Budget amount must be positive');
                return;
            }

            await budgetApi.setSummary(amount);
            setSetBudgetOpen(false);
            loadBudgetData();
        } catch (err) {
            setError('Failed to set budget');
            console.error('Set budget error:', err);
        }
    };

    useEffect(() => {
        loadBudgetData();
    }, []);

    const getBudgetStatusColor = (status: string) => {
        switch (status) {
            case 'over_budget': return '#f44336';
            case 'near_limit': return '#ff9800';
            case 'high_usage': return '#ff9800';
            case 'moderate_usage': return '#4caf50';
            case 'low_usage': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'info';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    const { summary, alerts, optimizations, recommendations, categoryBreakdown } = budgetData;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    💰 Budget Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Settings />}
                    onClick={() => setSetBudgetOpen(true)}
                >
                    Set Budget
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Budget Alerts */}
            {alerts.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {alerts.map((alert, index) => (
                        <Grid item xs={12} key={index}>
                            <Alert 
                                severity={getSeverityColor(alert.severity) as any}
                                action={
                                    alert.suggestion && (
                                        <Button color="inherit" size="small">
                                            View Tips
                                        </Button>
                                    )
                                }
                            >
                                <Typography variant="body2">
                                    {alert.message}
                                    {alert.suggestion && (
                                        <Box sx={{ mt: 1, fontStyle: 'italic' }}>
                                            💡 {alert.suggestion}
                                        </Box>
                                    )}
                                </Typography>
                            </Alert>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Budget Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AccountBalanceWallet sx={{ mr: 1, color: '#2196f3' }} />
                                <Typography variant="h6">Monthly Budget</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                ${summary?.total_spent || 0}
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                                of ${summary?.budget_limit || 300} budgeted
                            </Typography>
                            {summary?.budget_percentage && (
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(summary.budget_percentage, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getBudgetStatusColor(summary.budget_status)
                                            }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {summary.budget_percentage}% used
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                                <Typography variant="h6">Daily Average</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                ${summary?.average_daily_spend || 0}
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                                Last {summary?.days_analyzed || 30} days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Assessment sx={{ mr: 1, color: '#ff9800' }} />
                                <Typography variant="h6">Budget Status</Typography>
                            </Box>
                            <Chip
                                label={summary?.budget_status?.replace('_', ' ').toUpperCase() || 'NO DATA'}
                                sx={{
                                    backgroundColor: getBudgetStatusColor(summary?.budget_status),
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Category Breakdown */}
            {categoryBreakdown?.breakdown && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    📊 Category Spending Breakdown
                                </Typography>
                                <List>
                                    {categoryBreakdown.breakdown.map((category: CategoryBreakdown, index: number) => (
                                        <React.Fragment key={category.category}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ShoppingCart />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                ${category.amount_spent}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(category.budget_usage, 100)}
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#e0e0e0',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: category.status === 'over' ? '#f44336' : '#4caf50'
                                                                    }
                                                                }}
                                                            />
                                                            <Typography variant="caption" color="textSecondary">
                                                                {category.budget_usage}% of ${category.category_budget} budget ({category.percentage_of_total}% of total)
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < categoryBreakdown.breakdown.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Cost Optimizations and Recommendations */}
            <Grid container spacing={3}>
                {optimizations.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    💡 Cost Optimization Tips
                                </Typography>
                                <List>
                                    {optimizations.slice(0, 3).map((optimization, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <Lightbulb color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={optimization.message}
                                                secondary={
                                                    optimization.potential_savings && 
                                                    `Potential savings: $${optimization.potential_savings.toFixed(2)}`
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {recommendations.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    🎯 Budget Recommendations
                                </Typography>
                                <List>
                                    {recommendations.slice(0, 3).map((recommendation, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <SaveAlt color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary={recommendation} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Set Budget Dialog */}
            <Dialog open={setBudgetOpen} onClose={() => setSetBudgetOpen(false)}>
                <DialogTitle>Set Monthly Budget</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Monthly Budget Amount ($)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSetBudgetOpen(false)}>Cancel</Button>
                    <Button onClick={handleSetBudget} variant="contained">Set Budget</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Budget;
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Alert, Divider,
    Tabs, Tab, LinearProgress, Grid, Chip, TextField, Select, MenuItem,
    FormControl, InputLabel, List, ListItem, ListItemText, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    TrendingUp as TrendingUpIcon,
    PriceCheck as PriceCheckIcon,
    Savings as SavingsIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
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

const BudgetManagement: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // State for different features
    const [budgetSummary, setBudgetSummary] = useState<any>(null);
    const [spendingAnalysis, setSpendingAnalysis] = useState<any>(null);
    const [budgetGoals, setBudgetGoals] = useState<any>(null);
    const [priceAlerts, setPriceAlerts] = useState<any>(null);
    const [savingsOpportunities, setSavingsOpportunities] = useState<any>(null);
    const [transactions, setTransactions] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);

    // Dialog states
    const [addTransactionDialog, setAddTransactionDialog] = useState(false);
    const [addGoalDialog, setAddGoalDialog] = useState(false);

    // Form states
    const [newTransaction, setNewTransaction] = useState({
        item: '',
        category: '',
        amount: '',
        store: '',
        quantity: '1'
    });

    const [newGoal, setNewGoal] = useState({
        category: '',
        target_amount: '',
        time_period: 'weekly'
    });

    useEffect(() => {
        loadBudgetData();
    }, []);

    const loadBudgetData = async () => {
        setLoading(true);
        try {
            // Load all budget-related data
            const [summaryRes, analysisRes, goalsRes, alertsRes, opportunitiesRes, transactionsRes] = await Promise.all([
                apiService.get('/api/budget/summary'),
                apiService.get('/api/budget/spending-analysis'),
                apiService.get('/api/budget/goals'),
                apiService.get('/api/budget/price-alerts'),
                apiService.get('/api/budget/savings-opportunities'),
                apiService.get('/api/budget/transactions?limit=20')
            ]);

            setBudgetSummary(summaryRes.data.data);
            setSpendingAnalysis(analysisRes.data.data);
            setBudgetGoals(goalsRes.data.data);
            setPriceAlerts(alertsRes.data.data);
            setSavingsOpportunities(opportunitiesRes.data.data);
            setTransactions(transactionsRes.data.data);
        } catch (error) {
            console.error('Error loading budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateForecast = async (timePeriod: string) => {
        setLoading(true);
        try {
            const response = await apiService.post('/api/budget/forecast', {
                time_period: timePeriod
            });
            setForecast(response.data.data);
        } catch (error) {
            console.error('Error generating forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async () => {
        try {
            await apiService.post('/api/budget/transactions', newTransaction);
            setAddTransactionDialog(false);
            setNewTransaction({ item: '', category: '', amount: '', store: '', quantity: '1' });
            loadBudgetData(); // Refresh data
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const addBudgetGoal = async () => {
        try {
            await apiService.post('/api/budget/goals', newGoal);
            setAddGoalDialog(false);
            setNewGoal({ category: '', target_amount: '', time_period: 'weekly' });
            loadBudgetData(); // Refresh data
        } catch (error) {
            console.error('Error adding budget goal:', error);
        }
    };

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'primary' => {
        switch (status) {
            case 'on_track': return 'success';
            case 'warning': return 'warning';
            case 'over_budget': return 'error';
            default: return 'primary';
        }
    };

    const categories = [
        'produce', 'dairy', 'meat', 'pantry', 'snacks',
        'beverages', 'frozen', 'bakery', 'household', 'personal_care'
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WalletIcon /> Advanced Budget Management
            </Typography>

            {/* Summary Cards */}
            {budgetSummary && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">Total Budget</Typography>
                            <Typography variant="h4">${budgetSummary.budget_overview.total_budget}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                ${budgetSummary.budget_overview.remaining_budget} remaining
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">Budget Usage</Typography>
                            <Typography variant="h4">{budgetSummary.budget_overview.utilization_percentage}%</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={budgetSummary.budget_overview.utilization_percentage}
                                color={budgetSummary.budget_overview.utilization_percentage > 90 ? "error" : "primary"}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">Price Alerts</Typography>
                            <Typography variant="h4">{budgetSummary.alerts_summary.price_alerts}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                ${budgetSummary.alerts_summary.total_potential_savings} potential savings
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">Monthly Forecast</Typography>
                            <Typography variant="h4">${budgetSummary.monthly_forecast}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Based on spending patterns
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab icon={<TrendingUpIcon />} label="Budget Goals" />
                    <Tab icon={<PriceCheckIcon />} label="Spending Analysis" />
                    <Tab icon={<WarningIcon />} label="Price Alerts" />
                    <Tab icon={<SavingsIcon />} label="Savings Opportunities" />
                </Tabs>
            </Box>

            {/* Budget Goals Tab */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Budget Goals Tracking</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setAddGoalDialog(true)}
                    >
                        Add Goal
                    </Button>
                </Box>

                {budgetGoals && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                        {Object.entries(budgetGoals).map(([goalName, goal]: [string, any]) => (
                            <Card key={goalName}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                                        {goalName.replace('_', ' ')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {goal.time_period} budget
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Spent: ${goal.spent}</Typography>
                                        <Typography variant="body2">Target: ${goal.target}</Typography>
                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(goal.utilization_percentage, 100)}
                                        color={getStatusColor(goal.status)}
                                        sx={{ mb: 2, height: 8, borderRadius: 4 }}
                                    />

                                    <Chip
                                        label={`${goal.utilization_percentage}% used`}
                                        color={getStatusColor(goal.status)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        label={`$${goal.remaining} left`}
                                        variant="outlined"
                                        size="small"
                                    />

                                    {goal.recommendations && goal.recommendations.length > 0 && (
                                        <Alert severity={goal.status === 'on_track' ? 'success' : 'warning'} sx={{ mt: 2 }}>
                                            {goal.recommendations[0]}
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* Budget Forecast Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Budget Forecasting</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button variant="outlined" onClick={() => generateForecast('weekly')}>
                            Weekly Forecast
                        </Button>
                        <Button variant="outlined" onClick={() => generateForecast('monthly')}>
                            Monthly Forecast
                        </Button>
                        <Button variant="outlined" onClick={() => generateForecast('yearly')}>
                            Yearly Forecast
                        </Button>
                    </Box>

                    {forecast && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {forecast.period.charAt(0).toUpperCase() + forecast.period.slice(1)} Budget Forecast
                                </Typography>
                                <Typography variant="h4" color="primary" gutterBottom>
                                    ${forecast.total_forecast}
                                </Typography>

                                <Typography variant="subtitle2" gutterBottom>Category Breakdown:</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                                    {Object.entries(forecast.category_forecasts).map(([category, data]: [string, any]) => (
                                        <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                {category}:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                ${data.forecast_amount}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {forecast.recommendations && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                                        <List dense>
                                            {forecast.recommendations.map((rec: string, idx: number) => (
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

            {/* Spending Analysis Tab */}
            <TabPanel value={tabValue} index={1}>
                <Typography variant="h5" gutterBottom>Spending Pattern Analysis</Typography>

                {spendingAnalysis && (
                    <>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Overview</Typography>
                                <Typography variant="h4" color="primary" gutterBottom>
                                    ${spendingAnalysis.total_spent}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total spent across all categories
                                </Typography>
                            </CardContent>
                        </Card>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                            {/* Top Categories */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Top Spending Categories</Typography>
                                    {spendingAnalysis.top_spending_categories.map((category: any, idx: number) => (
                                        <Box key={idx} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                    {category.name}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    ${category.total} ({category.percentage}%)
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={category.percentage}
                                                sx={{ height: 6, borderRadius: 3 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Top Stores */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Top Stores</Typography>
                                    {spendingAnalysis.top_stores.map((store: any, idx: number) => (
                                        <Box key={idx} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body1">{store.name}</Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    ${store.total} ({store.percentage}%)
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {store.transactions} transactions, ${store.avg_per_visit} avg per visit
                                            </Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Optimization Opportunities */}
                        {spendingAnalysis.optimization_opportunities && spendingAnalysis.optimization_opportunities.length > 0 && (
                            <Card sx={{ mt: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Optimization Opportunities</Typography>
                                    {spendingAnalysis.optimization_opportunities.map((opp: any, idx: number) => (
                                        <Alert key={idx} severity="info" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2">{opp.type}</Typography>
                                            <Typography variant="body2">{opp.recommendation}</Typography>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Recent Transactions */}
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Recent Transactions</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setAddTransactionDialog(true)}
                            >
                                Add Transaction
                            </Button>
                        </Box>

                        {transactions && transactions.transactions.length > 0 && (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Store</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.transactions.slice(0, 10).map((transaction: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{transaction.item}</TableCell>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>
                                                    {transaction.category}
                                                </TableCell>
                                                <TableCell>{transaction.store}</TableCell>
                                                <TableCell align="right">${transaction.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </TabPanel>

            {/* Price Alerts Tab */}
            <TabPanel value={tabValue} index={2}>
                <Typography variant="h5" gutterBottom>Price Drop Alerts</Typography>

                {priceAlerts && priceAlerts.alerts.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                        {priceAlerts.alerts.map((alert: any, idx: number) => (
                            <Card key={idx}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                            {alert.item}
                                        </Typography>
                                        <Chip
                                            label={`${alert.savings_percentage}% OFF`}
                                            color="error"
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Available at {alert.store}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                                            Was: ${alert.target_price}
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            Now: ${alert.current_price}
                                        </Typography>
                                    </Box>

                                    <Alert severity="success">
                                        Save ${alert.savings_amount} per unit!
                                    </Alert>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Alert severity="info">
                        No price alerts available at the moment. We'll notify you when prices drop!
                    </Alert>
                )}
            </TabPanel>

            {/* Savings Opportunities Tab */}
            <TabPanel value={tabValue} index={3}>
                <Typography variant="h5" gutterBottom>Savings Opportunities</Typography>

                {savingsOpportunities && savingsOpportunities.opportunities.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 2 }}>
                        {savingsOpportunities.opportunities.map((opportunity: any, idx: number) => (
                            <Card key={idx}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                                        {opportunity.type.replace('_', ' ')}
                                    </Typography>

                                    {opportunity.item && (
                                        <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                                            {opportunity.item}
                                        </Typography>
                                    )}

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {opportunity.recommendation}
                                    </Typography>

                                    {opportunity.potential_savings && (
                                        <Chip
                                            label={`Save $${opportunity.potential_savings}`}
                                            color="success"
                                            sx={{ mr: 1 }}
                                        />
                                    )}

                                    {opportunity.discount && (
                                        <Chip
                                            label={opportunity.discount}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Alert severity="info">
                        No specific savings opportunities identified at the moment. Check back later for personalized recommendations!
                    </Alert>
                )}
            </TabPanel>

            {/* Add Transaction Dialog */}
            <Dialog open={addTransactionDialog} onClose={() => setAddTransactionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Item Name"
                            fullWidth
                            value={newTransaction.item}
                            onChange={(e) => setNewTransaction({ ...newTransaction, item: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newTransaction.category}
                                label="Category"
                                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                                        {cat.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Amount ($)"
                            type="number"
                            fullWidth
                            value={newTransaction.amount}
                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        />
                        <TextField
                            label="Store"
                            fullWidth
                            value={newTransaction.store}
                            onChange={(e) => setNewTransaction({ ...newTransaction, store: e.target.value })}
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            fullWidth
                            value={newTransaction.quantity}
                            onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddTransactionDialog(false)}>Cancel</Button>
                    <Button onClick={addTransaction} variant="contained">Add Transaction</Button>
                </DialogActions>
            </Dialog>

            {/* Add Budget Goal Dialog */}
            <Dialog open={addGoalDialog} onClose={() => setAddGoalDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Budget Goal</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newGoal.category}
                                label="Category"
                                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                                        {cat.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Target Amount ($)"
                            type="number"
                            fullWidth
                            value={newGoal.target_amount}
                            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Time Period</InputLabel>
                            <Select
                                value={newGoal.time_period}
                                label="Time Period"
                                onChange={(e) => setNewGoal({ ...newGoal, time_period: e.target.value })}
                            >
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddGoalDialog(false)}>Cancel</Button>
                    <Button onClick={addBudgetGoal} variant="contained">Add Goal</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetManagement;
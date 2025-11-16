import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    TrendingUp,
    PieChart,
    BarChart,
    Refresh,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart as RechartsBarChart,
    Bar
} from 'recharts';
import { analyticsApi, Analytics } from '../services/api';

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
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const AnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [categoryAnalytics, setCategoryAnalytics] = useState<any>(null);
    const [monthlyAnalytics, setMonthlyAnalytics] = useState<any>(null);
    const [spendingAnalytics, setSpendingAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                analyticsResponse,
                categoryResponse,
                monthlyResponse,
                spendingResponse
            ] = await Promise.all([
                analyticsApi.getAnalytics().catch(() => ({ data: null })),
                analyticsApi.getCategoryAnalytics().catch(() => ({ data: null })),
                analyticsApi.getMonthlyAnalytics().catch(() => ({ data: null })),
                analyticsApi.getSpendingAnalytics().catch(() => ({ data: null })),
            ]);

            setAnalytics(analyticsResponse.data);
            setCategoryAnalytics(categoryResponse.data);
            setMonthlyAnalytics(monthlyResponse.data);
            setSpendingAnalytics(spendingResponse.data);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Color palette for charts
    const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#00BCD4', '#FFC107', '#795548'];

    // Prepare data for charts
    const prepareCategoryData = () => {
        if (!analytics?.category_breakdown) return [];
        return Object.entries(analytics.category_breakdown).map(([category, amount], index) => ({
            name: category,
            value: Number(amount),
            color: COLORS[index % COLORS.length]
        }));
    };

    const prepareMonthlyData = () => {
        if (!analytics?.monthly_trends) return [];
        return Object.entries(analytics.monthly_trends).map(([month, amount]) => ({
            month,
            amount: Number(amount)
        }));
    };

    const prepareSpendingTrendData = () => {
        if (!spendingAnalytics) return [];
        // Mock data for demonstration - replace with actual API data structure
        return [
            { month: 'Jan', spending: 450 },
            { month: 'Feb', spending: 520 },
            { month: 'Mar', spending: 380 },
            { month: 'Apr', spending: 600 },
            { month: 'May', spending: 480 },
            { month: 'Jun', spending: 550 },
        ];
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Analytics Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={loadAnalytics}
                >
                    Refresh Data
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            {analytics && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    mb: 4
                }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                ${analytics.total_spent.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Spent
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2' }}>
                                {analytics.total_items}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Items
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F57C00' }}>
                                {analytics.shopping_trips}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Shopping Trips
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B1FA2' }}>
                                ${analytics.avg_per_trip.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Avg per Trip
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {!analytics || analytics.total_items === 0 ? (
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <AnalyticsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="textSecondary" gutterBottom>
                                No Analytics Data Available
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Start shopping and adding items to your purchase history to see detailed analytics and insights.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab
                                label="Category Breakdown"
                                icon={<PieChart />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Monthly Trends"
                                icon={<TrendingUp />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Spending Analysis"
                                icon={<BarChart />}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    {/* Category Breakdown Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PieChart color="primary" />
                                    Spending by Category
                                </Typography>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={prepareCategoryData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {prepareCategoryData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`Rs.${Number(value).toFixed(2)}`, 'Amount']} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* Monthly Trends Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp color="primary" />
                                    Monthly Spending Trends
                                </Typography>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={prepareMonthlyData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`Rs.${Number(value).toFixed(2)}`, 'Amount']} />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#4CAF50"
                                                strokeWidth={3}
                                                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                                                name="Monthly Spending"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* Spending Analysis Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BarChart color="primary" />
                                    Spending Pattern Analysis
                                </Typography>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart data={prepareSpendingTrendData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spending']} />
                                            <Legend />
                                            <Bar
                                                dataKey="spending"
                                                fill="#2196F3"
                                                radius={[4, 4, 0, 0]}
                                                name="Monthly Spending"
                                            />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                    * This chart shows your spending patterns over time to help identify trends and budget planning opportunities.
                                </Typography>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </>
            )}
        </Container>
    );
};

export default AnalyticsPage;
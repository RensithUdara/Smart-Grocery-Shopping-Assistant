import React, { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    DollarSign,
    ShoppingCart,
    Award,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import { useAnalytics } from '../hooks/useApi';
import {
    LoadingSpinner,
    EmptyState,
    StatCard,
    Tabs
} from '../components/common';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
    const { analytics, loading, error, refresh } = useAnalytics();
    const [selectedTimeframe, setSelectedTimeframe] = useState('30');
    const [activeTab, setActiveTab] = useState('overview');

    const timeframes = [
        { id: '7', label: 'Last 7 Days' },
        { id: '30', label: 'Last 30 Days' },
        { id: '90', label: 'Last 3 Months' },
        { id: '365', label: 'Last Year' }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'spending', label: 'Spending', icon: DollarSign },
        { id: 'categories', label: 'Categories', icon: Filter },
        { id: 'trends', label: 'Trends', icon: TrendingUp }
    ];

    // Chart colors
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

    if (loading) {
        return <LoadingSpinner text="Analyzing your shopping data..." />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading analytics</div>
                <button onClick={refresh} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    if (!analytics) {
        return (
            <EmptyState
                icon={BarChart3}
                title="No analytics data available"
                description="Start shopping and tracking your purchases to see detailed analytics."
            />
        );
    }

    const exportData = () => {
        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grocery-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Analytics data exported successfully');
    };

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Spent"
                    value={`$${analytics.total_spent?.toFixed(2) || '0.00'}`}
                    icon={DollarSign}
                    color="green"
                    trend={analytics.spending_trend}
                />
                <StatCard
                    title="Items Purchased"
                    value={analytics.total_items || 0}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatCard
                    title="Shopping Trips"
                    value={analytics.shopping_trips || 0}
                    icon={Calendar}
                    color="purple"
                />
                <StatCard
                    title="Avg per Trip"
                    value={`$${analytics.avg_per_trip?.toFixed(2) || '0.00'}`}
                    icon={Award}
                    color="yellow"
                />
            </div>

            {/* Monthly Spending Chart */}
            {analytics.monthly_spending && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.monthly_spending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value}`, 'Amount Spent']} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top Categories Pie Chart */}
            {analytics.category_breakdown && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.category_breakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="amount"
                                >
                                    {analytics.category_breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Stats */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Category Summary</h3>
                        <div className="space-y-3">
                            {analytics.category_breakdown?.slice(0, 6).map((category, index) => (
                                <div key={category.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded mr-3"
                                            style={{ backgroundColor: colors[index % colors.length] }}
                                        ></div>
                                        <span className="capitalize font-medium">{category.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">${category.amount.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{category.items} items</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSpendingTab = () => (
        <div className="space-y-6">
            {/* Spending Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Highest Single Purchase</h4>
                    <div className="text-2xl font-bold text-green-600">
                        ${analytics.highest_purchase?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {analytics.highest_purchase_date && `on ${new Date(analytics.highest_purchase_date).toLocaleDateString()}`}
                    </p>
                </div>

                <div className="card text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Daily Average</h4>
                    <div className="text-2xl font-bold text-blue-600">
                        ${analytics.daily_average?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">per day</p>
                </div>

                <div className="card text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Budget Efficiency</h4>
                    <div className="text-2xl font-bold text-purple-600">
                        {analytics.budget_efficiency || 'N/A'}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">of planned budget used</p>
                </div>
            </div>

            {/* Weekly Spending Pattern */}
            {analytics.weekly_spending && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Weekly Spending Pattern</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.weekly_spending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value}`, 'Amount Spent']} />
                            <Bar dataKey="amount" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Price Comparison */}
            {analytics.price_trends && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Price Trends for Common Items</h3>
                    <div className="space-y-4">
                        {analytics.price_trends.slice(0, 5).map((item, index) => (
                            <div key={item.name} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium capitalize">{item.name}</span>
                                    <span className={`font-semibold ${item.trend === 'up' ? 'text-red-600' :
                                            item.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                                        }`}>
                                        ${item.current_price?.toFixed(2)}
                                        {item.trend === 'up' ? ' ↗' : item.trend === 'down' ? ' ↘' : ' →'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Average: ${item.avg_price?.toFixed(2)} |
                                    Purchases: {item.purchase_count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderCategoriesTab = () => (
        <div className="space-y-6">
            {/* Category Performance */}
            {analytics.category_breakdown && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.category_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'amount' ? `$${value}` : value,
                                    name === 'amount' ? 'Amount Spent' : 'Items Purchased'
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="amount" fill="#3B82F6" name="Amount ($)" />
                            <Bar dataKey="items" fill="#10B981" name="Items" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Category Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.category_insights && (
                    <div className="card">
                        <h4 className="font-semibold mb-4">Most Expensive Categories</h4>
                        <div className="space-y-3">
                            {analytics.category_insights.expensive?.slice(0, 5).map((category, index) => (
                                <div key={category.name} className="flex justify-between items-center">
                                    <span className="capitalize">{category.name}</span>
                                    <span className="font-semibold">${category.avg_price?.toFixed(2)}/item</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analytics.category_insights && (
                    <div className="card">
                        <h4 className="font-semibold mb-4">Most Frequent Categories</h4>
                        <div className="space-y-3">
                            {analytics.category_insights.frequent?.slice(0, 5).map((category, index) => (
                                <div key={category.name} className="flex justify-between items-center">
                                    <span className="capitalize">{category.name}</span>
                                    <span className="font-semibold">{category.frequency}% of purchases</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Organic vs Regular */}
            {analytics.organic_vs_regular && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Organic vs Regular Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Organic', value: analytics.organic_vs_regular.organic_percentage },
                                            { name: 'Regular', value: 100 - analytics.organic_vs_regular.organic_percentage }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10B981" />
                                        <Cell fill="#6B7280" />
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h5 className="font-medium">Organic Items</h5>
                                <p className="text-2xl font-bold text-green-600">
                                    {analytics.organic_vs_regular.organic_percentage}%
                                </p>
                                <p className="text-sm text-gray-600">
                                    Avg price premium: ${analytics.organic_vs_regular.organic_premium?.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <h5 className="font-medium">Total Organic Spending</h5>
                                <p className="text-lg font-semibold">
                                    ${analytics.organic_vs_regular.organic_spending?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTrendsTab = () => (
        <div className="space-y-6">
            {/* Shopping Frequency Trends */}
            {analytics.shopping_frequency && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Shopping Frequency Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.shopping_frequency}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="trips"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                name="Shopping Trips"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Seasonal Trends */}
            {analytics.seasonal_trends && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Seasonal Shopping Patterns</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(analytics.seasonal_trends).map(([season, data]) => (
                            <div key={season} className="text-center p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold capitalize">{season}</h4>
                                <div className="text-xl font-bold text-blue-600 mt-2">
                                    ${data.avg_spending?.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-600">avg spending</p>
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500">
                                        {data.popular_category} most popular
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Growth Metrics */}
            {analytics.growth_metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card text-center">
                        <h4 className="font-semibold mb-2">Monthly Growth</h4>
                        <div className={`text-2xl font-bold ${analytics.growth_metrics.monthly_growth > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {analytics.growth_metrics.monthly_growth > 0 ? '+' : ''}
                            {analytics.growth_metrics.monthly_growth?.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">spending change</p>
                    </div>

                    <div className="card text-center">
                        <h4 className="font-semibold mb-2">Item Diversity</h4>
                        <div className="text-2xl font-bold text-purple-600">
                            {analytics.growth_metrics.item_diversity?.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">unique items ratio</p>
                    </div>

                    <div className="card text-center">
                        <h4 className="font-semibold mb-2">Shopping Efficiency</h4>
                        <div className="text-2xl font-bold text-blue-600">
                            {analytics.growth_metrics.efficiency_score?.toFixed(1)}
                        </div>
                        <p className="text-sm text-gray-600">items per trip</p>
                    </div>
                </div>
            )}

            {/* Predictions */}
            {analytics.predictions && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📈 Spending Predictions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900">Next Month Forecast</h4>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                                ${analytics.predictions.next_month?.toFixed(2)}
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                                Based on current trends
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-900">Potential Savings</h4>
                            <div className="text-2xl font-bold text-green-600 mt-2">
                                ${analytics.predictions.potential_savings?.toFixed(2)}
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                                With optimization
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Analytics</h1>
                    <p className="text-gray-600">Insights into your shopping patterns and spending habits</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportData} className="btn btn-outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </button>
                    <button onClick={refresh} className="btn btn-outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Timeframe Selector */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Time Period:</span>
                    <div className="flex gap-2">
                        {timeframes.map(timeframe => (
                            <button
                                key={timeframe.id}
                                onClick={() => setSelectedTimeframe(timeframe.id)}
                                className={`px-3 py-1 text-sm rounded border transition-colors ${selectedTimeframe === timeframe.id
                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {timeframe.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'spending' && renderSpendingTab()}
                {activeTab === 'categories' && renderCategoriesTab()}
                {activeTab === 'trends' && renderTrendsTab()}
            </div>
        </div>
    );
};

export default Analytics;
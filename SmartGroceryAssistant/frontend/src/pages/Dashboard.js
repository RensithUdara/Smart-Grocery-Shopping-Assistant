import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Brain, 
  Clock, 
  Heart, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, LoadingSpinner, AlertBanner, Badge } from '../components/common';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSampleDataBanner, setShowSampleDataBanner] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        shoppingList,
        suggestions,
        expirationSummary,
        healthRating,
        purchaseStats,
        dataSummary
      ] = await Promise.all([
        apiService.getShoppingList(),
        apiService.getSuggestions(),
        apiService.getExpirationSummary(),
        apiService.getListHealthRating(),
        apiService.getPurchaseStats(),
        apiService.getDataSummary()
      ]);

      setDashboardData({
        shoppingList,
        suggestions,
        expirationSummary,
        healthRating,
        purchaseStats,
        dataSummary
      });

      // Check if we should show sample data banner
      const hasData = shoppingList.item_count > 0 || purchaseStats.total_purchases > 0;
      setShowSampleDataBanner(!hasData);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleData = async () => {
    try {
      await apiService.addSampleData();
      toast.success('Sample data added successfully!');
      setShowSampleDataBanner(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add sample data');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Failed to Load Dashboard</h3>
        <p className="mt-2 text-sm text-gray-500">Please try refreshing the page.</p>
      </div>
    );
  }

  const {
    shoppingList,
    suggestions,
    expirationSummary,
    healthRating,
    purchaseStats,
    dataSummary
  } = dashboardData;

  const getHealthGradeColor = (grade) => {
    const colors = {
      A: 'green',
      B: 'yellow',
      C: 'yellow',
      D: 'red',
      F: 'red'
    };
    return colors[grade] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">
              Your smart grocery assistant is ready to help you shop healthier and smarter.
            </p>
          </div>
          <ShoppingCart className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Sample Data Banner */}
      {showSampleDataBanner && (
        <AlertBanner
          type="info"
          title="Get Started with Sample Data"
          description="It looks like you're new here! Add some sample data to explore all features."
          action={
            <button onClick={handleAddSampleData} className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Data
            </button>
          }
          onClose={() => setShowSampleDataBanner(false)}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Shopping List Items"
          value={shoppingList.item_count || 0}
          icon={ShoppingCart}
          color="blue"
        />
        
        <StatCard
          title="Smart Suggestions"
          value={suggestions?.length || 0}
          icon={Brain}
          color="purple"
        />
        
        <StatCard
          title="Items Expiring Soon"
          value={expirationSummary?.urgent_items + expirationSummary?.warning_items || 0}
          icon={Clock}
          color={expirationSummary?.needs_attention ? 'red' : 'green'}
        />
        
        <StatCard
          title="Health Grade"
          value={healthRating?.health_grade || 'N/A'}
          icon={Heart}
          color={getHealthGradeColor(healthRating?.health_grade)}
        />
      </div>

      {/* Quick Actions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/shopping-list" 
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium">Manage Shopping List</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </Link>

            <Link 
              to="/suggestions" 
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium">Get Smart Suggestions</span>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-600" />
            </Link>

            <Link 
              to="/expiration" 
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium">Check Expiring Items</span>
              </div>
              <ArrowRight className="h-4 w-4 text-yellow-600" />
            </Link>

            <Link 
              to="/health" 
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Health Recommendations</span>
              </div>
              <ArrowRight className="h-4 w-4 text-green-600" />
            </Link>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Insights</h2>
          
          {/* Health Score */}
          {healthRating && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Shopping List Health Score</span>
                <Badge 
                  variant={healthRating.health_grade === 'A' ? 'success' : 
                          healthRating.health_grade === 'B' ? 'warning' : 'danger'}
                >
                  {healthRating.health_grade}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Score: {healthRating.overall_score}/10
              </p>
              {healthRating.recommendations && healthRating.recommendations.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {healthRating.recommendations[0]}
                </p>
              )}
            </div>
          )}

          {/* Expiration Alert */}
          {expirationSummary?.needs_attention && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Expiration Alert</span>
              </div>
              <p className="text-sm text-red-700">
                {expirationSummary.expired_items + expirationSummary.urgent_items} items need immediate attention
              </p>
            </div>
          )}

          {/* Purchase Stats */}
          {purchaseStats && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium">Purchase Statistics</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Total purchases: {purchaseStats.total_purchases || 0}</p>
                <p>Unique items: {purchaseStats.unique_items || 0}</p>
                {purchaseStats.most_purchased && purchaseStats.most_purchased.length > 0 && (
                  <p>
                    Most bought: {purchaseStats.most_purchased[0][0]} ({purchaseStats.most_purchased[0][1]}x)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Shopping List Preview */}
      {shoppingList.items && shoppingList.items.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Shopping List</h2>
            <Link to="/shopping-list" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All ({shoppingList.item_count})
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shoppingList.items.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium capitalize">{item.name}</span>
                  <div className="text-sm text-gray-500">
                    {item.quantity} {item.unit}
                    {item.is_organic && <span className="text-green-600 ml-1">• Organic</span>}
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>

          {shoppingList.items.length > 6 && (
            <div className="mt-4 text-center">
              <Link to="/shopping-list" className="text-blue-600 hover:text-blue-800 text-sm">
                View {shoppingList.items.length - 6} more items →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Top Suggestions Preview */}
      {suggestions && suggestions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Smart Suggestions</h2>
            <Link to="/suggestions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All ({suggestions.length})
            </Link>
          </div>
          
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium capitalize">{suggestion.name}</span>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info" size="sm">
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
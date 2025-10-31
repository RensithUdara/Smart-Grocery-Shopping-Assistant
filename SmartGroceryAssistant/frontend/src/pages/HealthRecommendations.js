import React, { useState } from 'react';
import {
    Heart,
    TrendingUp,
    Award,
    AlertCircle,
    CheckCircle,
    ShoppingCart,
    RefreshCw,
    Filter,
    Zap,
    Shield,
    Target
} from 'lucide-react';
import { useHealthRecommendations } from '../hooks/useApi';
import {
    LoadingSpinner,
    EmptyState,
    Badge,
    StatCard,
    AlertBanner
} from '../components/common';
import toast from 'react-hot-toast';

const HealthRecommendations = () => {
    const {
        healthScore,
        alternatives,
        nutritionalAnalysis,
        loading,
        error,
        refresh
    } = useHealthRecommendations();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showOnlyHealthier, setShowOnlyHealthier] = useState(false);

    const categoryFilters = [
        { id: 'all', label: 'All Categories' },
        { id: 'fruits', label: 'Fruits' },
        { id: 'vegetables', label: 'Vegetables' },
        { id: 'grains', label: 'Grains' },
        { id: 'protein', label: 'Protein' },
        { id: 'dairy', label: 'Dairy' },
        { id: 'snacks', label: 'Snacks' },
        { id: 'beverages', label: 'Beverages' }
    ];

    if (loading) {
        return <LoadingSpinner text="Analyzing nutritional data..." />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading health data</div>
                <button onClick={refresh} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    // Filter alternatives by category and health improvement
    const getFilteredAlternatives = () => {
        let filtered = alternatives || [];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(alt =>
                alt.category === selectedCategory ||
                alt.original_category === selectedCategory
            );
        }

        if (showOnlyHealthier) {
            filtered = filtered.filter(alt => alt.health_improvement > 0);
        }

        return filtered;
    };

    const filteredAlternatives = getFilteredAlternatives();

    const getHealthScoreColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        if (score >= 40) return 'orange';
        return 'red';
    };

    const getHealthScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const getImprovementColor = (improvement) => {
        if (improvement > 20) return 'green';
        if (improvement > 10) return 'yellow';
        if (improvement > 0) return 'blue';
        return 'gray';
    };

    const renderNutrientBar = (nutrient, value, max = 100, unit = '%') => {
        const percentage = Math.min((value / max) * 100, 100);
        const isDeficient = value < max * 0.7;
        const isExcessive = value > max * 1.2;

        return (
            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{nutrient}</span>
                    <span>{value.toFixed(1)}{unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${isExcessive ? 'bg-red-500' :
                                isDeficient ? 'bg-yellow-500' :
                                    'bg-green-500'
                            }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                {(isDeficient || isExcessive) && (
                    <p className="text-xs text-gray-600">
                        {isDeficient ? 'Consider adding more ' + nutrient + '-rich foods' :
                            'Consider reducing ' + nutrient + ' intake'}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Health Recommendations</h1>
                    <p className="text-gray-600">Optimize your nutrition with smart alternatives</p>
                </div>
                <button onClick={refresh} className="btn btn-outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Health Score Overview */}
            {healthScore !== undefined && (
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Overall Health Score</h2>
                        <Badge
                            variant={getHealthScoreColor(healthScore)}
                            size="lg"
                        >
                            {healthScore}/100 - {getHealthScoreLabel(healthScore)}
                        </Badge>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div
                            className={`h-4 rounded-full transition-all duration-500 ${healthScore >= 80 ? 'bg-green-500' :
                                    healthScore >= 60 ? 'bg-yellow-500' :
                                        healthScore >= 40 ? 'bg-orange-500' :
                                            'bg-red-500'
                                }`}
                            style={{ width: `${healthScore}%` }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {alternatives ? alternatives.filter(a => a.health_improvement > 0).length : 0}
                            </div>
                            <div className="text-sm text-gray-600">Healthier Options Available</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {nutritionalAnalysis?.category_balance || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Category Balance</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {nutritionalAnalysis?.organic_percentage || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Organic Items</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nutritional Analysis */}
            {nutritionalAnalysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Nutrient Breakdown */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Nutritional Balance</h3>
                        <div className="space-y-4">
                            {nutritionalAnalysis.nutrients && Object.entries(nutritionalAnalysis.nutrients).map(([nutrient, data]) => (
                                <div key={nutrient}>
                                    {renderNutrientBar(
                                        nutrient,
                                        data.current || 0,
                                        data.recommended || 100,
                                        data.unit || '%'
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Food Category Distribution</h3>
                        <div className="space-y-3">
                            {nutritionalAnalysis.category_distribution &&
                                Object.entries(nutritionalAnalysis.category_distribution).map(([category, percentage]) => (
                                    <div key={category} className="flex items-center justify-between">
                                        <span className="capitalize font-medium">{category}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Health Alerts */}
            {nutritionalAnalysis?.health_alerts && nutritionalAnalysis.health_alerts.length > 0 && (
                <div className="space-y-2">
                    {nutritionalAnalysis.health_alerts.map((alert, index) => (
                        <AlertBanner
                            key={index}
                            type={alert.severity === 'high' ? 'error' : 'warning'}
                            title={alert.title}
                            description={alert.description}
                        />
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {categoryFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedCategory(filter.id)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedCategory === filter.id
                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={showOnlyHealthier}
                            onChange={(e) => setShowOnlyHealthier(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show only healthier alternatives</span>
                    </label>
                </div>
            </div>

            {/* Alternatives Grid */}
            {filteredAlternatives.length === 0 ? (
                <EmptyState
                    icon={Heart}
                    title="No alternatives available"
                    description={
                        selectedCategory === 'all'
                            ? "Start adding items to your shopping list to get personalized health recommendations."
                            : `No healthier alternatives found for the "${categoryFilters.find(f => f.id === selectedCategory)?.label}" category.`
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAlternatives.map((alternative, index) => (
                        <div key={index} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg capitalize text-gray-900">
                                        {alternative.alternative_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Alternative to <span className="font-medium">{alternative.original_name}</span>
                                    </p>
                                </div>

                                <div className="flex flex-col items-end space-y-1">
                                    <Badge
                                        variant={getImprovementColor(alternative.health_improvement)}
                                        size="sm"
                                    >
                                        {alternative.health_improvement > 0 ? '+' : ''}{alternative.health_improvement}% health
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Benefits */}
                                {alternative.benefits && alternative.benefits.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
                                        <div className="space-y-1">
                                            {alternative.benefits.slice(0, 3).map((benefit, i) => (
                                                <div key={i} className="flex items-center text-sm text-gray-600">
                                                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                                    <span>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nutritional Comparison */}
                                {alternative.nutritional_comparison && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Nutritional Improvements</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {Object.entries(alternative.nutritional_comparison).map(([nutrient, change]) => (
                                                <div key={nutrient} className="flex items-center justify-between">
                                                    <span className="capitalize">{nutrient}</span>
                                                    <span className={`font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                        {change > 0 ? '+' : ''}{change}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Category and Price */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <Badge variant="info" size="sm">
                                        {alternative.category}
                                    </Badge>
                                    {alternative.price_difference && (
                                        <span className={`text-xs font-medium ${alternative.price_difference > 0 ? 'text-red-600' :
                                                alternative.price_difference < 0 ? 'text-green-600' : 'text-gray-600'
                                            }`}>
                                            {alternative.price_difference > 0 ? '+' : ''}${alternative.price_difference.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        toast.success(`Added ${alternative.alternative_name} to shopping list`);
                                    }}
                                    className="btn btn-primary w-full"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add Alternative
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Health Tips */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">💡 Health Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Zap className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-medium text-green-800">Boost Nutrition</h4>
                        </div>
                        <p className="text-sm text-green-700">
                            Add colorful fruits and vegetables to increase antioxidants and vitamins in your diet.
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Shield className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-medium text-blue-800">Reduce Processed Foods</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                            Choose whole, unprocessed alternatives to reduce sodium and preservatives.
                        </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Target className="h-5 w-5 text-purple-600 mr-2" />
                            <h4 className="font-medium text-purple-800">Balance Macronutrients</h4>
                        </div>
                        <p className="text-sm text-purple-700">
                            Aim for a balance of carbohydrates, proteins, and healthy fats in each meal.
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Heart className="h-5 w-5 text-yellow-600 mr-2" />
                            <h4 className="font-medium text-yellow-800">Stay Hydrated</h4>
                        </div>
                        <p className="text-sm text-yellow-700">
                            Choose water over sugary drinks and include hydrating foods like cucumbers and watermelon.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthRecommendations;
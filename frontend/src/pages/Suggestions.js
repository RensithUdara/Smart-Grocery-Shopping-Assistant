import React, { useState } from 'react';
import {
    Brain,
    Plus,
    TrendingUp,
    Calendar,
    ShoppingCart,
    Lightbulb,
    Target,
    RefreshCw,
    Filter
} from 'lucide-react';
import { useSuggestions, useShoppingList } from '../hooks/useApi';
import {
    LoadingSpinner,
    EmptyState,
    Badge,
    StatCard,
    Tabs
} from '../components/common';
import toast from 'react-hot-toast';

const Suggestions = () => {
    const { suggestions, patterns, loading, error, refresh } = useSuggestions();
    const { addItem } = useShoppingList();
    const [selectedRuleType, setSelectedRuleType] = useState('all');
    const [adding, setAdding] = useState(new Set());

    const ruleTypeFilters = [
        { id: 'all', label: 'All Suggestions' },
        { id: 'pattern', label: 'Pattern Based' },
        { id: 'association', label: 'Item Associations' },
        { id: 'seasonal', label: 'Seasonal' },
        { id: 'category_balance', label: 'Category Balance' },
        { id: 'expiration_replacement', label: 'Expiration Replacement' },
    ];

    if (loading) {
        return <LoadingSpinner text="Analyzing your shopping patterns..." />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading suggestions</div>
                <button onClick={refresh} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    // Filter suggestions by rule type
    const filteredSuggestions = selectedRuleType === 'all'
        ? suggestions
        : suggestions.filter(s => s.rule_type === selectedRuleType);

    const handleAddSuggestion = async (suggestion) => {
        const key = `${suggestion.name}-${suggestion.category}`;
        setAdding(prev => new Set([...prev, key]));

        try {
            await addItem({
                name: suggestion.name,
                category: suggestion.category,
                quantity: 1,
                unit: 'pieces',
                expiration_days: 7,
                price: 0,
                is_organic: false
            });
            toast.success(`Added ${suggestion.name} to shopping list`);
        } catch (error) {
            toast.error(`Failed to add ${suggestion.name}`);
        } finally {
            setAdding(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
            });
        }
    };

    const getRuleTypeColor = (ruleType) => {
        const colors = {
            pattern: 'blue',
            association: 'purple',
            seasonal: 'green',
            category_balance: 'yellow',
            expiration_replacement: 'red'
        };
        return colors[ruleType] || 'gray';
    };

    const getRuleTypeDescription = (ruleType) => {
        const descriptions = {
            pattern: 'Based on your shopping history and frequency',
            association: 'Items that go well together',
            seasonal: 'Seasonal recommendations for this time of year',
            category_balance: 'To balance your nutritional categories',
            expiration_replacement: 'Replace items that are expiring soon'
        };
        return descriptions[ruleType] || 'Smart suggestion';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Smart Suggestions</h1>
                    <p className="text-gray-600">AI-powered recommendations based on your shopping patterns</p>
                </div>
                <button onClick={refresh} className="btn btn-outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Shopping Patterns Overview */}
            {patterns && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Purchases"
                        value={patterns.total_purchases || 0}
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatCard
                        title="Unique Items"
                        value={patterns.unique_items || 0}
                        icon={Target}
                        color="green"
                    />
                    <StatCard
                        title="Categories"
                        value={patterns.categories_shopped || 0}
                        icon={Filter}
                        color="purple"
                    />
                    <StatCard
                        title="Items/Week"
                        value={patterns.avg_items_per_week || 0}
                        icon={TrendingUp}
                        color="yellow"
                    />
                </div>
            )}

            {/* Pattern Analysis */}
            {patterns && (
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Shopping Pattern Analysis</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Items */}
                        {patterns.top_items && patterns.top_items.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Most Purchased Items</h3>
                                <div className="space-y-2">
                                    {patterns.top_items.slice(0, 5).map(([item, count], index) => (
                                        <div key={item} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="capitalize">{item}</span>
                                            <Badge variant="info" size="sm">{count}x</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Favorite Categories */}
                        {patterns.favorite_categories && patterns.favorite_categories.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Favorite Categories</h3>
                                <div className="space-y-2">
                                    {patterns.favorite_categories.slice(0, 5).map(([category, count], index) => (
                                        <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="capitalize">{category}</span>
                                            <Badge variant="success" size="sm">{count} items</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shopping Diversity */}
                    {patterns.shopping_diversity !== undefined && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Shopping Diversity Score</span>
                                <Badge
                                    variant={patterns.shopping_diversity > 0.7 ? 'success' :
                                        patterns.shopping_diversity > 0.4 ? 'warning' : 'danger'}
                                >
                                    {(patterns.shopping_diversity * 100).toFixed(0)}%
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {patterns.shopping_diversity > 0.7
                                    ? 'Great variety in your shopping!'
                                    : patterns.shopping_diversity > 0.4
                                        ? 'Good variety, consider trying new items.'
                                        : 'Try exploring more diverse food options.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Suggestion Filters */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filter Suggestions</h2>
                    <Badge variant="info">{filteredSuggestions.length} suggestions</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                    {ruleTypeFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedRuleType(filter.id)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedRuleType === filter.id
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suggestions List */}
            {filteredSuggestions.length === 0 ? (
                <EmptyState
                    icon={Lightbulb}
                    title="No suggestions available"
                    description={
                        selectedRuleType === 'all'
                            ? "We need more shopping history to generate personalized suggestions. Start by adding items to your shopping list and marking them as purchased."
                            : `No suggestions found for the "${ruleTypeFilters.find(f => f.id === selectedRuleType)?.label}" category.`
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuggestions.map((suggestion, index) => {
                        const key = `${suggestion.name}-${suggestion.category}`;
                        const isAdding = adding.has(key);

                        return (
                            <div key={index} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg capitalize text-gray-900">
                                            {suggestion.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {suggestion.reason}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <Badge
                                            variant={getRuleTypeColor(suggestion.rule_type)}
                                            size="sm"
                                        >
                                            {Math.round(suggestion.confidence * 100)}% match
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="info" size="sm">
                                            {suggestion.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {getRuleTypeDescription(suggestion.rule_type)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleAddSuggestion(suggestion)}
                                        disabled={isAdding}
                                        className="btn btn-primary w-full"
                                    >
                                        {isAdding ? (
                                            <span className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Adding...
                                            </span>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add to List
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Suggestions;
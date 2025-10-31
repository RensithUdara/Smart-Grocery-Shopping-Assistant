import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Calendar,
    Clock,
    ChefHat,
    Bell,
    CheckCircle,
    XCircle,
    RefreshCw,
    Filter,
    Search
} from 'lucide-react';
import { useExpirationTracker } from '../hooks/useApi';
import {
    LoadingSpinner,
    EmptyState,
    Badge,
    StatCard,
    Modal,
    AlertBanner
} from '../components/common';
import toast from 'react-hot-toast';

const ExpirationTracker = () => {
    const { expiringItems, mealSuggestions, loading, error, refresh } = useExpirationTracker();
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMealPlan, setShowMealPlan] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const priorityFilters = [
        { id: 'all', label: 'All Items' },
        { id: 'expired', label: 'Expired' },
        { id: 'critical', label: 'Critical (1-2 days)' },
        { id: 'warning', label: 'Warning (3-7 days)' },
        { id: 'safe', label: 'Safe (8+ days)' }
    ];

    if (loading) {
        return <LoadingSpinner text="Checking expiration dates..." />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading expiration data</div>
                <button onClick={refresh} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    // Categorize items by expiration priority
    const categorizeItems = (items) => {
        const categories = {
            expired: [],
            critical: [],
            warning: [],
            safe: []
        };

        items.forEach(item => {
            if (item.days_until_expiration < 0) {
                categories.expired.push(item);
            } else if (item.days_until_expiration <= 2) {
                categories.critical.push(item);
            } else if (item.days_until_expiration <= 7) {
                categories.warning.push(item);
            } else {
                categories.safe.push(item);
            }
        });

        return categories;
    };

    const categories = categorizeItems(expiringItems || []);

    // Filter items based on selected priority and search term
    const getFilteredItems = () => {
        let items = [];

        if (selectedPriority === 'all') {
            items = expiringItems || [];
        } else {
            items = categories[selectedPriority] || [];
        }

        if (searchTerm) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return items;
    };

    const filteredItems = getFilteredItems();

    const getPriorityColor = (daysUntilExpiration) => {
        if (daysUntilExpiration < 0) return 'red';
        if (daysUntilExpiration <= 2) return 'red';
        if (daysUntilExpiration <= 7) return 'yellow';
        return 'green';
    };

    const getPriorityLabel = (daysUntilExpiration) => {
        if (daysUntilExpiration < 0) return 'Expired';
        if (daysUntilExpiration <= 2) return 'Critical';
        if (daysUntilExpiration <= 7) return 'Warning';
        return 'Safe';
    };

    const formatExpirationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Expired ${Math.abs(diffDays)} days ago`;
        } else if (diffDays === 0) {
            return 'Expires today';
        } else if (diffDays === 1) {
            return 'Expires tomorrow';
        } else {
            return `Expires in ${diffDays} days`;
        }
    };

    const handleItemSelect = (itemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const generateMealPlan = () => {
        const selectedItemData = filteredItems.filter(item => selectedItems.has(item.id));
        if (selectedItemData.length === 0) {
            toast.error('Please select items to create a meal plan');
            return;
        }
        setShowMealPlan(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expiration Tracker</h1>
                    <p className="text-gray-600">Monitor food freshness and reduce waste</p>
                </div>
                <button onClick={refresh} className="btn btn-outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Priority Alerts */}
            {categories.expired.length > 0 && (
                <AlertBanner
                    type="error"
                    title={`${categories.expired.length} items have expired`}
                    description="These items should be disposed of immediately for food safety."
                />
            )}

            {categories.critical.length > 0 && (
                <AlertBanner
                    type="warning"
                    title={`${categories.critical.length} items expire within 2 days`}
                    description="Consider using these items in your next meals or meal planning."
                />
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Expired Items"
                    value={categories.expired.length}
                    icon={XCircle}
                    color="red"
                />
                <StatCard
                    title="Critical (1-2 days)"
                    value={categories.critical.length}
                    icon={AlertTriangle}
                    color="red"
                />
                <StatCard
                    title="Warning (3-7 days)"
                    value={categories.warning.length}
                    icon={Clock}
                    color="yellow"
                />
                <StatCard
                    title="Safe (8+ days)"
                    value={categories.safe.length}
                    icon={CheckCircle}
                    color="green"
                />
            </div>

            {/* Controls */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex flex-wrap gap-2">
                        {priorityFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedPriority(filter.id)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedPriority === filter.id
                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {filter.label}
                                {filter.id !== 'all' && (
                                    <span className="ml-1 text-xs">
                                        ({categories[filter.id]?.length || 0})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedItems.size > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {selectedItems.size} items selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={generateMealPlan}
                                    className="btn btn-primary btn-sm"
                                >
                                    <ChefHat className="h-4 w-4 mr-1" />
                                    Create Meal Plan
                                </button>
                                <button
                                    onClick={() => setSelectedItems(new Set())}
                                    className="btn btn-outline btn-sm"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Items List */}
            {filteredItems.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No items found"
                    description={
                        searchTerm
                            ? `No items match "${searchTerm}". Try a different search term.`
                            : selectedPriority === 'all'
                                ? "No items in your inventory are being tracked for expiration."
                                : `No items in the "${priorityFilters.find(f => f.id === selectedPriority)?.label}" category.`
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`card hover:shadow-lg transition-all cursor-pointer ${selectedItems.has(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                            onClick={() => handleItemSelect(item.id)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg capitalize text-gray-900">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {item.category} • Qty: {item.quantity} {item.unit}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end space-y-1">
                                    <Badge
                                        variant={getPriorityColor(item.days_until_expiration)}
                                        size="sm"
                                    >
                                        {getPriorityLabel(item.days_until_expiration)}
                                    </Badge>
                                    {selectedItems.has(item.id) && (
                                        <CheckCircle className="h-4 w-4 text-blue-500" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{formatExpirationDate(item.expiration_date)}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>
                                        {item.days_until_expiration < 0
                                            ? `${Math.abs(item.days_until_expiration)} days overdue`
                                            : item.days_until_expiration === 0
                                                ? 'Today'
                                                : `${item.days_until_expiration} days left`
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 text-xs py-1 px-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toast.info('Mark as used feature coming soon');
                                        }}
                                    >
                                        Mark as Used
                                    </button>
                                    <button
                                        className="flex-1 text-xs py-1 px-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toast.info('Extend date feature coming soon');
                                        }}
                                    >
                                        Extend Date
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Meal Plan Modal */}
            {showMealPlan && (
                <Modal onClose={() => setShowMealPlan(false)} title="Meal Plan Suggestions">
                    <div className="space-y-4">
                        {mealSuggestions && mealSuggestions.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Here are some meal suggestions using your selected items:
                                </p>
                                {mealSuggestions.map((meal, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900">{meal.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                                        {meal.ingredients && (
                                            <div className="mt-2">
                                                <p className="text-xs font-medium text-gray-700">Uses:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {meal.ingredients.map((ingredient, i) => (
                                                        <Badge key={i} variant="info" size="sm">
                                                            {ingredient}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">
                                    No specific meal suggestions available for the selected items.
                                    Consider combining them with staples like rice, pasta, or bread.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                            <button
                                onClick={() => setShowMealPlan(false)}
                                className="btn btn-outline flex-1"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    toast.success('Meal plan saved to your notes');
                                    setShowMealPlan(false);
                                }}
                                className="btn btn-primary flex-1"
                            >
                                Save Plan
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ExpirationTracker;
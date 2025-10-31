import React, { useState } from 'react';
import { 
  Plus, 
  ShoppingBag, 
  Grid, 
  List, 
  Search, 
  Filter,
  Download,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useShoppingList } from '../hooks/useApi';
import { 
  LoadingSpinner, 
  EmptyState, 
  Modal, 
  ConfirmDialog, 
  Tabs,
  AlertBanner
} from '../components/common';
import { 
  GroceryItemCard, 
  AddItemForm, 
  ShoppingListSummary 
} from '../components/GroceryItems';

const ShoppingList = () => {
  const {
    shoppingList,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearList,
    markAsPurchased,
    refresh
  } = useShoppingList();

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading shopping list..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading shopping list</div>
        <button onClick={refresh} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!shoppingList) {
    return <LoadingSpinner text="Initializing..." />;
  }

  // Filter items based on search and category
  const filteredItems = shoppingList.items ? shoppingList.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Get unique categories for filter
  const categories = shoppingList.items ? 
    [...new Set(shoppingList.items.map(item => item.category))] : [];

  const handleAddItem = async (itemData) => {
    try {
      await addItem(itemData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleMarkAllPurchased = async () => {
    try {
      await markAsPurchased();
      setShowConfirmPurchase(false);
    } catch (error) {
      console.error('Failed to mark as purchased:', error);
    }
  };

  const handleClearList = async () => {
    try {
      await clearList();
      setShowConfirmClear(false);
    } catch (error) {
      console.error('Failed to clear list:', error);
    }
  };

  const exportList = () => {
    const listText = shoppingList.items
      .map(item => `${item.name} - ${item.quantity} ${item.unit} (${item.category})`)
      .join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
          
          {shoppingList.items && shoppingList.items.length > 0 && (
            <>
              <button
                onClick={() => setShowConfirmPurchase(true)}
                className="btn btn-success"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Purchased
              </button>
              
              <button
                onClick={exportList}
                className="btn btn-outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              <button
                onClick={() => setShowConfirmClear(true)}
                className="btn btn-danger"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Shopping List Summary */}
      {shoppingList.items && shoppingList.items.length > 0 && (
        <ShoppingListSummary shoppingList={shoppingList} />
      )}

      {/* Search and Filters */}
      {shoppingList.items && shoppingList.items.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Items */}
      {!shoppingList.items || shoppingList.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping list is empty"
          description="Start by adding some items to your shopping list."
          action={
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No items match your search criteria.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredItems.map((item, index) => (
            <GroceryItemCard
              key={`${item.name}-${item.category}-${index}`}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
              showActions={true}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Item"
        maxWidth="lg"
      >
        <AddItemForm
          onAdd={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Confirm Purchase Dialog */}
      <ConfirmDialog
        isOpen={showConfirmPurchase}
        onClose={() => setShowConfirmPurchase(false)}
        onConfirm={handleMarkAllPurchased}
        title="Mark Items as Purchased"
        message={`Are you sure you want to mark all ${shoppingList.item_count} items as purchased? This will move them to your purchase history and clear your shopping list.`}
        confirmText="Mark as Purchased"
        type="success"
      />

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={handleClearList}
        title="Clear Shopping List"
        message={`Are you sure you want to clear all ${shoppingList.item_count} items from your shopping list? This action cannot be undone.`}
        confirmText="Clear All"
        type="danger"
      />
    </div>
  );
};

export default ShoppingList;
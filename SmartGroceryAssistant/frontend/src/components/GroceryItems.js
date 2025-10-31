import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, Edit3 } from 'lucide-react';
import { Badge, ConfirmDialog } from './common';

export const GroceryItemCard = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  showActions = true,
  compact = false 
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    onQuantityChange(item.name, newQuantity, item.category);
  };

  const getCategoryColor = (category) => {
    const colors = {
      fruits: 'success',
      vegetables: 'success',
      dairy: 'info',
      protein: 'warning',
      grains: 'default',
      snacks: 'danger',
    };
    return colors[category] || 'default';
  };

  const formatExpirationStatus = (item) => {
    if (!item.purchase_date) return null;
    
    const purchaseDate = new Date(item.purchase_date);
    const expirationDate = new Date(purchaseDate.getTime() + (item.expiration_days * 24 * 60 * 60 * 1000));
    const daysUntilExpiry = Math.ceil((expirationDate - new Date()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry < 0) {
      return { text: `Expired ${Math.abs(daysUntilExpiry)} days ago`, variant: 'danger' };
    } else if (daysUntilExpiry === 0) {
      return { text: 'Expires today', variant: 'danger' };
    } else if (daysUntilExpiry <= 3) {
      return { text: `Expires in ${daysUntilExpiry} days`, variant: 'warning' };
    }
    return null;
  };

  const expirationStatus = formatExpirationStatus(item);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 capitalize">{item.name}</h4>
            <p className="text-sm text-gray-500">
              {item.quantity} {item.unit}
              {item.is_organic && <span className="text-green-600 ml-2">• Organic</span>}
            </p>
          </div>
          <Badge variant={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
        </div>
        {expirationStatus && (
          <Badge variant={expirationStatus.variant} size="sm">
            {expirationStatus.text}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {item.name}
              </h3>
              {item.is_organic && (
                <Badge variant="success" size="sm">Organic</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <Badge variant={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
              <span className="text-sm text-gray-600">
                {item.quantity} {item.unit}
              </span>
              {item.price > 0 && (
                <span className="text-sm text-gray-600">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>

            {expirationStatus && (
              <div className="mb-3">
                <Badge variant={expirationStatus.variant} size="sm">
                  {expirationStatus.text}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={item.quantity <= 1}
                className="btn btn-outline btn-sm"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="text-lg font-medium px-2">
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(1)}
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => onRemove(item.name, item.category)}
        title="Remove Item"
        message={`Are you sure you want to remove "${item.name}" from your shopping list?`}
        confirmText="Remove"
        type="danger"
      />
    </>
  );
};

export const AddItemForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: 1,
    unit: 'pieces',
    expiration_days: 7,
    price: 0,
    is_organic: false,
  });
  
  const [loading, setLoading] = useState(false);

  const categories = [
    'fruits', 'vegetables', 'dairy', 'protein', 'grains', 
    'snacks', 'beverages', 'condiments', 'frozen', 'other'
  ];

  const units = [
    'pieces', 'kg', 'g', 'liters', 'ml', 'cups', 'boxes', 
    'cans', 'bottles', 'packages', 'bunches'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onAdd(formData);
      setFormData({
        name: '',
        category: 'other',
        quantity: 1,
        unit: 'pieces',
        expiration_days: 7,
        price: 0,
        is_organic: false,
      });
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="label">Item Name *</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Milk, Bananas, Bread"
            required
          />
        </div>

        <div className="input-group">
          <label className="label">Category</label>
          <select
            className="select"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Quantity</label>
          <input
            type="number"
            className="input"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>

        <div className="input-group">
          <label className="label">Unit</label>
          <select
            className="select"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Expected Expiration (days)</label>
          <input
            type="number"
            className="input"
            value={formData.expiration_days}
            onChange={(e) => handleChange('expiration_days', parseInt(e.target.value) || 7)}
            min="1"
          />
        </div>

        <div className="input-group">
          <label className="label">Price (optional)</label>
          <input
            type="number"
            className="input"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.is_organic}
            onChange={(e) => handleChange('is_organic', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700">Organic</span>
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading || !formData.name.trim()}
          className="btn btn-primary flex-1"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export const ShoppingListSummary = ({ shoppingList }) => {
  if (!shoppingList || !shoppingList.items) return null;

  const categoryCounts = shoppingList.items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const totalValue = shoppingList.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const organicCount = shoppingList.items.filter(item => item.is_organic).length;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Shopping Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{shoppingList.item_count}</div>
          <div className="text-sm text-gray-600">Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{shoppingList.total_quantity}</div>
          <div className="text-sm text-gray-600">Total Qty</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{organicCount}</div>
          <div className="text-sm text-gray-600">Organic</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Est. Total</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">By Category</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <Badge key={category} variant="info" size="sm">
              {category}: {count}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
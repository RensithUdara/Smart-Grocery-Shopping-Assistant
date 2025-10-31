import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Fab,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  ShoppingCart,
  Clear,
  LocalOffer,
} from '@mui/icons-material';
import { shoppingListApi, GroceryItem } from '../services/api';

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    expiration_days: 7,
    price: 0,
    is_organic: false,
  });

  const categories = [
    'Fruits & Vegetables',
    'Meat & Poultry',
    'Dairy & Eggs',
    'Bakery',
    'Pantry',
    'Beverages',
    'Frozen',
    'Snacks',
    'Personal Care',
    'Household',
  ];

  const units = ['pieces', 'lbs', 'kg', 'oz', 'liters', 'gallons', 'dozen', 'bunches'];

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listResponse, summaryResponse] = await Promise.all([
        shoppingListApi.getList(),
        shoppingListApi.getSummary(),
      ]);
      setItems(listResponse.data.items || []);
      setSummary(summaryResponse.data);
    } catch (err) {
      setError('Failed to load shopping list');
      console.error('Shopping list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingList();
  }, []);

  const handleAddItem = async () => {
    try {
      await shoppingListApi.addItem(newItem);
      setNewItem({
        name: '',
        category: '',
        quantity: 1,
        unit: 'pieces',
        expiration_days: 7,
        price: 0,
        is_organic: false,
      });
      setOpenDialog(false);
      loadShoppingList();
    } catch (err) {
      setError('Failed to add item');
      console.error('Add item error:', err);
    }
  };

  const handleRemoveItem = async (name: string, category: string) => {
    try {
      await shoppingListApi.removeItem(name, category);
      loadShoppingList();
    } catch (err) {
      setError('Failed to remove item');
      console.error('Remove item error:', err);
    }
  };

  const handleUpdateQuantity = async (name: string, quantity: number, category: string) => {
    try {
      await shoppingListApi.updateQuantity(name, quantity, category);
      loadShoppingList();
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Update quantity error:', err);
    }
  };

  const handleClearList = async () => {
    try {
      await shoppingListApi.clearList();
      loadShoppingList();
    } catch (err) {
      setError('Failed to clear list');
      console.error('Clear list error:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fruits & Vegetables': '#4CAF50',
      'Meat & Poultry': '#F44336',
      'Dairy & Eggs': '#2196F3',
      'Bakery': '#FF9800',
      'Pantry': '#795548',
      'Beverages': '#9C27B0',
      'Frozen': '#00BCD4',
      'Snacks': '#FFC107',
      'Personal Care': '#E91E63',
      'Household': '#607D8B',
    };
    return colors[category] || '#757575';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Shopping List
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClearList}
            sx={{ mr: 2 }}
            disabled={items.length === 0}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      {summary && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              List Summary
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {summary.total_items}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Items
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600 }}>
                  {summary.total_quantity}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Quantity
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                  ${summary.estimated_total.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Estimated Total
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                  {summary.organic_count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Organic Items
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Shopping List Items */}
      <Card>
        <CardContent>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Your shopping list is empty
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Add items to get started with your grocery shopping
              </Typography>
            </Box>
          ) : (
            <List>
              {items.map((item, index) => (
                <React.Fragment key={`${item.name}-${item.category}`}>
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(item.category),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                          {item.is_organic && (
                            <Chip
                              label="Organic"
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<LocalOffer />}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {item.quantity} {item.unit} • ${item.price.toFixed(2)} each • Expires in {item.expiration_days} days
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.name, parseInt(e.target.value) || 1, item.category)}
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                        />
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveItem(item.name, item.category)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
              />
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price ($)"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                sx={{ flex: 1 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              <TextField
                label="Expiration (days)"
                type="number"
                value={newItem.expiration_days}
                onChange={(e) => setNewItem({ ...newItem, expiration_days: parseInt(e.target.value) || 7 })}
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={newItem.is_organic}
                  onChange={(e) => setNewItem({ ...newItem, is_organic: e.target.checked })}
                />
              }
              label="Organic Product"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained"
            disabled={!newItem.name || !newItem.category}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default ShoppingList;
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
    ShoppingCart,
    Clear,
    LocalOffer,
} from '@mui/icons-material';
import { shoppingListApi, GroceryItem, purchaseHistoryApi } from '../services/api';
import {
    capitalizeWords,
    formatCategory,
    getCategoryColor,
    checkRecentPurchase,
    formatQuantity,
    formatPrice,
} from '../utils/uiHelpers';
import WarningDialog from '../components/WarningDialog';

const ShoppingList: React.FC = () => {
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [summary, setSummary] = useState<any>(null);
    
    // Warning dialog state
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [pendingItem, setPendingItem] = useState<any>(null);
    const [warningMessage, setWarningMessage] = useState('');
    const [daysSinceLastPurchase, setDaysSinceLastPurchase] = useState(0);

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

    const checkForRecentPurchase = async (item: any) => {
        try {
            const response = await purchaseHistoryApi.checkRecentPurchase(item.name);
            const recentPurchaseData = response.data;
            
            if (recentPurchaseData && recentPurchaseData.is_recent) {
                const warningCheck = checkRecentPurchase(
                    recentPurchaseData.last_purchased,
                    item.name,
                    30 // Warning if purchased within 30 days
                );
                
                if (warningCheck.shouldWarn) {
                    setPendingItem({
                        ...item,
                        last_purchased: recentPurchaseData.last_purchased,
                        purchase_frequency: recentPurchaseData.frequency
                    });
                    setWarningMessage(warningCheck.message);
                    setDaysSinceLastPurchase(warningCheck.daysSince);
                    setShowWarningDialog(true);
                    return false; // Don't add immediately
                }
            }
        } catch (error) {
            console.log('No recent purchase data available, proceeding normally');
        }
        return true; // Proceed with adding
    };

    const handleAddItem = async () => {
        try {
            // Capitalize item name
            const itemToAdd = {
                ...newItem,
                name: capitalizeWords(newItem.name.trim()),
                category: formatCategory(newItem.category)
            };
            
            // Check for recent purchases
            const canProceed = await checkForRecentPurchase(itemToAdd);
            if (!canProceed) {
                return; // Wait for user decision in warning dialog
            }
            
            await shoppingListApi.addItem(itemToAdd);
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

    // Warning dialog handlers
    const handleWarningConfirm = async () => {
        setShowWarningDialog(false);
        if (pendingItem) {
            // Add the item without checking again
            await shoppingListApi.addItem(pendingItem);
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
            await loadShoppingList();
        }
        setPendingItem(null);
    };

    const handleWarningCancel = () => {
        setShowWarningDialog(false);
        setPendingItem(null);
        setWarningMessage('');
        setDaysSinceLastPurchase(0);
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
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 700, 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                >
                    🛒 Smart Shopping List
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
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            color: 'text.primary',
                                                            letterSpacing: 0.5
                                                        }}
                                                    >
                                                        {capitalizeWords(item.name)}
                                                    </Typography>
                                                    <Chip
                                                        label={formatCategory(item.category)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getCategoryColor(item.category),
                                                            color: 'white',
                                                            fontSize: '0.75rem',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    {item.is_organic && (
                                                        <Chip
                                                            label="Organic"
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                            icon={<LocalOffer />}
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                height: 24
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        sx={{ fontWeight: 500 }}
                                                    >
                                                        📦 {formatQuantity(item.quantity, item.unit)}
                                                    </Typography>
                                                    {item.price > 0 && (
                                                        <Typography 
                                                            variant="body2" 
                                                            color="success.main"
                                                            sx={{ fontWeight: 500 }}
                                                        >
                                                            💰 {formatPrice(item.price)}
                                                        </Typography>
                                                    )}
                                                    {item.expiration_days && (
                                                        <Typography 
                                                            variant="body2" 
                                                            color={item.expiration_days <= 3 ? 'error.main' : 'text.secondary'}
                                                            sx={{ fontWeight: 500 }}
                                                        >
                                                            ⏰ {item.expiration_days} days
                                                        </Typography>
                                                    )}
                                                </Box>
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
                <DialogTitle sx={{ fontWeight: 600, textAlign: 'center', pb: 1, fontSize: '1.5rem' }}>
                    🛒 Add New Item
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                        <TextField
                            label="Item Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: capitalizeWords(e.target.value) })}
                            fullWidth
                            required
                            placeholder="e.g. Fresh Apples, Whole Milk, Organic Eggs"
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: formatCategory(e.target.value) })}
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
                                sx={{ 
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(0,0,0,0.02)'
                                    }
                                }}
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
                                label="Price (Rs.)"
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

            {/* Warning Dialog for Recent Purchases */}
            <WarningDialog
                open={showWarningDialog}
                onClose={handleWarningCancel}
                onConfirm={handleWarningConfirm}
                item={pendingItem}
                warningMessage={warningMessage}
                daysSinceLastPurchase={daysSinceLastPurchase}
            />

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
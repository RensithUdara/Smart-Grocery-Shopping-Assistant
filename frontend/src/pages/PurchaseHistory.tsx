import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    History,
    Search,
    FilterList,
    Add,
    LocalOffer,
    TrendingUp,
} from '@mui/icons-material';
import { purchaseHistoryApi, shoppingListApi, GroceryItem } from '../services/api';

const PurchaseHistory: React.FC = () => {
    const [history, setHistory] = useState<any>(null);
    const [filteredItems, setFilteredItems] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [newPurchase, setNewPurchase] = useState({
        name: '',
        category: '',
        quantity: 1,
        unit: 'pieces',
        expiration_days: 7,
        price: 0,
        is_organic: false,
        purchase_date: new Date().toISOString().split('T')[0],
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

    const loadPurchaseHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await purchaseHistoryApi.getHistory();
            setHistory(response.data);
            setFilteredItems(response.data.items || []);
        } catch (err) {
            setError('Failed to load purchase history');
            console.error('Purchase history error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchaseHistory();
    }, []);

    useEffect(() => {
        if (!history?.items) return;

        let filtered = history.items;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((item: GroceryItem) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter((item: GroceryItem) => item.category === categoryFilter);
        }

        setFilteredItems(filtered);
    }, [searchTerm, categoryFilter, history]);

    const handleAddPurchase = async () => {
        try {
            await purchaseHistoryApi.addPurchase({
                ...newPurchase,
                purchase_date: newPurchase.purchase_date,
            });
            setNewPurchase({
                name: '',
                category: '',
                quantity: 1,
                unit: 'pieces',
                expiration_days: 7,
                price: 0,
                is_organic: false,
                purchase_date: new Date().toISOString().split('T')[0],
            });
            setOpenAddDialog(false);
            loadPurchaseHistory();
        } catch (err) {
            setError('Failed to add purchase');
            console.error('Add purchase error:', err);
        }
    };

    const addToShoppingList = async (item: GroceryItem) => {
        try {
            await shoppingListApi.addItem({
                name: item.name,
                category: item.category,
                quantity: 1,
                unit: item.unit,
                expiration_days: item.expiration_days,
                price: item.price,
                is_organic: item.is_organic,
            });
        } catch (err) {
            setError('Failed to add item to shopping list');
            console.error('Add to shopping list error:', err);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                    Purchase History
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddDialog(true)}
                >
                    Add Purchase
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Card */}
            {history && (
                <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                            History Summary
                        </Typography>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2
                        }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                                    {history.items?.length || 0}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Items
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                                    ${history.items?.reduce((sum: number, item: GroceryItem) => sum + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Spent
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                                    {new Set(history.items?.map((item: GroceryItem) => item.category)).size || 0}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Categories
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                                    {history.items?.filter((item: GroceryItem) => item.is_organic).length || 0}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Organic Items
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1, minWidth: 250 }}
                        />

                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Filter by Category"
                                startAdornment={<FilterList sx={{ mr: 1 }} />}
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Purchase History Items */}
            <Card>
                <CardContent>
                    {filteredItems.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">
                                {searchTerm || categoryFilter ? 'No items found matching your criteria' : 'No purchase history available'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                {searchTerm || categoryFilter
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start adding your grocery purchases to track your shopping history'
                                }
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {filteredItems.map((item, index) => (
                                <React.Fragment key={index}>
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
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {item.quantity} {item.unit} • Rs.{item.price.toFixed(2)} each • Total: Rs.{(item.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                    {item.purchase_date && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Purchased on {formatDate(item.purchase_date)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Add />}
                                                onClick={() => addToShoppingList(item)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Buy Again
                                            </Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < filteredItems.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Add Purchase Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Purchase Record</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                        <TextField
                            label="Item Name"
                            value={newPurchase.name}
                            onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                            fullWidth
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newPurchase.category}
                                onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
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
                                value={newPurchase.quantity}
                                onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) || 1 })}
                                sx={{ flex: 1 }}
                                inputProps={{ min: 1 }}
                            />

                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                    value={newPurchase.unit}
                                    onChange={(e) => setNewPurchase({ ...newPurchase, unit: e.target.value })}
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
                                value={newPurchase.price}
                                onChange={(e) => setNewPurchase({ ...newPurchase, price: parseFloat(e.target.value) || 0 })}
                                sx={{ flex: 1 }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />

                            <TextField
                                label="Purchase Date"
                                type="date"
                                value={newPurchase.purchase_date}
                                onChange={(e) => setNewPurchase({ ...newPurchase, purchase_date: e.target.value })}
                                sx={{ flex: 1 }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <TextField
                            label="Expiration (days)"
                            type="number"
                            value={newPurchase.expiration_days}
                            onChange={(e) => setNewPurchase({ ...newPurchase, expiration_days: parseInt(e.target.value) || 7 })}
                            fullWidth
                            inputProps={{ min: 1 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newPurchase.is_organic}
                                    onChange={(e) => setNewPurchase({ ...newPurchase, is_organic: e.target.checked })}
                                />
                            }
                            label="Organic Product"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddPurchase}
                        variant="contained"
                        disabled={!newPurchase.name || !newPurchase.category}
                    >
                        Add Purchase
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
                onClick={() => setOpenAddDialog(true)}
            >
                <Add />
            </Fab>
        </Container>
    );
};

export default PurchaseHistory;
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    TextField,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Store as StoreIcon,
    Compare as CompareIcon,
    Route as RouteIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    LocalOffer as OffersIcon,
    LocationOn as LocationIcon,
    Star as StarIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    ShoppingCart as CartIcon,
    Navigation as NavigationIcon,
    ExpandMore as ExpandMoreIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import apiService from '../services/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`store-tabpanel-${index}`}
            aria-labelledby={`store-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const StoreIntegration: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [nearbyStores, setNearbyStores] = useState<any[]>([]);
    const [priceComparison, setPriceComparison] = useState<any>(null);
    const [storeRecommendations, setStoreRecommendations] = useState<any[]>([]);
    const [shoppingRoute, setShoppingRoute] = useState<any>(null);
    const [priceHistory, setPriceHistory] = useState<any>(null);
    const [shoppingStrategy, setShoppingStrategy] = useState<any>(null);
    const [currentDeals, setCurrentDeals] = useState<any[]>([]);

    // Form states
    const [shoppingList, setShoppingList] = useState<string[]>(['Bananas', 'Milk', 'Bread', 'Eggs']);
    const [newItem, setNewItem] = useState('');
    const [maxDistance, setMaxDistance] = useState(10);
    const [budget, setBudget] = useState<number>(50);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState('');

    // Dialog states
    const [routeDialogOpen, setRouteDialogOpen] = useState(false);
    const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);

    useEffect(() => {
        loadNearbyStores();
        loadCurrentDeals();
    }, [maxDistance]);

    useEffect(() => {
        if (shoppingList.length > 0) {
            loadPriceComparison();
            loadStoreRecommendations();
        }
    }, [shoppingList]);

    const loadNearbyStores = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/api/stores/nearby?max_distance=${maxDistance}`);
            setNearbyStores(response.data.stores || []);
        } catch (error) {
            console.error('Error loading nearby stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPriceComparison = async () => {
        try {
            const response = await apiService.post('/api/stores/compare-prices', {
                shopping_list: shoppingList
            });
            setPriceComparison(response.data);
        } catch (error) {
            console.error('Error loading price comparison:', error);
        }
    };

    const loadStoreRecommendations = async () => {
        try {
            const response = await apiService.post('/api/stores/recommendations', {
                shopping_list: shoppingList,
                preferences: {
                    priority: 'price',
                    max_distance: maxDistance
                }
            });
            setStoreRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error loading store recommendations:', error);
        }
    };

    const loadCurrentDeals = async () => {
        try {
            const response = await apiService.get('/api/stores/deals');
            setCurrentDeals(response.data.deals_by_store || []);
        } catch (error) {
            console.error('Error loading current deals:', error);
        }
    };

    const loadPriceHistory = async (itemName: string) => {
        try {
            setLoading(true);
            const response = await apiService.get(`/api/stores/price-history/${encodeURIComponent(itemName)}?days=30`);
            setPriceHistory(response.data);
        } catch (error) {
            console.error('Error loading price history:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateShoppingStrategy = async () => {
        try {
            setLoading(true);
            const response = await apiService.post('/api/stores/shopping-strategy', {
                shopping_list: shoppingList,
                budget: budget
            });
            setShoppingStrategy(response.data);
            setStrategyDialogOpen(true);
        } catch (error) {
            console.error('Error generating shopping strategy:', error);
        } finally {
            setLoading(false);
        }
    };

    const optimizeRoute = async () => {
        if (selectedStores.length === 0) {
            alert('Please select stores for route optimization');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.post('/api/stores/optimize-route', {
                selected_stores: selectedStores
            });
            setShoppingRoute(response.data);
            setRouteDialogOpen(true);
        } catch (error) {
            console.error('Error optimizing route:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItemToList = () => {
        if (newItem.trim() && !shoppingList.includes(newItem.trim())) {
            setShoppingList([...shoppingList, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItemFromList = (item: string) => {
        setShoppingList(shoppingList.filter(i => i !== item));
    };

    const handleStoreSelection = (storeId: string) => {
        setSelectedStores(prev =>
            prev.includes(storeId)
                ? prev.filter(id => id !== storeId)
                : [...prev, storeId]
        );
    };

    const formatCurrency = (amount: number | null) => {
        return amount ? `$${amount.toFixed(2)}` : 'N/A';
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing':
                return <TrendingUpIcon color="error" />;
            case 'decreasing':
                return <TrendingDownIcon color="success" />;
            default:
                return <MoneyIcon color="primary" />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StoreIcon /> Store Integration & Price Comparison
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Find the best deals, compare prices across stores, and optimize your shopping routes.
            </Typography>

            {/* Shopping List Management */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <CartIcon sx={{ mr: 1 }} /> Shopping List
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="Add item"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addItemToList()}
                            size="small"
                            sx={{ flexGrow: 1 }}
                        />
                        <Button variant="contained" onClick={addItemToList}>Add</Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {shoppingList.map((item, index) => (
                            <Chip
                                key={index}
                                label={item}
                                onDelete={() => removeItemFromList(item)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Budget ($)"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            size="small"
                            sx={{ width: 120 }}
                        />
                        <TextField
                            label="Max Distance (miles)"
                            type="number"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                        />
                        <Button
                            variant="contained"
                            color="success"
                            onClick={generateShoppingStrategy}
                            disabled={loading || shoppingList.length === 0}
                        >
                            Get Shopping Strategy
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Store Finder" />
                <Tab label="Price Comparison" />
                <Tab label="Recommendations" />
                <Tab label="Price History" />
                <Tab label="Current Deals" />
            </Tabs>

            {/* Store Finder Tab */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Nearby Stores</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<NavigationIcon />}
                            onClick={optimizeRoute}
                            disabled={selectedStores.length === 0}
                            sx={{ mr: 1 }}
                        >
                            Optimize Route
                        </Button>
                        <IconButton onClick={loadNearbyStores} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Grid container spacing={2}>
                    {nearbyStores.map((store) => (
                        <Grid item xs={12} md={6} lg={4} key={store.store_id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    border: selectedStores.includes(store.store_id) ? '2px solid #1976d2' : '1px solid #e0e0e0'
                                }}
                                onClick={() => handleStoreSelection(store.store_id)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {store.name}
                                        </Typography>
                                        <Chip
                                            icon={<StarIcon />}
                                            label={store.ratings}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>

                                    <Typography color="text.secondary" gutterBottom>
                                        <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        {store.address}
                                    </Typography>

                                    <Typography variant="body2">
                                        Distance: {store.distance} miles
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={selectedStores.includes(store.store_id) ? 'Selected' : 'Click to Select'}
                                            size="small"
                                            color={selectedStores.includes(store.store_id) ? 'success' : 'default'}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Price Comparison Tab */}
            <TabPanel value={tabValue} index={1}>
                {priceComparison && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Price Comparison Results</Typography>

                        {/* Store Totals Summary */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {Object.entries(priceComparison.store_totals || {}).map(([storeId, data]: [string, any]) => (
                                <Grid item xs={12} sm={6} md={4} key={storeId}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{data.store_name}</Typography>
                                            <Typography variant="h4" color="primary">
                                                {formatCurrency(data.total)}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                {data.items_available}/{shoppingList.length} items available
                                            </Typography>
                                            {data.items_missing > 0 && (
                                                <Typography color="error" variant="body2">
                                                    {data.items_missing} items missing
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Detailed Item Comparison */}
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        {nearbyStores.slice(0, 4).map(store => (
                                            <TableCell key={store.store_id} align="center">
                                                {store.name}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">Best Deal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {shoppingList.map((item) => (
                                        <TableRow key={item}>
                                            <TableCell>{item}</TableCell>
                                            {nearbyStores.slice(0, 4).map(store => {
                                                const itemData = priceComparison.items?.[item]?.[store.store_id];
                                                return (
                                                    <TableCell key={store.store_id} align="center">
                                                        {itemData ? (
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {formatCurrency(itemData.price)}
                                                                </Typography>
                                                                <Chip
                                                                    label={itemData.in_stock ? 'In Stock' : 'Out of Stock'}
                                                                    size="small"
                                                                    color={itemData.in_stock ? 'success' : 'error'}
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                N/A
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell align="center">
                                                {priceComparison.best_deals?.[item] && (
                                                    <Box>
                                                        <Typography variant="body2" color="success.main">
                                                            {formatCurrency(priceComparison.best_deals[item].price)}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {priceComparison.best_deals[item].store_name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </TabPanel>

            {/* Recommendations Tab */}
            <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Store Recommendations</Typography>

                <Grid container spacing={2}>
                    {storeRecommendations.map((recommendation) => (
                        <Grid item xs={12} md={6} key={recommendation.store_id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6">{recommendation.store_name}</Typography>
                                        <Chip
                                            label={`Score: ${recommendation.recommendation_score}`}
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>

                                    <Typography color="text.secondary" gutterBottom>
                                        <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        {recommendation.distance} miles away
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            <MoneyIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                            Total: {formatCurrency(recommendation.total_cost)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {recommendation.items_available}/{shoppingList.length} items available
                                        </Typography>
                                    </Box>

                                    {recommendation.pros && recommendation.pros.length > 0 && (
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2" color="success.main">
                                                <ThumbUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                Pros:
                                            </Typography>
                                            {recommendation.pros.map((pro: string, index: number) => (
                                                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                                    • {pro}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}

                                    {recommendation.cons && recommendation.cons.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle2" color="error.main">
                                                <ThumbDownIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                Cons:
                                            </Typography>
                                            {recommendation.cons.map((con: string, index: number) => (
                                                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                                    • {con}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Price History Tab */}
            <TabPanel value={tabValue} index={3}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Select Item</InputLabel>
                        <Select
                            value={selectedItem}
                            label="Select Item"
                            onChange={(e) => setSelectedItem(e.target.value)}
                        >
                            {shoppingList.map((item) => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={() => selectedItem && loadPriceHistory(selectedItem)}
                        disabled={!selectedItem || loading}
                    >
                        Get Price History
                    </Button>
                </Box>

                {priceHistory && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Price History: {priceHistory.item_name}
                        </Typography>

                        <Grid container spacing={2}>
                            {Object.entries(priceHistory.price_history).map(([storeId, data]: [string, any]) => (
                                <Grid item xs={12} md={6} key={storeId}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="h6">{data.store_name}</Typography>
                                                {getTrendIcon(data.price_trend)}
                                            </Box>

                                            <Typography variant="h5" color="primary" gutterBottom>
                                                {formatCurrency(data.current_price)}
                                            </Typography>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">
                                                    Trend: <Chip label={data.price_trend} size="small" />
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption">
                                                    Low: {formatCurrency(data.lowest_price)}
                                                </Typography>
                                                <Typography variant="caption">
                                                    High: {formatCurrency(data.highest_price)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </TabPanel>

            {/* Current Deals Tab */}
            <TabPanel value={tabValue} index={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Current Deals & Promotions</Typography>
                    <IconButton onClick={loadCurrentDeals} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {currentDeals.map((storeDeals) => (
                    <Accordion key={storeDeals.store_id} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <OffersIcon />
                                <Typography variant="h6">{storeDeals.store_name}</Typography>
                                <Chip
                                    label={`${storeDeals.deals_count} deals`}
                                    size="small"
                                    color="secondary"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {storeDeals.deals.map((deal: any, index: number) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" color="primary">
                                                    {deal.item_name}
                                                </Typography>
                                                <Typography color="text.secondary" gutterBottom>
                                                    {deal.category}
                                                </Typography>
                                                <Typography variant="h5">
                                                    {formatCurrency(deal.price)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    per {deal.unit}
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        label={deal.deal_type === 'clearance' ? 'Clearance' : 'Special Price'}
                                                        size="small"
                                                        color={deal.deal_type === 'clearance' ? 'warning' : 'success'}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </TabPanel>

            {/* Route Optimization Dialog */}
            <Dialog open={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <RouteIcon sx={{ mr: 1 }} />
                    Optimized Shopping Route
                </DialogTitle>
                <DialogContent>
                    {shoppingRoute && (
                        <Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Total Distance: {shoppingRoute.total_distance} miles |
                                Estimated Time: {shoppingRoute.estimated_time} minutes
                            </Alert>

                            <List>
                                {shoppingRoute.route.map((stop: any, index: number) => (
                                    <React.Fragment key={stop.store_id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {index + 1}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={stop.store_name}
                                                secondary={`${stop.address} (${stop.distance_from_previous} miles from ${index === 0 ? 'start' : 'previous stop'})`}
                                            />
                                        </ListItem>
                                        {index < shoppingRoute.route.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRouteDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Shopping Strategy Dialog */}
            <Dialog open={strategyDialogOpen} onClose={() => setStrategyDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Smart Shopping Strategy</DialogTitle>
                <DialogContent>
                    {shoppingStrategy && (
                        <Box>
                            <Alert
                                severity={shoppingStrategy.budget_status === 'within_budget' ? 'success' :
                                    shoppingStrategy.budget_status === 'close_to_budget' ? 'warning' : 'error'}
                                sx={{ mb: 2 }}
                            >
                                Budget Status: {shoppingStrategy.budget_status.replace('_', ' ')}
                                {shoppingStrategy.budget_overage && ` (Over by $${shoppingStrategy.budget_overage})`}
                                {shoppingStrategy.budget_remaining && ` (Remaining: $${shoppingStrategy.budget_remaining})`}
                            </Alert>

                            <Typography variant="h6" gutterBottom>
                                Recommended Approach: {shoppingStrategy.recommended_approach.replace('_', ' ')}
                            </Typography>

                            {shoppingStrategy.total_savings > 0 && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Potential Savings: ${shoppingStrategy.total_savings}
                                </Alert>
                            )}

                            {shoppingStrategy.shopping_plan && shoppingStrategy.shopping_plan.length > 0 && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Shopping Plan:</Typography>
                                    {shoppingStrategy.shopping_plan.map((plan: any, index: number) => (
                                        <Card key={index} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6">{plan.store_name}</Typography>
                                                <Typography color="text.secondary" gutterBottom>
                                                    {plan.address}
                                                </Typography>
                                                <Typography variant="h6" color="primary">
                                                    Store Total: {formatCurrency(plan.store_total)}
                                                </Typography>
                                                <List dense>
                                                    {plan.items.map((item: any, itemIndex: number) => (
                                                        <ListItem key={itemIndex}>
                                                            <ListItemText
                                                                primary={item.item}
                                                                secondary={formatCurrency(item.price)}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}

                            {shoppingStrategy.primary_store && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Primary Store Recommendation</Typography>
                                        <Typography variant="h5" color="primary">
                                            {shoppingStrategy.primary_store.store_name}
                                        </Typography>
                                        <Typography>
                                            Total: {formatCurrency(shoppingStrategy.primary_store.total)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStrategyDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoreIntegration;
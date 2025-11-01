import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Badge,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    TextField,
    Alert,
    Snackbar,
    Divider
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    ShoppingCart as ShoppingCartIcon,
    RestaurantMenu as MealIcon,
    MonetizationOn as BudgetIcon,
    Schedule as ExpirationIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    Settings as SettingsIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import apiService from '../services/api';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    data: any;
    created_at: string;
    read: boolean;
    dismissed: boolean;
}

interface NotificationPreferences {
    enabled: boolean;
    expiration_alerts: {
        enabled: boolean;
        advance_days: number;
        times: string[];
    };
    budget_warnings: {
        enabled: boolean;
        threshold_percentage: number;
        frequency: string;
    };
    shopping_reminders: {
        enabled: boolean;
        frequency: string;
        day: string;
        time: string;
    };
    meal_prep_reminders: {
        enabled: boolean;
        day: string;
        time: string;
    };
    quiet_hours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [tabValue, setTabValue] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
        loadPreferences();
        loadSummary();

        // Set up polling for new notifications
        const interval = setInterval(() => {
            loadNotifications();
            loadSummary();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await apiService.get('/notifications');
            if (response.data.status === 'success') {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const response = await apiService.get('/notifications/preferences');
            if (response.data.status === 'success') {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await apiService.get('/notifications/summary');
            if (response.data.status === 'success') {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error('Failed to load summary:', error);
        }
    }; const markAsRead = async (notificationId: string) => {
        try {
            await apiService.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            showSnackbar('Failed to mark notification as read', 'error');
        }
    };

    const dismissNotification = async (notificationId: string) => {
        try {
            await apiService.post(`/notifications/${notificationId}/dismiss`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            loadSummary();
        } catch (error) {
            showSnackbar('Failed to dismiss notification', 'error');
        }
    };

    const updatePreferences = async (newPreferences: NotificationPreferences) => {
        try {
            setLoading(true);
            const response = await apiService.post('/notifications/preferences', newPreferences);
            if (response.status === 'success') {
                setPreferences(newPreferences);
                showSnackbar('Preferences updated successfully', 'success');
                setSettingsOpen(false);
            }
        } catch (error) {
            showSnackbar('Failed to update preferences', 'error');
        } finally {
            setLoading(false);
        }
    };

    const clearAllNotifications = async () => {
        try {
            const dismissPromises = notifications.map(n =>
                apiService.post(`/notifications/${n.id}/dismiss`)
            );
            await Promise.all(dismissPromises);
            setNotifications([]);
            loadSummary();
            showSnackbar('All notifications cleared', 'success');
        } catch (error) {
            showSnackbar('Failed to clear notifications', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'expiration_alert':
                return <ExpirationIcon color="warning" />;
            case 'budget_warning':
                return <BudgetIcon color="error" />;
            case 'shopping_reminder':
                return <ShoppingCartIcon color="primary" />;
            case 'meal_prep_reminder':
                return <MealIcon color="success" />;
            default:
                return <NotificationsIcon />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const notificationTime = new Date(dateString);
        const diffMs = now.getTime() - notificationTime.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    if (!preferences) return <div>Loading...</div>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    <NotificationsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setSettingsOpen(true)}
                    >
                        Settings
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={clearAllNotifications}
                        disabled={notifications.length === 0}
                    >
                        Clear All
                    </Button>
                </Box>
            </Box>

            {/* Summary Cards */}
            {summary && (
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 200 }}>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                {summary.total_active}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Active Notifications
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 200 }}>
                        <CardContent>
                            <Typography variant="h6" color="error">
                                {summary.by_priority.urgent + summary.by_priority.high}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                High Priority
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 200 }}>
                        <CardContent>
                            <Typography variant="h6" color="warning.main">
                                {summary.by_type.expiration_alert || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Expiration Alerts
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 200 }}>
                        <CardContent>
                            <Typography variant="h6" color="info.main">
                                {summary.by_type.budget_warning || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Budget Warnings
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}            {/* Notifications List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Recent Notifications
                        <Badge
                            badgeContent={notifications.length}
                            color="primary"
                            sx={{ ml: 2 }}
                        >
                            <NotificationsIcon />
                        </Badge>
                    </Typography>

                    {notifications.length === 0 ? (
                        <Alert severity="info">
                            No active notifications. You're all caught up!
                        </Alert>
                    ) : (
                        <List>
                            {notifications.map((notification, index) => (
                                <React.Fragment key={notification.id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: notification.read ? 'grey.50' : 'background.paper',
                                            borderLeft: `4px solid ${notification.priority === 'urgent' ? '#f44336' :
                                                notification.priority === 'high' ? '#ff9800' :
                                                    notification.priority === 'medium' ? '#2196f3' : '#4caf50'
                                                }`
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight={notification.read ? 400 : 600}>
                                                        {notification.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={notification.priority}
                                                            size="small"
                                                            color={getPriorityColor(notification.priority) as any}
                                                        />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {formatTimeAgo(notification.created_at)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={notification.message}
                                        />
                                        <Box sx={{ ml: 2 }}>
                                            {!notification.read && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Mark as read"
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={() => dismissNotification(notification.id)}
                                                title="Dismiss"
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        enabled: e.target.checked
                                    })}
                                />
                            }
                            label="Enable all notifications"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Expiration Alerts
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.expiration_alerts.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        expiration_alerts: {
                                            ...preferences.expiration_alerts,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                            }
                            label="Enable expiration alerts"
                        />
                        <TextField
                            label="Alert days in advance"
                            type="number"
                            value={preferences.expiration_alerts.advance_days}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                expiration_alerts: {
                                    ...preferences.expiration_alerts,
                                    advance_days: parseInt(e.target.value)
                                }
                            })}
                            sx={{ ml: 2, width: 200 }}
                            size="small"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Budget Warnings
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.budget_warnings.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        budget_warnings: {
                                            ...preferences.budget_warnings,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                            }
                            label="Enable budget warnings"
                        />
                        <TextField
                            label="Warning threshold (%)"
                            type="number"
                            value={preferences.budget_warnings.threshold_percentage}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                budget_warnings: {
                                    ...preferences.budget_warnings,
                                    threshold_percentage: parseInt(e.target.value)
                                }
                            })}
                            sx={{ ml: 2, width: 200 }}
                            size="small"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Shopping Reminders
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.shopping_reminders.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        shopping_reminders: {
                                            ...preferences.shopping_reminders,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                            }
                            label="Enable shopping reminders"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Meal Prep Reminders
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.meal_prep_reminders.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        meal_prep_reminders: {
                                            ...preferences.meal_prep_reminders,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                            }
                            label="Enable meal prep reminders"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Quiet Hours
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.quiet_hours.enabled}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        quiet_hours: {
                                            ...preferences.quiet_hours,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                            }
                            label="Enable quiet hours"
                        />
                        <TextField
                            label="Start time"
                            type="time"
                            value={preferences.quiet_hours.start}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                quiet_hours: {
                                    ...preferences.quiet_hours,
                                    start: e.target.value
                                }
                            })}
                            sx={{ ml: 2, mr: 2, width: 150 }}
                            size="small"
                        />
                        <TextField
                            label="End time"
                            type="time"
                            value={preferences.quiet_hours.end}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                quiet_hours: {
                                    ...preferences.quiet_hours,
                                    end: e.target.value
                                }
                            })}
                            sx={{ width: 150 }}
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => updatePreferences(preferences)}
                        variant="contained"
                        disabled={loading}
                    >
                        Save Settings
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Notifications;
import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    ShoppingCart,
    Dashboard as DashboardIcon,
    Lightbulb,
    Schedule,
    Analytics,
    History,
    AccountBalanceWallet,
    Restaurant,
    Notifications,
    Store,
    Psychology,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/shopping-list', label: 'Shopping List', icon: <ShoppingCart /> },
        { path: '/suggestions', label: 'Suggestions', icon: <Lightbulb /> },
        { path: '/ai-recommendations', label: 'AI Recommendations', icon: <Psychology /> },
        { path: '/store-integration', label: 'Store Integration', icon: <Store /> },
        { path: '/expiration', label: 'Expiration', icon: <Schedule /> },
        { path: '/meal-planning', label: 'Meal Planning', icon: <Restaurant /> },
        { path: '/budget', label: 'Budget', icon: <AccountBalanceWallet /> },
        { path: '/notifications', label: 'Notifications', icon: <Notifications /> },
        { path: '/analytics', label: 'Analytics', icon: <Analytics /> },
        { path: '/purchase-history', label: 'History', icon: <History /> },
    ];

    return (
        <AppBar
            position="static"
            sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    sx={{ mr: 2 }}
                >
                    <ShoppingCart />
                </IconButton>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #FFFFFF 30%, #E8F5E8 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Smart Grocery Assistant
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            color="inherit"
                            startIcon={item.icon}
                            onClick={() => navigate(item.path)}
                            sx={{
                                mx: 0.5,
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                backgroundColor: location.pathname === item.path
                                    ? 'rgba(255, 255, 255, 0.2)'
                                    : 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                transition: 'all 0.3s ease',
                                fontWeight: location.pathname === item.path ? 600 : 400,
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
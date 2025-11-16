import React, { useState } from 'react';
import {
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    useTheme,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
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
    LocalHospital,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon />, section: 'main' },
        { path: '/shopping-list', label: 'Shopping List', icon: <ShoppingCart />, section: 'shopping' },
        { path: '/suggestions', label: 'Suggestions', icon: <Lightbulb />, section: 'shopping' },
        { path: '/ai-recommendations', label: 'AI Recommendations', icon: <Psychology />, section: 'ai' },
        { path: '/store-integration', label: 'Store Integration', icon: <Store />, section: 'ai' },
        { path: '/nutrition', label: 'Nutrition', icon: <LocalHospital />, section: 'health' },
        { path: '/budget-management', label: 'Budget Management', icon: <AccountBalanceWallet />, section: 'finance' },
        { path: '/expiration', label: 'Expiration', icon: <Schedule />, section: 'management' },
        { path: '/meal-planning', label: 'Meal Planning', icon: <Restaurant />, section: 'health' },
        { path: '/notifications', label: 'Notifications', icon: <Notifications />, section: 'main' },
        { path: '/analytics', label: 'Analytics', icon: <Analytics />, section: 'insights' },
        { path: '/purchase-history', label: 'History', icon: <History />, section: 'insights' },
    ];

    const sections = {
        main: { label: 'Main', items: navItems.filter(item => item.section === 'main') },
        shopping: { label: 'Shopping', items: navItems.filter(item => item.section === 'shopping') },
        ai: { label: 'AI & Smart Features', items: navItems.filter(item => item.section === 'ai') },
        health: { label: 'Health & Nutrition', items: navItems.filter(item => item.section === 'health') },
        finance: { label: 'Finance', items: navItems.filter(item => item.section === 'finance') },
        management: { label: 'Management', items: navItems.filter(item => item.section === 'management') },
        insights: { label: 'Analytics & Insights', items: navItems.filter(item => item.section === 'insights') },
    };

    const handleSectionToggle = (sectionKey: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (window.innerWidth < 1200) {
            onClose();
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart sx={{ fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        Smart Grocery Assistant
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'white', display: { xs: 'block', lg: 'none' } }}
                >
                    <ChevronLeftIcon />
                </IconButton>
            </Box>

            <Divider />

            {/* Navigation Sections */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                {Object.entries(sections).map(([sectionKey, section]) => (
                    <Box key={sectionKey}>
                        <ListItemButton
                            onClick={() => handleSectionToggle(sectionKey)}
                            sx={{
                                px: 2,
                                py: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <ListItemText
                                primary={section.label}
                                primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: theme.palette.text.secondary,
                                }}
                            />
                            {expandedSections[sectionKey] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        
                        <Collapse in={expandedSections[sectionKey]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <ListItemButton
                                            key={item.path}
                                            onClick={() => handleNavigation(item.path)}
                                            sx={{
                                                pl: 4,
                                                py: 1.5,
                                                backgroundColor: isActive
                                                    ? `${theme.palette.primary.main}15`
                                                    : 'transparent',
                                                borderRight: isActive
                                                    ? `3px solid ${theme.palette.primary.main}`
                                                    : '3px solid transparent',
                                                '&:hover': {
                                                    backgroundColor: `${theme.palette.primary.main}08`,
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: isActive
                                                        ? theme.palette.primary.main
                                                        : theme.palette.text.secondary,
                                                    minWidth: 40,
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActive ? 600 : 400,
                                                    color: isActive
                                                        ? theme.palette.primary.main
                                                        : theme.palette.text.primary,
                                                }}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Collapse>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Smart Grocery Shopping Assistant
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Version 2.0
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Drawer
            variant="persistent"
            anchor="left"
            open={open}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    border: 'none',
                    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

interface NavbarProps {
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onSidebarToggle }) => {
    const theme = useTheme();

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(sidebarOpen && {
                        width: `calc(100% - ${drawerWidth}px)`,
                        marginLeft: `${drawerWidth}px`,
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={onSidebarToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #FFFFFF 30%, #E8F5E8 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Smart Grocery Assistant
                    </Typography>
                </Toolbar>
            </AppBar>
            <Sidebar open={sidebarOpen} onClose={() => onSidebarToggle()} />
        </>
    );
};

export default Navbar;
export { drawerWidth };
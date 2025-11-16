import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar, { drawerWidth } from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ShoppingList from './pages/ShoppingList';
import Suggestions from './pages/Suggestions';
import Expiration from './pages/Expiration';
import MealPlanning from './pages/MealPlanning';
import Budget from './pages/Budget';
import EnhancedAnalytics from './pages/EnhancedAnalytics';
import Notifications from './pages/Notifications';
import StoreIntegration from './pages/StoreIntegration';
import AIRecommendations from './pages/AIRecommendations';
import Analytics from './pages/Analytics';
import PurchaseHistory from './pages/PurchaseHistory';
import Nutrition from './pages/Nutrition';
import BudgetManagement from './pages/BudgetManagement';
import SmartRecipe from './pages/SmartRecipe';

// Create a light, colorful theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // Fresh green
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FF9800', // Warm orange
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#F8FFF8', // Very light green tint
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: 'background.default',
              transition: (theme) =>
                theme.transitions.create('margin', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
              ...(sidebarOpen && {
                transition: (theme) =>
                  theme.transitions.create('margin', {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                marginLeft: 0,
              }),
            }}
          >
            {/* Toolbar spacer */}
            <Box sx={{ minHeight: '64px' }} />

            <Box sx={{ p: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/expiration" element={<Expiration />} />
                <Route path="/meal-planning" element={<MealPlanning />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/store-integration" element={<StoreIntegration />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/budget-management" element={<BudgetManagement />} />
                <Route path="/ai-recommendations" element={<AIRecommendations />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/purchase-history" element={<PurchaseHistory />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

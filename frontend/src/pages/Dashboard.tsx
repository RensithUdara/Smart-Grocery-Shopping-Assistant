import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  Warning,
  Lightbulb,
  Refresh,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { shoppingListApi, analyticsApi, expirationApi, suggestionsApi } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    listSummary: null as any,
    analytics: null as any,
    expiringItems: [] as any[],
    suggestions: [] as any[],
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listSummary, analytics, expiringItems, suggestions] = await Promise.all([
        shoppingListApi.getSummary().catch(() => ({ data: null })),
        analyticsApi.getAnalytics().catch(() => ({ data: null })),
        expirationApi.checkExpiring(3).catch(() => ({ data: {} })),
        suggestionsApi.getSuggestions().catch(() => ({ data: [] })),
      ]);

      setDashboardData({
        listSummary: listSummary.data,
        analytics: analytics.data,
        expiringItems: Object.values(expiringItems.data || {}).flat().slice(0, 5),
        suggestions: suggestions.data?.slice(0, 5) || [],
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-2px)' } : {},
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: '3rem', opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          sx={{ borderRadius: 3 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Items in List"
          value={dashboardData.listSummary?.total_items || 0}
          icon={<ShoppingCart />}
          color="#4CAF50"
          onClick={() => navigate('/shopping-list')}
        />
        <StatCard
          title="Total Spent"
          value={`$${dashboardData.analytics?.total_spent?.toFixed(2) || '0.00'}`}
          icon={<TrendingUp />}
          color="#2196F3"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Expiring Soon"
          value={dashboardData.expiringItems.length}
          icon={<Warning />}
          color="#FF9800"
          onClick={() => navigate('/expiration')}
        />
        <StatCard
          title="Suggestions"
          value={dashboardData.suggestions.length}
          icon={<Lightbulb />}
          color="#9C27B0"
          onClick={() => navigate('/suggestions')}
        />
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        {/* Quick Actions */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
                onClick={() => navigate('/shopping-list')}
              >
                Add Items to Shopping List
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
                onClick={() => navigate('/suggestions')}
              >
                Get Smart Suggestions
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
                onClick={() => navigate('/expiration')}
              >
                Check Expiring Items
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Suggestions */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" />
                Smart Suggestions
              </Typography>
              <IconButton onClick={() => navigate('/suggestions')} size="small">
                <Refresh />
              </IconButton>
            </Box>
            {dashboardData.suggestions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dashboardData.suggestions.map((suggestion: any, index: number) => (
                  <Chip
                    key={index}
                    label={`${suggestion.name} - ${suggestion.reason}`}
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      justifyContent: 'flex-start', 
                      borderRadius: 2,
                      '& .MuiChip-label': { 
                        display: 'block',
                        whiteSpace: 'normal',
                        textAlign: 'left',
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No suggestions available. Add items to your shopping list to get personalized recommendations.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Expiring Items Alert */}
      {dashboardData.expiringItems.length > 0 && (
        <Card sx={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', border: '1px solid #FFB74D' }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F57C00' }}>
              <Warning />
              Items Expiring Soon
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
              The following items will expire within the next 3 days:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dashboardData.expiringItems.map((item: any, index: number) => (
                <Chip
                  key={index}
                  label={item.name}
                  color="warning"
                  variant="filled"
                  size="small"
                />
              ))}
            </Box>
            <Button
              variant="contained"
              color="warning"
              sx={{ mt: 2 }}
              onClick={() => navigate('/expiration')}
            >
              View All Expiring Items
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;
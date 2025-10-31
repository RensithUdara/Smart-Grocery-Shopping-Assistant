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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Lightbulb,
  Refresh,
  Add,
  TrendingUp,
  ExpandMore,
  Psychology,
  AutoAwesome,
} from '@mui/icons-material';
import { suggestionsApi, shoppingListApi, SuggestionItem } from '../services/api';

const Suggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [suggestionsResponse, patternsResponse] = await Promise.all([
        suggestionsApi.getSuggestions().catch(() => ({ data: [] })),
        suggestionsApi.getPatterns().catch(() => ({ data: null })),
      ]);
      setSuggestions(suggestionsResponse.data || []);
      setPatterns(patternsResponse.data);
    } catch (err) {
      setError('Failed to load suggestions');
      console.error('Suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestions = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await suggestionsApi.refreshSuggestions();
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      setError('Failed to refresh suggestions');
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const addToShoppingList = async (suggestion: SuggestionItem) => {
    try {
      await shoppingListApi.addItem({
        name: suggestion.name,
        category: suggestion.category,
        quantity: 1,
        unit: 'pieces',
        expiration_days: 7,
        price: 0,
        is_organic: false,
      });
      // Remove the suggestion from the list after adding
      setSuggestions(suggestions.filter(s => s !== suggestion));
    } catch (err) {
      setError('Failed to add item to shopping list');
      console.error('Add to list error:', err);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return '#F44336'; // High priority - red
    if (priority >= 5) return '#FF9800'; // Medium priority - orange
    return '#4CAF50'; // Low priority - green
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Low';
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
          Smart Suggestions
        </Typography>
        <Button
          variant="contained"
          startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          onClick={refreshSuggestions}
          disabled={refreshing}
        >
          Refresh Suggestions
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Suggestions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            AI-Powered Recommendations
          </Typography>
          
          {suggestions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Lightbulb sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No suggestions available
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Add items to your shopping list and purchase history to get personalized recommendations
              </Typography>
            </Box>
          ) : (
            <List>
              {suggestions.map((suggestion, index) => (
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
                            {suggestion.name}
                          </Typography>
                          <Chip
                            label={suggestion.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${getPriorityLabel(suggestion.priority)} Priority`}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(suggestion.priority),
                              color: 'white',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          <strong>Reason:</strong> {suggestion.reason}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => addToShoppingList(suggestion)}
                        sx={{ borderRadius: 2 }}
                      >
                        Add to List
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < suggestions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Shopping Patterns Analysis */}
      {patterns && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              Shopping Patterns Analysis
            </Typography>

            {patterns.frequent_categories && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Frequent Categories
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(patterns.frequent_categories).map(([category, count]: [string, any]) => (
                      <Chip
                        key={category}
                        label={`${category} (${count})`}
                        variant="outlined"
                        color="primary"
                        icon={<TrendingUp />}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {patterns.seasonal_trends && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Seasonal Trends
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">
                    Based on your shopping history, here are seasonal patterns we've identified:
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(patterns.seasonal_trends).map(([season, items]: [string, any]) => (
                      <Box key={season} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                          {season}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {Array.isArray(items) ? items.map((item: string, index: number) => (
                            <Chip key={index} label={item} size="small" variant="outlined" />
                          )) : (
                            <Typography variant="body2" color="textSecondary">
                              No seasonal data available
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {patterns.buying_frequency && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Buying Frequency
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Items you frequently purchase:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(patterns.buying_frequency).map(([item, frequency]: [string, any]) => (
                      <Chip
                        key={item}
                        label={`${item} (${frequency}x)`}
                        variant="filled"
                        color="secondary"
                        size="small"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {!patterns.frequent_categories && !patterns.seasonal_trends && !patterns.buying_frequency && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Psychology sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Not enough data to analyze patterns
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Keep shopping and adding to your purchase history to get detailed insights!
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Suggestions;
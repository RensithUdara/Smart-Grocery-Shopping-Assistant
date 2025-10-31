import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Warning,
  Schedule,
  Restaurant,
  ExpandMore,
  Refresh,
} from '@mui/icons-material';
import { expirationApi } from '../services/api';

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
      id={`expiration-tabpanel-${index}`}
      aria-labelledby={`expiration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Expiration: React.FC = () => {
  const [expiringItems, setExpiringItems] = useState<any>({});
  const [reminders, setReminders] = useState<any[]>([]);
  const [mealSuggestions, setMealSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [daysAhead, setDaysAhead] = useState(7);

  const loadExpirationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [expiringResponse, remindersResponse, mealResponse] = await Promise.all([
        expirationApi.checkExpiring(daysAhead).catch(() => ({ data: {} })),
        expirationApi.getReminders().catch(() => ({ data: [] })),
        expirationApi.getMealSuggestions().catch(() => ({ data: [] })),
      ]);
      setExpiringItems(expiringResponse.data || {});
      setReminders(remindersResponse.data || []);
      setMealSuggestions(mealResponse.data || []);
    } catch (err) {
      setError('Failed to load expiration data');
      console.error('Expiration error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpirationData();
  }, [daysAhead]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 1) return '#F44336'; // Critical - red
    if (daysLeft <= 3) return '#FF9800'; // Warning - orange
    if (daysLeft <= 7) return '#FFC107'; // Caution - yellow
    return '#4CAF50'; // Good - green
  };

  const getUrgencyLabel = (daysLeft: number) => {
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return 'Expires Today';
    if (daysLeft <= 3) return 'Critical';
    if (daysLeft <= 7) return 'Soon';
    return 'Good';
  };

  const calculateDaysLeft = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  const allExpiringItems = Object.values(expiringItems).flat();
  const totalExpiringCount = allExpiringItems.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Expiration Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Days Ahead</InputLabel>
            <Select
              value={daysAhead}
              label="Days Ahead"
              onChange={(e) => setDaysAhead(e.target.value as number)}
            >
              <MenuItem value={3}>3 days</MenuItem>
              <MenuItem value={7}>1 week</MenuItem>
              <MenuItem value={14}>2 weeks</MenuItem>
              <MenuItem value={30}>1 month</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadExpirationData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Alert */}
      {totalExpiringCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
            border: '1px solid #FFB74D'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {totalExpiringCount} item{totalExpiringCount > 1 ? 's' : ''} expiring within {daysAhead} days
          </Typography>
          <Typography variant="body2">
            Review the items below and consider using them soon or planning meals around them.
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={`Expiring Items (${totalExpiringCount})`}
            icon={<Warning />}
            iconPosition="start"
          />
          <Tab 
            label={`Reminders (${reminders.length})`}
            icon={<Schedule />}
            iconPosition="start"
          />
          <Tab 
            label={`Meal Ideas (${mealSuggestions.length})`}
            icon={<Restaurant />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Expiring Items Tab */}
      <TabPanel value={tabValue} index={0}>
        {Object.keys(expiringItems).length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  All Good!
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  No items are expiring within the next {daysAhead} days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          Object.entries(expiringItems).map(([category, items]: [string, any]) => (
            <Accordion key={category} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{
                  background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                  '&:hover': { backgroundColor: '#F3E5F5' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                  <Chip 
                    label={`${items.length} items`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {items.map((item: any, index: number) => {
                    const daysLeft = item.expiration_date ? 
                      calculateDaysLeft(item.expiration_date) : 
                      item.expiration_days || 0;
                    
                    return (
                      <React.Fragment key={index}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Warning sx={{ color: getUrgencyColor(daysLeft) }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Chip
                                  label={getUrgencyLabel(daysLeft)}
                                  size="small"
                                  sx={{
                                    backgroundColor: getUrgencyColor(daysLeft),
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                {daysLeft > 0 ? (
                                  `Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
                                ) : daysLeft === 0 ? (
                                  'Expires today'
                                ) : (
                                  `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''} ago`
                                )}
                                {item.quantity && ` • Quantity: ${item.quantity}`}
                                {item.price && ` • $${item.price.toFixed(2)}`}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < items.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </TabPanel>

      {/* Reminders Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            {reminders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No reminders set
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Reminders will appear here when items are close to expiring
                </Typography>
              </Box>
            ) : (
              <List>
                {reminders.map((reminder, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={reminder.message || 'Expiration reminder'}
                        secondary={reminder.priority ? `Priority: ${reminder.priority}` : ''}
                      />
                    </ListItem>
                    {index < reminders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Meal Suggestions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Restaurant color="primary" />
              Meal Ideas Using Expiring Items
            </Typography>
            
            {mealSuggestions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Restaurant sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No meal suggestions available
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Meal suggestions will appear here based on your expiring items
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mealSuggestions.map((suggestion, index) => (
                  <Card 
                    key={index} 
                    variant="outlined" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
                      border: '1px solid #C8E6C9'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="primary.main" gutterBottom>
                        {suggestion.meal_name || `Meal Idea ${index + 1}`}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {suggestion.description || suggestion.suggestion}
                      </Typography>
                      {suggestion.ingredients && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Ingredients from expiring items:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {suggestion.ingredients.map((ingredient: string, idx: number) => (
                              <Chip 
                                key={idx} 
                                label={ingredient} 
                                size="small" 
                                color="success" 
                                variant="outlined" 
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default Expiration;
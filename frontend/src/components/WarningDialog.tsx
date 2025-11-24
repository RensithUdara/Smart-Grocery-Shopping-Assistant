import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { GroceryItem } from '../services/api';
import { 
  capitalizeWords, 
  formatCategory, 
  getCategoryColor,
  daysSince,
  getFrequencyMessage,
  formatQuantity,
  formatPrice
} from '../utils/uiHelpers';

interface WarningDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: GroceryItem | null;
  warningMessage: string;
  daysSinceLastPurchase: number;
}

const WarningDialog: React.FC<WarningDialogProps> = ({
  open,
  onClose,
  onConfirm,
  item,
  warningMessage,
  daysSinceLastPurchase,
}) => {
  if (!item) return null;

  const categoryColor = getCategoryColor(item.category);
  const frequencyMessage = getFrequencyMessage(item.purchase_frequency);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '50%',
                backgroundColor: 'warning.light',
                color: 'warning.dark',
              }}
            >
              <WarningIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Recent Purchase Detected
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Item Details Card */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'grey.50',
            border: `1px solid ${categoryColor}20`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CartIcon sx={{ color: categoryColor, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {capitalizeWords(item.name)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={formatCategory(item.category)} 
                  size="small"
                  sx={{ 
                    backgroundColor: categoryColor,
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatQuantity(item.quantity, item.unit)}
                </Typography>
                {item.price > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    • {formatPrice(item.price)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Warning Message */}
        <Alert 
          severity="warning" 
          icon={<HistoryIcon />}
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'warning.dark' }}>
            ⚠️ {warningMessage}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you need this item again so soon?
          </Typography>
          
          {/* Additional Info */}
          <Box sx={{ mt: 2 }}>
            {daysSinceLastPurchase <= 1 ? (
              <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
                <strong>📅 Last purchased:</strong> {daysSinceLastPurchase === 0 ? 'Today' : 'Yesterday'}
              </Typography>
            ) : (
              <Typography variant="body2" color="warning.dark">
                <strong>Last purchased:</strong> {daysSinceLastPurchase} days ago
              </Typography>
            )}
            
            {frequencyMessage && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Purchase pattern:</strong> {frequencyMessage}
              </Typography>
            )}
          </Box>
        </Alert>

        {/* Helpful Suggestions */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'info.light', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main',
          '& *': { color: 'info.dark !important' }
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            💡 Smart Suggestions:
          </Typography>
          <Typography variant="body2">
            • Check if you still have this item at home
          </Typography>
          <Typography variant="body2">
            • Consider if you really need the same quantity
          </Typography>
          <Typography variant="body2">
            • This helps prevent food waste and saves money
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color="warning"
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
          }}
        >
          Add Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
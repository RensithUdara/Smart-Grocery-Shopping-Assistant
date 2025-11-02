import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Chip, Grid, Alert } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import apiService from '../services/api';

const Nutrition: React.FC = () => {
    const [itemsText, setItemsText] = useState('banana,1\nmilk,1');
    const [analysis, setAnalysis] = useState<any>(null);
    const [allergiesText, setAllergiesText] = useState('');
    const [allergenResult, setAllergenResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const parseItems = (text: string) => {
        return text.split('\n').map(line => {
            const parts = line.split(',').map(p => p.trim());
            return { name: parts[0], servings: parts[1] ? Number(parts[1]) : 1 };
        });
    };

    const runAnalysis = async () => {
        const items = parseItems(itemsText);
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/analyze', { items });
            setAnalysis(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const runAllergenCheck = async () => {
        const items = parseItems(itemsText).map(i => i.name);
        const allergies = allergiesText.split(',').map(s => s.trim()).filter(Boolean);
        setLoading(true);
        try {
            const res = await apiService.post('/api/nutrition/check-allergens', { items, allergies });
            setAllergenResult(res.data.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon /> Nutrition & Health Intelligence
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Analyze Meal / Recipe</Typography>
                            <Typography variant="caption" color="text.secondary">Enter one item per line: name,servings</Typography>
                            <TextField
                                multiline
                                minRows={4}
                                fullWidth
                                sx={{ mt: 1, mb: 1 }}
                                value={itemsText}
                                onChange={(e) => setItemsText(e.target.value)}
                            />
                            <Button variant="contained" onClick={runAnalysis} disabled={loading}>Analyze</Button>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Allergen Checker</Typography>
                            <Typography variant="caption" color="text.secondary">Comma-separated allergies (e.g., milk,egg)</Typography>
                            <TextField fullWidth sx={{ mt: 1, mb: 1 }} value={allergiesText} onChange={(e) => setAllergiesText(e.target.value)} />
                            <Button variant="outlined" onClick={runAllergenCheck} disabled={loading}>Check Allergens</Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
                {analysis && (
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">Nutrition Summary</Typography>
                            <Typography>Calories: {analysis.summary.calories}</Typography>
                            <Typography>Protein: {analysis.summary.protein_g} g</Typography>
                            <Typography>Fat: {analysis.summary.fat_g} g</Typography>
                            <Typography>Carbs: {analysis.summary.carbs_g} g</Typography>
                            <Typography>Fiber: {analysis.summary.fiber_g} g</Typography>
                            <Typography>Sugar: {analysis.summary.sugar_g} g</Typography>
                            <Chip label={`Nutrition Score: ${analysis.nutrition_score}`} color="primary" sx={{ mt: 1 }} />
                        </CardContent>
                    </Card>
                )}

                {allergenResult && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Allergen Check</Typography>
                            {allergenResult.safe ? (
                                <Alert severity="success">No allergen matches found</Alert>
                            ) : (
                                <Alert severity="warning">Found possible matches: {JSON.stringify(allergenResult.issues)}</Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default Nutrition;

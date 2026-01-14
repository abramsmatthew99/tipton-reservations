import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AlertColor } from '@mui/material';
import {
    Box, Card, Typography, Button, Avatar, Divider, Container,
    TextField, Alert, Snackbar, CircularProgress, Grid, Paper, Chip, Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: user?.sub || '' 
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: AlertColor; text: string; open: boolean }>({
        type: 'success', text: '', open: false
    });

    useEffect(() => {
        if (user?.sub) {
            const token = localStorage.getItem('token');
            axios.get(`${baseURL}/users/email/${user.sub}`, {headers: { Authorization: `Bearer ${token}`}})
                .then(response => {
                    setProfileData(prev => ({
                        ...prev,
                        id: response.data.id,
                        firstName: response.data.firstName || '',
                        lastName: response.data.lastName || '',
                        phoneNumber: response.data.phoneNumber || '',
                        email: response.data.email 
                    }));
                })
                .catch(err => console.error("Failed to load profile", err))
                .finally(() => setLoading(false));
        }
    }, [user, baseURL]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if(!profileData.id) {
             setMessage({ open: true, type: 'error', text: 'Cannot update: User ID missing.' });
             return;
        }
        const token = localStorage.getItem('token');
        axios.put(`${baseURL}/users/${profileData.id}`, profileData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setProfileData(prev => ({ ...prev, ...response.data }));
            setMessage({ open: true, type: 'success', text: 'Profile updated successfully!' });
        })
        .catch(() => setMessage({ open: true, type: 'error', text: 'Failed to update profile.' }));
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={4}>
                
                {/* LEFT COLUMN: IDENTITY CARD */}
                {/* UPDATED: Removed 'item' prop, used 'size' prop for MUI v6 compatibility */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', borderRadius: 2, position: 'relative', overflow: 'visible' }}>
                        {/* Decorative Header */}
                        <Box sx={{ bgcolor: 'primary.main', height: 100, borderRadius: '8px 8px 0 0' }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6, px: 3, pb: 4 }}>
                            <Avatar sx={{ width: 100, height: 100, border: '4px solid white', bgcolor: 'secondary.main', fontSize: 50 }}>
                                {profileData.firstName?.[0] || <PersonIcon fontSize="inherit"/>}
                            </Avatar>
                            
                            <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                                {profileData.firstName} {profileData.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {profileData.email}
                            </Typography>

                            <Chip 
                                icon={<StarIcon />} 
                                label="Tipton Rewards Member" 
                                color="secondary" 
                                size="small" 
                                sx={{ mt: 1, fontWeight: 600 }} 
                            />

                            <Divider sx={{ width: '100%', my: 3 }} />

                            <Stack spacing={2} width="100%">
                                <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth>
                                    Sign Out
                                </Button>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* RIGHT COLUMN: EDIT FORM */}
                {/* UPDATED: Removed 'item' prop, used 'size' prop */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <BadgeIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Account Details
                            </Typography>
                        </Box>

                        <Box component="form" noValidate autoComplete="off">
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="First Name"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Last Name"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Email Address"
                                        value={profileData.email}
                                        fullWidth
                                        disabled
                                        helperText="To change your email, please contact support."
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Phone Number"
                                        name="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    sx={{ minWidth: 150 }}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            <Snackbar 
                open={message.open} 
                autoHideDuration={6000} 
                onClose={() => setMessage(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>
        </Container>
    );
}
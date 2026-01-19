import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AlertColor } from '@mui/material';
import {
    Box, Card, Typography, Button, Avatar, Divider, Container,
    TextField, Alert, Snackbar, CircularProgress, Grid, Paper, Chip, Stack,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
        email: user?.sub || '',
        rewardsPoints: 0 // New field for points
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: AlertColor; text: string; open: boolean }>({
        type: 'success', text: '', open: false
    });

    // State for the Redemption Popup
    const [redeemDialog, setRedeemDialog] = useState({ open: false, code: '' });
    const [redeemLoading, setRedeemLoading] = useState(false);

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
                        email: response.data.email,
                        rewardsPoints: response.data.rewardsPoints || 0 // Load points from backend
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
        // We exclude rewardsPoints from the PUT body to avoid accidental overwrites
        const { rewardsPoints, ...updateData } = profileData;
        
        axios.put(`${baseURL}/users/${profileData.id}`, updateData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            // Preserve points in local state, update other fields
            setProfileData(prev => ({ ...prev, ...response.data, rewardsPoints: prev.rewardsPoints }));
            setMessage({ open: true, type: 'success', text: 'Profile updated successfully!' });
        })
        .catch(() => setMessage({ open: true, type: 'error', text: 'Failed to update profile.' }));
    };

    const handleRedeemPoints = () => {
        if (profileData.rewardsPoints < 100) return;
        
        setRedeemLoading(true);
        const token = localStorage.getItem('token');

        axios.post(`${baseURL}/api/rewards/redeem`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            // Backend returns { code: "REWARD-XYZ", remainingPoints: 50 }
            setRedeemDialog({ open: true, code: response.data.code });
            
            // Update local points balance immediately
            setProfileData(prev => ({ 
                ...prev, 
                rewardsPoints: response.data.remainingPoints 
            }));
            
            setMessage({ open: true, type: 'success', text: 'Points redeemed successfully!' });
        })
        .catch(err => {
            const errorMsg = err.response?.data?.message || 'Failed to redeem points.';
            setMessage({ open: true, type: 'error', text: errorMsg });
        })
        .finally(() => setRedeemLoading(false));
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(redeemDialog.code);
        setMessage({ open: true, type: 'info', text: 'Code copied to clipboard!' });
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={4}>
                
                {/* LEFT COLUMN: IDENTITY CARD */}
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
                                color="warning" 
                                size="small" 
                                sx={{ mt: 1, fontWeight: 600 }} 
                            />

                            <Divider sx={{ width: '100%', my: 3 }} />

                            {/* --- NEW REWARDS SECTION --- */}
                            <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
                                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                    Rewards Balance
                                </Typography>
                                <Typography variant="h3" color="primary.main" fontWeight={800}>
                                    {profileData.rewardsPoints}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    points available
                                </Typography>

                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    startIcon={<CardGiftcardIcon />}
                                    fullWidth
                                    disabled={profileData.rewardsPoints < 100 || redeemLoading}
                                    onClick={handleRedeemPoints}
                                >
                                    {redeemLoading ? "Processing..." : "Redeem 100 Points ($100 Off)"}
                                </Button>
                                {profileData.rewardsPoints < 100 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Earn {100 - profileData.rewardsPoints} more points to redeem a reward.
                                    </Typography>
                                )}
                            </Box>
                            {/* --------------------------- */}

                            <Divider sx={{ width: '100%', mb: 3 }} />

                            <Stack spacing={2} width="100%">
                                <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth>
                                    Sign Out
                                </Button>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* RIGHT COLUMN: EDIT FORM */}
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
            
            {/* SUCCESS DIALOG FOR COUPON CODE */}
            <Dialog open={redeemDialog.open} onClose={() => setRedeemDialog({ ...redeemDialog, open: false })}>
                <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                    <CardGiftcardIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <br />
                    Reward Redeemed!
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
                    <DialogContentText sx={{ mb: 3 }}>
                        You've successfully traded 100 points for a $100 discount coupon.
                        Use this code at checkout for your next booking!
                    </DialogContentText>
                    
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 2, 
                            bgcolor: 'grey.100', 
                            border: '1px dashed', 
                            borderColor: 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2
                        }}
                    >
                        <Typography variant="h5" component="code" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
                            {redeemDialog.code}
                        </Typography>
                        <IconButton onClick={copyToClipboard} color="primary">
                            <ContentCopyIcon />
                        </IconButton>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button 
                        variant="contained" 
                        onClick={() => setRedeemDialog({ ...redeemDialog, open: false })}
                    >
                        Got it, thanks!
                    </Button>
                </DialogActions>
            </Dialog>

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
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AlertColor } from '@mui/material';
import {
    Box, Card, CardContent, Typography, Button, Avatar, Divider, Container,
    TextField, Alert, Snackbar, CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
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
        type: 'success',
        text: '',
        open: false
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
                .catch(err => {
                    console.error("Failed to load profile", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if(!profileData.id) {
             setMessage({ open: true, type: 'error', text: 'Cannot update: User ID missing.' });
             return;
        }

        const token = localStorage.getItem('token');

        axios.put(`${baseURL}/users/${profileData.id}`, profileData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setProfileData(prev => ({
                    ...prev,
                    ...response.data,
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phoneNumber: response.data.phoneNumber || ''
                }));
                setMessage({ open: true, type: 'success', text: 'Profile updated successfully!' });
            })
            .catch(err => {
                console.error(err);
                setMessage({ open: true, type: 'error', text: 'Failed to update profile.' });
            });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%', boxShadow: 3 }}>
                    <Box sx={{ 
                        p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        bgcolor: 'primary.main', color: 'white' 
                    }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', mb: 2 }}>
                            <PersonIcon sx={{ fontSize: 50 }} />
                        </Avatar>
                        <Typography variant="h5">
                            {profileData.firstName ? `${profileData.firstName} ${profileData.lastName}` : 'Complete Your Profile'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {user?.roles?.map(role => role.replace('ROLE_', '').toLowerCase()).join(', ') || "Customer"}
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            
                            <TextField
                                label="Email Address"
                                value={profileData.email}
                                fullWidth
                                disabled
                                variant="filled"
                                helperText="Email cannot be changed"
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    fullWidth
                                    placeholder="Jane"
                                    InputLabelProps={{ shrink: true }} 
                                />
                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    fullWidth
                                    placeholder="Doe"
                                    InputLabelProps={{ shrink: true }} 
                                />
                            </Box>

                            <TextField
                                label="Phone Number"
                                name="phoneNumber"
                                value={profileData.phoneNumber}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="(555) 123-4567"
                                InputLabelProps={{ shrink: true }} 
                            />

                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<SaveIcon />}
                                fullWidth
                                onClick={handleSave}
                                sx={{ mt: 1 }}
                            >
                                Save Changes
                            </Button>

                            <Divider sx={{ my: 1 }} />

                            <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<LogoutIcon />}
                                fullWidth
                                onClick={handleLogout}
                            >
                                Sign Out
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            
            <Snackbar 
                open={message.open} 
                autoHideDuration={6000} 
                onClose={() => setMessage(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
}

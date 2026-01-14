import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Card,
    CardContent,
    Alert,
    Avatar,
    Grid,
    Link
} from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { authApi } from '../apis/auth';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await authApi.register(formData);
            // Redirect to login with a success state (optional, or just navigate)
            navigate('/login');
        } catch (err: any) {
            console.error("Registration Error", err);
            // Check if backend sent a specific error message
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <AppRegistrationIcon />
                </Avatar>
                
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>

                <Card sx={{ mt: 3, width: '100%', boxShadow: 3 }}>
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Grid container spacing={2}>
                                <Grid size={{xs:12, sm:6}}>
                                    <TextField
                                        name="firstName"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        autoFocus
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{xs:12, sm:6}}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{xs:12}}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{xs:12}}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="phoneNumber"
                                        label="Phone Number"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{xs:12}}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                            
                            <Box textAlign="center">
                                <Link 
                                    component="button" 
                                    variant="body2" 
                                    onClick={() => navigate('/login')}
                                >
                                    Already have an account? Sign In
                                </Link>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
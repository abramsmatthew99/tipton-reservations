import { useAuth } from '../../context/AuthContext';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Avatar, 
    Divider,
    Container 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Go back to landing/login page
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%', boxShadow: 3 }}>
                    <Box sx={{ 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        bgcolor: 'primary.main', 
                        color: 'white' 
                    }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', mb: 2 }}>
                            <PersonIcon sx={{ fontSize: 50 }} />
                        </Avatar>
                        <Typography variant="h5" component="div">
                            My Profile
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email Address
                            </Typography>
                            <Typography variant="h6">
                                {user?.sub || "Unknown User"}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Account Type
                            </Typography>
                            {/* Display roles  */}
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {user?.roles?.map(role => role.replace('ROLE_', '').toLowerCase()).join(', ') || "Customer"}
                            </Typography>
                        </Box>

                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<LogoutIcon />}
                            fullWidth
                            onClick={handleLogout}
                            sx={{ mt: 2 }}
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
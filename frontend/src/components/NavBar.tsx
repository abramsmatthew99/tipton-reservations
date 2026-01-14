import { AppBar, Box, Toolbar, Typography, Button, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const isAdminView = location.pathname.startsWith('/admin');
    
    const isCustomerView = !isAdminView; 

    return (
        <AppBar position="static" color="primary" elevation={0}>
            <Container maxWidth="false" sx={{ px: 3}}>
                <Toolbar disableGutters>
                    {/* BRANDING */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontWeight: 700, letterSpacing: '.1rem', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        THE TIPTON
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        
                        {/*  ADMIN VIEW  */}
                        {isAuthenticated && isAdminView && (
                            <>
                                <Button color="inherit" onClick={() => navigate('/admin')}>Dashboard</Button>
                                <Button color="inherit" onClick={() => navigate('/admin/rooms')}>Rooms</Button>
                                <Button color="inherit" onClick={() => navigate('/admin/room-types')}>Types</Button>
                                <Button color="inherit" onClick={() => navigate('/admin/bookings')}>Bookings</Button>
                            </>
                        )}

                        {/* CUSTOMER VIEW  */}
                        {isAuthenticated && isCustomerView && (
                            <>
                                <Button color="inherit" onClick={() => navigate('/customer')}>Browse Rooms</Button>
                                <Button color="inherit" onClick={() => navigate('/customer/bookings')}>My Bookings</Button>
                            </>
                        )}

                        {/*  GUEST  */}
                        {!isAuthenticated && (
                            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                        )}
                    </Box>

                    {/* PROFILE MENU */}
                    <ProfileMenu />
                    
                </Toolbar>
            </Container>
        </AppBar>
    );
}
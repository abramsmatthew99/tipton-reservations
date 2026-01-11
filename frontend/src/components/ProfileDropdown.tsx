import React, { useState } from 'react';
import { 
    IconButton, Avatar, Menu, MenuItem, ListItemIcon, 
    Divider, Tooltip 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HotelIcon from '@mui/icons-material/Hotel';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';

export default function ProfileDropdown() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    const handleNavigate = (path: string) => {
        handleClose();
        navigate(path);
    };

    const getInitials = () => {
        if (!user || !user.sub) return '?';
        return user.sub.charAt(0).toUpperCase();
    };

    const isAdminPortal = location.pathname.startsWith('/admin');
    const hasAdminRole = user?.roles?.includes('ROLE_ADMIN');

    return (
        <>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: isAuthenticated ? 'secondary.main' : 'grey.500' }}>
                        {isAuthenticated ? getInitials() : <PersonIcon />}
                    </Avatar>
                </IconButton>
            </Tooltip>
            
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/*  GUEST */}
                {!isAuthenticated && (
                    <MenuItem onClick={() => handleNavigate('/login')}>
                        <ListItemIcon>
                            <LoginIcon fontSize="small" />
                        </ListItemIcon>
                        Sign In
                    </MenuItem>
                )}

                {/*  LOGGED IN USER (Profile Link) */}
                {isAuthenticated && (
                    <MenuItem onClick={() => handleNavigate('/customer/profile')}>
                        <Avatar /> Profile
                    </MenuItem>
                )}

                {/* ADMIN SWITCHER */}
                {isAuthenticated && hasAdminRole && (
                    <div>
                        <Divider />
                        {isAdminPortal ? (
                            // If in Admin Portal 
                            <MenuItem onClick={() => handleNavigate('/customer')}>
                                <ListItemIcon>
                                    <HotelIcon fontSize="small" />
                                </ListItemIcon>
                                Switch to Customer View
                            </MenuItem>
                        ) : (
                            // If ANYWHERE else 
                            <MenuItem onClick={() => handleNavigate('/admin')}>
                                <ListItemIcon>
                                    <AdminPanelSettingsIcon fontSize="small" />
                                </ListItemIcon>
                                Switch to Admin View
                            </MenuItem>
                        )}
                    </div>
                )}

                {/*  LOGOUT */}
                {isAuthenticated && (
                    <div>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </div>
                )}
            </Menu>
        </>
    );
}
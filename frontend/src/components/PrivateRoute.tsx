import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    allowedRoles?: string[]; 
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, isAuthenticated } = useAuth();

    //Bounce the unauthenticated users to the login page
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    //Checking for authorization here
    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = user.roles.some(role => allowedRoles.includes(role));
        if (!hasPermission) {
            return <Navigate to={user.roles.includes('ROLE_ADMIN') ? "/admin" : "/customer"} replace />;
        }
    }

    // If actually authorized jsut go where they tried to go
    return <Outlet />;
}
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import BookingConfirmPage from "./pages/booking/BookingConfirmPage";
import BookingConfirmationPage from "./pages/booking/BookingConfirmationPage";
import AdminPortal from "./layouts/AdminPortal";
import CustomerPortal from "./layouts/CustomerPortal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRoomTypes from "./pages/admin/AdminRoomTypes";
import BrowseRooms from "./pages/customer/BrowseRooms";
import Profile from "./pages/customer/Profile";
import BookingsPage from "./pages/customer/BookingsPage";
import BookingDetailsPage from "./pages/booking/BookingDetailsPage";
import PrivateRoute from "./components/PrivateRoute";
import AuthSuccess from "./pages/AuthSuccess";
import LandingPage from "./pages/Landing";
import Footer from "./components/Footer";
import { Box } from '@mui/material';
import NavBar  from './components/NavBar';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar/>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>

            {/*  Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/" element={<LandingPage />} />

            {/* Admin route for existing room management forms */}
            <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/admin" element={<AdminPortal />}>
                <Route index element={<AdminDashboard />} />
                <Route path='rooms' element={<AdminRooms />} />
                <Route path='room-types' element={<AdminRoomTypes />} />
                <Route path='bookings' element={<AdminBookings />} />
              </Route>
            </Route>

            {/* Booking Confirmation Page (Payment) */}
            <Route path='/booking/confirm' element={<BookingConfirmPage />} />

            {/* Booking Confirmation Success Page */}
            <Route
              path='/booking/confirmation/:confirmationNumber'
              element={<BookingConfirmationPage />}
            />
            {/* Customer Portal */}
            <Route element={<PrivateRoute allowedRoles={['ROLE_ADMIN', 'ROLE_CUSTOMER']}/>}>
              <Route path="/customer" element={<CustomerPortal />}>
                <Route index element={<BrowseRooms />} />
                <Route path='bookings' element={<BookingsPage />} />
                <Route path='bookings/:id' element={<BookingDetailsPage />} />
                <Route path='profile' element={<Profile />} />
              </Route>
            </Route>

          </Routes>
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  );
}

export default App;

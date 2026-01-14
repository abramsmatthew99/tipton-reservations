import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import BookingConfirmPage from "./pages/booking/BookingConfirmPage";
import BookingConfirmationPage from "./pages/booking/BookingConfirmationPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRoomManagement from "./pages/admin/AdminRoomManagement";
import BrowseRooms from "./pages/customer/BrowseRooms";
import Profile from "./pages/customer/Profile";
import BookingsPage from "./pages/customer/BookingsPage";
import BookingDetailsPage from "./pages/booking/BookingDetailsPage";
import PrivateRoute from "./components/PrivateRoute";
import AuthSuccess from "./pages/AuthSuccess";
import LandingPage from "./pages/Landing";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Register from "./pages/Register";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminRoomTypes from "./pages/admin/AdminRoomTypes";
import { Box, Button, Typography } from "@mui/material";

function NotFound() {
  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: "auto",
        px: 3,
        py: 8,
        textAlign: "center",
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The page you are looking for doesn’t exist or may have moved.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Back to Home
      </Button>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <NavBar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {/*  Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />

            {/* Admin route for existing room management forms */}
            <Route element={<PrivateRoute allowedRoles={["ROLE_ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="admin/rooms" element={<AdminRooms />} />
              <Route path="admin/room-types" element={<AdminRoomTypes />} />
              <Route path="admin/bookings" element={<AdminBookings />} />
            </Route>

            {/* Booking Confirmation Page (Payment) */}
            <Route path="/booking/confirm" element={<BookingConfirmPage />} />

            {/* Booking Confirmation Success Page */}
            <Route
              path="/booking/confirmation/:confirmationNumber"
              element={<BookingConfirmationPage />}
            />
            {/* Customer Portal */}
            <Route
              element={
                <PrivateRoute allowedRoles={["ROLE_ADMIN", "ROLE_CUSTOMER"]} />
              }
            >
              = <Route path="/customer" element={<BrowseRooms />} />
              <Route path="/customer/bookings" element={<BookingsPage />} />
              <Route
                path="/customer/bookings/:id"
                element={<BookingDetailsPage />}
              />
              <Route path="/customer/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  );
}

export default App;

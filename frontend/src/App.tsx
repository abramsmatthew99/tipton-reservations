import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import NavBar from "./components/NavBar";
import AdminPortal from "./layouts/AdminPortal";
import CustomerPortal from "./layouts/CustomerPortal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRoomTypes from "./pages/admin/AdminRoomTypes";
import BrowseRooms from "./pages/customer/BrowseRooms";
import MyBookings from "./pages/customer/MyBookings";
import Profile from "./pages/customer/Profile";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />

        {/* Landing page - placeholder for now */}
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <div className="app">
                <header>
                  <h1>Tipton Hotel Reservations</h1>
                  <p>Welcome to Tipton. <a href="/login"> Login Here</a></p>
                </header>
              </div>
            </>
          }
        />
        {/* Admin route for existing room management forms */}
        {/* Future Todo: Wrap this in <PrivateRoute role="ADMIN"> */}
        <Route path="/admin" element={<AdminPortal />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="room-types" element={<AdminRoomTypes />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        {/* Booking Confirmation Page (Payment) */}
        <Route path="/booking/confirm" element={<BookingConfirmPage />} />
        {/* Booking Confirmation Success Page */}
        <Route
          path="/booking/confirmation/:confirmationNumber"
          element={<BookingConfirmationPage />}
        />
        {/* --- Customer Portal --- */}
        {/* Future Todo: Wrap this in <PrivateRoute role="CUSTOMER"> */}
        <Route path="/customer" element={<CustomerPortal />}>
          <Route index element={<BrowseRooms />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>


      </Routes>
    </AuthProvider>
  );
}

export default App;

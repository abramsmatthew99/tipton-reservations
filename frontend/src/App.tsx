import { Routes, Route } from "react-router-dom";
import "./App.css";
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
    <>
      <Routes>
        {/* Landing page - placeholder for now */}
        <Route
          path='/'
          element={
            <>
              <NavBar />
              <div className='app'>
                <header>
                  <h1>Tipton Hotel Reservations</h1>
                  <p>Landing page...</p>
                </header>
              </div>
            </>
          }
        />

        {/* Admin route for existing room management forms */}
        <Route
          path='/admin'
          element={<AdminPortal />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path='rooms' element={<AdminRooms />} />
          <Route path='room-types' element={<AdminRoomTypes />} />
          <Route path='bookings' element={<AdminBookings />} />
        </Route>

        <Route
          path='/customer'
          element={<CustomerPortal />}
        >
          <Route index element={<BrowseRooms />} />
          <Route path='bookings' element={<MyBookings />} />
          <Route path='profile' element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

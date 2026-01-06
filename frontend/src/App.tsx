import { Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import AdminPortal from "./layouts/AdminPortal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRoomTypes from "./pages/admin/AdminRoomTypes";

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
      </Routes>
    </>
  );
}

export default App;

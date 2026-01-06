import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

const AdminPortal = () => {
  const location = useLocation();
  const tabs = [
    { label: "Dashboard", value: "/admin" },
    { label: "Room Management", value: "/admin/rooms" },
    { label: "Room Type Management", value: "/admin/room-types" },
    { label: "Booking Management", value: "/admin/bookings" },
  ];
  const activeTab =
    tabs.find((tab) =>
      tab.value === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(tab.value)
    )?.value ?? "/admin";

  return (
    <div className="app">
      <header>
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h4" fontWeight={700}>
              Admin Portal
            </Typography>
            <Tabs
              value={activeTab}
              aria-label="Admin sections"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  component={NavLink}
                  to={tab.value}
                />
              ))}
            </Tabs>
          </Box>
        </Paper>
      </header>

      <Outlet />
    </div>
  );
};

export default AdminPortal;

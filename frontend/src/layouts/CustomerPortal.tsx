import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

const CustomerPortal = () => {
  const location = useLocation();
  const tabs = [
    { label: "Browse Rooms", value: "/customer" },
    { label: "My Bookings", value: "/customer/bookings" },
    { label: "Profile", value: "/customer/profile" },
  ];
  const activeTab =
    tabs.find((tab) =>
      tab.value === "/customer"
        ? location.pathname === "/customer"
        : location.pathname.startsWith(tab.value)
    )?.value ?? "/customer";

  return (
    <div className="app">
      <header>
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h4" fontWeight={700}>
              Customer Portal
            </Typography>
            <Tabs
              value={activeTab}
              aria-label="Customer sections"
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

export default CustomerPortal;

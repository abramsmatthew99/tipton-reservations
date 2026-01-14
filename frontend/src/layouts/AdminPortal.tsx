import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

const AdminPortal = () => {
  const location = useLocation();
  const tabs = [
    { label: "Dashboard", value: "/admin" },
    { label: "Room Management", value: "/admin/rooms" },
    { label: "Booking Management", value: "/admin/bookings" },
  ];
  const activeTab =
    location.pathname.startsWith("/admin/room-types")
      ? "/admin/rooms"
      : tabs.find((tab) =>
          tab.value === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(tab.value)
        )?.value ?? "/admin";

  return (
    <div className="app">
      <header>
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(40, 54, 24, 0.08)",
          }}
        >
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
              Admin Portal
            </Typography>
            <Box
              sx={{
                px: { xs: 1, sm: 1.5 },
                py: { xs: 0.5, sm: 0.75 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Tabs
                value={activeTab}
                aria-label="Admin sections"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 52,
                  "& .MuiTabs-flexContainer": { gap: 1.5 },
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 2,
                  },
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                    component={NavLink}
                    to={tab.value}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      px: 2.5,
                      py: 1.25,
                      minHeight: 52,
                      borderRadius: 2,
                      "&.Mui-selected": {
                        color: "primary.main",
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Box>
        </Paper>
      </header>

      <Outlet />
    </div>
  );
};

export default AdminPortal;

import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import AdminRooms from "./AdminRooms";
import AdminRoomTypes from "./AdminRoomTypes";

const AdminRoomManagement = () => {
  const location = useLocation();
  const tabs = [
    { label: "Rooms", value: "/admin/rooms" },
    { label: "Room Types", value: "/admin/room-types" },
  ];
  const activeTab =
    tabs.find((tab) => location.pathname.startsWith(tab.value))?.value ??
    "/admin/rooms";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Typography variant="h5" fontWeight={700}>
            Room Management
          </Typography>
          <Tabs
            value={activeTab}
            aria-label="Room management sections"
            sx={{
              minHeight: 48,
              "& .MuiTabs-flexContainer": { gap: 1 },
              "& .MuiTabs-indicator": {
                height: 3,
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
                  px: 2,
                  minHeight: 48,
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {activeTab === "/admin/room-types" ? (
        <AdminRoomTypes />
      ) : (
        <AdminRooms />
      )}
    </Box>
  );
};

export default AdminRoomManagement;

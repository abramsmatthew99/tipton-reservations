import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import AdminRooms from "./AdminRooms";
import AdminRoomTypes from "./AdminRoomTypes";
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import CategoryIcon from '@mui/icons-material/Category';

const AdminRoomManagement = () => {
  const location = useLocation();
  
  const tabs = [
    { label: "Room Inventory", value: "/admin/rooms", icon: <BedroomParentIcon fontSize="small"/> },
    { label: "Room Types", value: "/admin/room-types", icon: <CategoryIcon fontSize="small"/> },
  ];
  
  const activeTab =
    tabs.find((tab) => location.pathname.startsWith(tab.value))?.value ??
    "/admin/rooms";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. PAGE HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom color="text.primary">
            Room Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
            Manage hotel inventory, room definitions, and assignments.
        </Typography>
      </Box>

      {/* 2. TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
            value={activeTab} 
            textColor="primary"
            indicatorColor="primary"
            aria-label="Room management tabs"
        >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                component={NavLink}
                to={tab.value}
                icon={tab.icon}
                iconPosition="start"
                sx={{ 
                    fontWeight: 600, 
                    textTransform: 'none', 
                    minHeight: 48,
                    mr: 2
                }}
              />
            ))}
        </Tabs>
      </Box>

      {/* 3. CONTENT AREA */}
      <Box sx={{ minHeight: '60vh' }}>
        {activeTab === "/admin/room-types" ? (
            <AdminRoomTypes />
        ) : (
            <AdminRooms />
        )}
      </Box>
    </Container>
  );
};

export default AdminRoomManagement;
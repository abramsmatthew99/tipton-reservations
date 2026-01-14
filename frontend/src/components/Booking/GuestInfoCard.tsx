import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

/**
 * Guest Information Card Component
 *
 * Displays read-only guest information from authenticated user account.
 * Fetches and shows firstName, lastName, and email from User model.
 */
function GuestInfoCard() {
  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: user?.sub || "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.sub) {
      const token = localStorage.getItem("token");
      axios
        .get(`${baseURL}/users/email/${user.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setProfileData({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            email: response.data.email,
          });
        })
        .catch((err) => {
          console.error("Failed to load user profile", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Guest Information
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Name */}
          {(profileData.firstName || profileData.lastName) && (
            <>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Name
                </Typography>
                <Typography variant='body1'>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
              </Box>
              <Divider />
            </>
          )}

          {/* Email */}
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Email
            </Typography>
            <Typography variant='body1'>{profileData.email}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Confirmation will be sent to this email
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default GuestInfoCard;

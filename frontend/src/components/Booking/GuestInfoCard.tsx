import { Card, CardContent, Typography, Box, Divider } from "@mui/material";

/**
 * Guest Information Card Component
 *
 * Displays read-only guest information from authenticated user account.
 * Shows name and email - users should update their account settings to change this info.
 */
function GuestInfoCard() {
  // TODO: When auth is implemented, get user from auth context:
  // const { user } = useAuth();

  // Dummy user data for now (will be replaced with actual user from auth context)
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Guest Information
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Name */}
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Name
            </Typography>
            <Typography variant='body1'>
              {user.firstName} {user.lastName}
            </Typography>
          </Box>

          <Divider />

          {/* Email */}
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Email
            </Typography>
            <Typography variant='body1'>{user.email}</Typography>
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

import { Card, Typography, Box, Chip, Button, Stack } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { formatDate } from "../../util/helper";

type BookingCardProps = {
  booking: BookingResponse;
};

/**
 * Booking Card Component
 *
 * Displays summary of a single booking
 */
function BookingCard({ booking }: BookingCardProps) {
  const navigate = useNavigate();

  // Map booking status to chip color and label
  const getStatusChip = (status: BookingStatus) => {
    const statusConfig = {
      CONFIRMED: { color: "success" as const, label: "Confirmed" },
      PENDING: { color: "warning" as const, label: "Pending" },
      CANCELLED: { color: "error" as const, label: "Cancelled" },
      COMPLETED: { color: "info" as const, label: "Completed" },
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        sx={{ fontWeight: 500 }}
      />
    );
  };

  // Format room type name (convert "double-room" to "Double Room")
  const formatRoomType = (roomTypeId: string) => {
    return roomTypeId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleViewDetails = () => {
    navigate(`/customer/bookings/${booking.id}`);
  };

  // Calculate number of nights
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      sx={{
        display: "flex",
        "&:hover": { boxShadow: 6 },
        transition: "box-shadow 0.3s",
        overflow: "hidden",
      }}
    >
      {/* Left Side: Image */}
      {/* TODO: using placeholder; replace with real images */}
      <Box
        sx={{
          width: 240,
          minHeight: 200,
          backgroundColor: "#7D7D7D",
          flexShrink: 0,
        }}
      />

      {/* Right Side: Content */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, p: 3 }}>
        {/* Header: Room Type & Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
              {formatRoomType(booking.roomTypeId)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Room {booking.roomId.split("-")[1] || booking.roomId}
            </Typography>
          </Box>
          {getStatusChip(booking.status)}
        </Box>

        {/* Confirmation Number */}
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Confirmation #: <strong>{booking.confirmationNumber}</strong>
        </Typography>

        {/* Dates & Guests Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Check-in */}
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant='caption' color='text.secondary'>
                Check-in
              </Typography>
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {formatDate(booking.checkInDate)}
            </Typography>
          </Box>

          {/* Check-out */}
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant='caption' color='text.secondary'>
                Check-out
              </Typography>
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {formatDate(booking.checkOutDate)}
            </Typography>
          </Box>

          {/* Guests */}
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <PeopleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant='caption' color='text.secondary'>
                Guests
              </Typography>
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {booking.numberOfGuests}
            </Typography>
          </Box>
        </Box>

        {/* Bottom: Price & Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Box>
            <Typography variant='caption' color='text.secondary'>
              {nights} {nights === 1 ? "night" : "nights"}
            </Typography>
            <Typography variant='h6' color='primary' sx={{ fontWeight: 600 }}>
              Total: ${parseFloat(booking.totalPrice).toFixed(2)}
            </Typography>
          </Box>

          <Stack direction='row' spacing={1}>
            <Button
              variant='outlined'
              size='medium'
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            {booking.status === "CONFIRMED" && (
              <Button
                variant='outlined'
                color='error'
                size='medium'
                onClick={() => {
                  // TODO: Implement cancel booking functionality
                  console.log("Cancel booking:", booking.id);
                }}
              >
                Cancel Booking
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

export default BookingCard;

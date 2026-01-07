import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";
// import axios from "axios";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { formatDate } from "../../util/helper";

// Hotel check-in/check-out policy times
const CHECK_IN_TIME = "3:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

/**
 * Booking Details Page
 *
 * Displays full details of a single booking.
 * TODO: Currently uses mock data; integrate with backend API
 */
function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call with auth
      // const response = await axios.get(`http://localhost:8080/bookings/${bookingId}`, {
      //   headers: {
      //     Authorization: `Bearer ${authToken}`,
      //   },
      // });
      // setBooking(response.data);

      // Mock data for now
      const mockBookings: BookingResponse[] = [
        {
          id: "booking-1",
          confirmationNumber: "TIP-ABC123",
          userId: "test-user-123",
          roomId: "room-101",
          roomTypeId: "double-room",
          checkInDate: "2026-01-15",
          checkOutDate: "2026-01-17",
          numberOfGuests: 2,
          totalPrice: "238.00",
          paymentId: "pi_mock123",
          status: "CONFIRMED",
          createdAt: "2026-01-05T10:30:00Z",
          updatedAt: "2026-01-05T10:30:00Z",
        },
        {
          id: "booking-2",
          confirmationNumber: "TIP-XYZ789",
          userId: "test-user-123",
          roomId: "room-205",
          roomTypeId: "suite",
          checkInDate: "2026-02-10",
          checkOutDate: "2026-02-12",
          numberOfGuests: 4,
          totalPrice: "450.00",
          paymentId: "pi_mock456",
          status: "CONFIRMED",
          createdAt: "2026-01-03T14:20:00Z",
          updatedAt: "2026-01-03T14:20:00Z",
        },
        {
          id: "booking-3",
          confirmationNumber: "TIP-DEF456",
          userId: "test-user-123",
          roomId: "room-302",
          roomTypeId: "single-room",
          checkInDate: "2025-12-20",
          checkOutDate: "2025-12-22",
          numberOfGuests: 1,
          totalPrice: "150.00",
          paymentId: "pi_mock789",
          status: "COMPLETED",
          createdAt: "2025-12-15T09:15:00Z",
          updatedAt: "2025-12-23T11:00:00Z",
        },
        {
          id: "booking-4",
          confirmationNumber: "TIP-GHI012",
          userId: "test-user-123",
          roomId: "room-103",
          roomTypeId: "double-room",
          checkInDate: "2026-03-05",
          checkOutDate: "2026-03-08",
          numberOfGuests: 2,
          totalPrice: "357.00",
          paymentId: null,
          status: "CANCELLED",
          createdAt: "2025-12-28T16:45:00Z",
          updatedAt: "2026-01-02T10:30:00Z",
        },
      ];

      const foundBooking = mockBookings.find((b) => b.id === bookingId);
      if (!foundBooking) {
        setError("Booking not found");
      } else {
        setBooking(foundBooking);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Failed to load booking details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: BookingStatus) => {
    const statusConfig = {
      CONFIRMED: { color: "success" as const, label: "Confirmed" },
      PENDING: { color: "warning" as const, label: "Pending" },
      CANCELLED: { color: "error" as const, label: "Cancelled" },
      COMPLETED: { color: "info" as const, label: "Completed" },
    };

    const config = statusConfig[status];
    return <Chip label={config.label} color={config.color} />;
  };

  const formatRoomType = (roomTypeId: string) => {
    return roomTypeId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    // TODO: Implement actual cancel booking API call
    // try {
    //   await axios.delete(`http://localhost:8080/bookings/${booking.id}`, {
    //     headers: {
    //       Authorization: `Bearer ${authToken}`,
    //     },
    //   });
    //   navigate("/customer/bookings");
    // } catch (err) {
    //   console.error("Error cancelling booking:", err);
    // }

    console.log("Cancel booking:", booking.id);
  };

  if (loading) {
    return (
      <Container maxWidth='md' sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          Loading booking details...
        </Typography>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error'>
          {error || "Booking not found"}
          <Typography variant='body2' sx={{ mt: 1 }}>
            <Link to='/customer/bookings'>Return to My Bookings</Link>
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        variant='text'
        onClick={() => navigate("/customer/bookings")}
        sx={{ mb: 2 }}
      >
        ← Back to My Bookings
      </Button>

      {/* Booking Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant='h4'>Booking Details</Typography>
        {getStatusChip(booking.status)}
      </Box>

      {/* Booking Information Card */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Confirmation Number */}
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Confirmation Number
              </Typography>
              <Typography variant='h5' color='primary'>
                {booking.confirmationNumber}
              </Typography>
            </Box>

            <Divider />

            {/* Room Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Room Information
              </Typography>
              <Typography variant='body1' gutterBottom>
                {formatRoomType(booking.roomTypeId)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Room ID: {booking.roomId}
              </Typography>
            </Box>

            <Divider />

            {/* Stay Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Stay Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Check-in
                  </Typography>
                  <Typography variant='body1'>
                    {formatDate(booking.checkInDate)} at {CHECK_IN_TIME}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Check-out
                  </Typography>
                  <Typography variant='body1'>
                    {formatDate(booking.checkOutDate)} at {CHECK_OUT_TIME}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Number of Guests
                  </Typography>
                  <Typography variant='body1'>
                    {booking.numberOfGuests}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Payment Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Payment Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant='body1'>Total Amount</Typography>
                  <Typography variant='h5' color='primary'>
                    ${parseFloat(booking.totalPrice).toFixed(2)}
                  </Typography>
                </Box>
                {booking.paymentId && (
                  <Typography variant='caption' color='text.secondary'>
                    Payment ID: {booking.paymentId}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Booking Metadata */}
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Booked on: {new Date(booking.createdAt).toLocaleString()}
              </Typography>
              {booking.updatedAt !== booking.createdAt && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                >
                  Last updated: {new Date(booking.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            {booking.status === "CONFIRMED" && (
              <>
                <Divider />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      // TODO: Implement modify booking functionality
                      console.log("Modify booking:", booking.id);
                    }}
                  >
                    Modify Booking
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default BookingDetailsPage;

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
// import axios from "axios";
import type { BookingResponse } from "../../types/booking";
import BookingCard from "../../components/Booking/BookingCard";

/**
 * Bookings Page
 *
 * Displays a list of all bookings for the authenticated user.
 * TODO: Currently uses mock data; integrate with backend API
 */
function BookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call with auth
      // const response = await axios.get("http://localhost:8080/bookings/user", {
      //   headers: {
      //     Authorization: `Bearer ${authToken}`,
      //   },
      // });
      // setBookings(response.data.content); // Spring Page response

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

      setBookings(mockBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          Loading your bookings...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>{error}</Alert>
      </Container>
    );
  }

  if (bookings.length === 0) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Typography variant='h4' gutterBottom>
          My Bookings
        </Typography>
        <Alert severity='info'>
          You don't have any bookings yet. Book your first room to get started!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        My Bookings
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        View and manage your hotel reservations
      </Typography>

      <Stack spacing={3}>
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </Stack>
    </Container>
  );
}

export default BookingsPage;

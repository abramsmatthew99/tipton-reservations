import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import BookingCard from "../../components/Booking/BookingCard";
import { useGetUserBookingsQuery } from "../../store/api/bookingApi";

/**
 * Bookings Page
 *
 * Displays a list of all bookings for the authenticated user.
 * Uses RTK Query for data fetching with automatic caching and refetching.
 */
function BookingsPage() {
  const { data, isLoading, isError, error } = useGetUserBookingsQuery({});

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          Loading your bookings...
        </Typography>
      </Container>
    );
  }

  if (isError) {
    const errorMessage =
      error && "data" in error
        ? String((error.data as { message?: string })?.message || "An error occurred")
        : "Failed to load bookings. Please try again later.";

    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>{errorMessage}</Alert>
      </Container>
    );
  }

  const bookings = data?.content || [];

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

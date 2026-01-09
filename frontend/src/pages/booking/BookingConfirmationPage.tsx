import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import { formatDate } from "../../util/helper";
import type { BookingFormState, BookingStatus } from "../../types/booking";
import { useGetBookingByConfirmationNumberQuery } from "../../store/api/bookingApi";

// Hotel check-in/check-out policy times
const CHECK_IN_TIME = "3:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

/**
 * Booking Confirmation Page
 *
 * Displays booking confirmation after successful payment.
 * Can receive data from:
 * 1. Route state (immediate after payment)
 * 2. Backend API fetch (when accessing via URL directly)
 */
function BookingConfirmationPage() {
  const { confirmationNumber } = useParams<{ confirmationNumber: string }>();
  const location = useLocation();

  // Try to get booking data from route state (passed from payment page)
  const stateData = location.state?.bookingData as BookingFormState | undefined;
  const stateConfirmationNumber = location.state?.confirmationNumber as
    | string
    | undefined;

  const {
    data: fetchedBooking,
    isLoading,
    isError,
  } = useGetBookingByConfirmationNumberQuery(confirmationNumber!, {
    skip: !!stateData || !confirmationNumber,
  });

  const formatRoomTypeId = (roomTypeId: string) => {
    return roomTypeId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayData = stateData
    ? {
        roomTypeName: stateData.roomTypeName,
        checkInDate: stateData.checkInDate,
        checkOutDate: stateData.checkOutDate,
        numberOfGuests: stateData.numberOfGuests,
        totalPrice: stateData.totalPrice,
        status: "CONFIRMED" as BookingStatus,
      }
    : fetchedBooking
    ? {
        roomTypeName: formatRoomTypeId(fetchedBooking.roomTypeId),
        checkInDate: fetchedBooking.checkInDate,
        checkOutDate: fetchedBooking.checkOutDate,
        numberOfGuests: fetchedBooking.numberOfGuests,
        totalPrice: Number(fetchedBooking.totalPrice),
        status: fetchedBooking.status,
      }
    : undefined;

  if (!stateData && isLoading) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography variant='body1' sx={{ mt: 2 }}>
            Loading booking details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!displayData || isError) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error'>
          <Typography variant='h6'>Booking Not Found</Typography>
          <Typography>
            Unable to load booking details. Please check your email for
            confirmation or contact support.
          </Typography>
          <Typography variant='body2' sx={{ mt: 1 }}>
            Click <Link to='/'>here</Link> to return to home.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const displayConfirmationNumber =
    stateConfirmationNumber || confirmationNumber || "TIP-DEMO123";
  const statusConfig: Record<
    BookingStatus,
    { severity: "success" | "warning" | "error" | "info"; title: string; message: string }
  > = {
    CONFIRMED: {
      severity: "success",
      title: "Booking Confirmed!",
      message: "A confirmation email has been sent to your email address.",
    },
    PENDING: {
      severity: "info",
      title: "Booking Pending",
      message:
        "Your booking is pending payment confirmation. Please check your email or payment status.",
    },
    CANCELLED: {
      severity: "warning",
      title: "Booking Cancelled",
      message:
        "This booking has been cancelled. If you believe this is a mistake, please contact support.",
    },
    VOIDED: {
      severity: "warning",
      title: "Booking Voided",
      message:
        "This booking was voided due to payment failure or an incomplete checkout.",
    },
    COMPLETED: {
      severity: "success",
      title: "Booking Completed",
      message: "Thank you for staying with us!",
    },
  };
  const banner = statusConfig[displayData.status];

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Alert severity={banner.severity} sx={{ mb: 2 }}>
        <Typography variant='h6'>{banner.title}</Typography>
        <Typography>
          Confirmation Number: {displayConfirmationNumber}
        </Typography>
        <Typography variant='body2' sx={{ mt: 1 }}>
          {banner.message}
        </Typography>
        <Typography variant='body2' sx={{ mt: 1 }}>
          Click <Link to='/'>here</Link> to return to home.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Booking Details
          </Typography>
          <Typography>Room Type: {displayData.roomTypeName}</Typography>
          <Typography>
            Check-in: {formatDate(displayData.checkInDate)} at {CHECK_IN_TIME}
          </Typography>
          <Typography>
            Check-out: {formatDate(displayData.checkOutDate)} at{" "}
            {CHECK_OUT_TIME}
          </Typography>
          <Typography>Guests: {displayData.numberOfGuests}</Typography>
          <Typography>Total: ${displayData.totalPrice.toFixed(2)}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default BookingConfirmationPage;

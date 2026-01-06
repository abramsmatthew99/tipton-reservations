import { Alert, Card, CardContent, Container, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import { formatDate } from "../util/helper";
import type { BookingFormState } from "../types/booking";

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
  const stateConfirmationNumber = location.state?.confirmationNumber as string | undefined;

  // TODO: If no state data, fetch from backend using confirmationNumber
  // useEffect(() => {
  //   if (!stateData && confirmationNumber) {
  //     fetch(`http://localhost:8080/bookings/confirmation/${confirmationNumber}`)
  //       .then(res => res.json())
  //       .then(data => setBookingData(data));
  //   }
  // }, [confirmationNumber, stateData]);

  // For now, if no state data, show error (will implement API fetch later)
  if (!stateData) {
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

  const displayConfirmationNumber = stateConfirmationNumber || confirmationNumber || "TIP-DEMO123";

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Alert severity='success' sx={{ mb: 2 }}>
        <Typography variant='h6'>Booking Confirmed!</Typography>
        <Typography>Confirmation Number: {displayConfirmationNumber}</Typography>
        <Typography variant='body2' sx={{ mt: 1 }}>
          A confirmation email has been sent to your email address.
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
          <Typography>Room Type: {stateData.roomTypeName}</Typography>
          <Typography>
            Check-in: {formatDate(stateData.checkInDate)} at {CHECK_IN_TIME}
          </Typography>
          <Typography>
            Check-out: {formatDate(stateData.checkOutDate)} at {CHECK_OUT_TIME}
          </Typography>
          <Typography>Guests: {stateData.numberOfGuests}</Typography>
          <Typography>Total: ${stateData.totalPrice.toFixed(2)}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default BookingConfirmationPage;
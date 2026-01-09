import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import type { BookingFormState } from "../../types/booking";
import BookingSummaryCard from "../../components/Booking/BookingSummaryCard";
import GuestInfoCard from "../../components/Booking/GuestInfoCard";
import StripePaymentForm from "../../components/Payment/StripePaymentForm";
import { stripePromise } from "../../config/stripe";
import { useConfirmBookingMutation } from "../../store/api/bookingApi";

/**
 * Booking Confirmation Page
 *
 * Displays booking summary and collects payment.
 */
function BookingConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get booking data from route state (passed from SearchPage)
  const bookingData = location.state?.bookingData as
    | BookingFormState
    | undefined;

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = location.state?.searchParams as string | undefined;
  const searchQuery = searchParams ? `?${searchParams}` : "";

  // RTK Query mutations
  const [confirmBooking] = useConfirmBookingMutation();

  // Handle successful payment: confirm the pending booking
  const handlePaymentSuccess = async (
    paymentIntentId: string,
    bookingId: string
  ) => {
    if (!bookingData) {
      setBookingError("No booking data found.");
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the PENDING booking using bookingId returned from payment flow
      const confirmedBooking = await confirmBooking({
        id: bookingId,
        paymentIntentId,
      }).unwrap();

      // Navigate to confirmation page with booking details
      navigate(`/booking/confirmation/${confirmedBooking.confirmationNumber}`, {
        state: {
          bookingData,
          confirmationNumber: confirmedBooking.confirmationNumber,
          bookingId: confirmedBooking.id,
        },
      });
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      setBookingError(
        "Payment succeeded but booking confirmation failed. Your payment will be refunded. Please contact support with payment ID: " +
          paymentIntentId
      );
      setIsProcessing(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
    // The StripePaymentForm handles displaying the error
  };

  // Show error if no booking data was passed
  if (!bookingData) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          No booking data found. Please go back and select a room.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant='text'
          onClick={() => navigate(`/customer${searchQuery}`)}
        >
          ← Back to Rooms
        </Button>
      </Box>
      <Typography variant='h4' gutterBottom>
        Confirm Your Booking
      </Typography>

      {bookingError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {bookingError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Booking Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          <BookingSummaryCard bookingData={bookingData} />
        </Grid>

        {/* Right Column: Guest Info & Payment */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Guest Information */}
          <GuestInfoCard />

          {/* Payment */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Payment
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Total: ${bookingData.totalPrice.toFixed(2)}
              </Typography>

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={bookingData.totalPrice}
                  bookingData={bookingData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={isProcessing}
                />
              </Elements>

              {isProcessing && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    Creating and confirming your booking...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BookingConfirmPage;

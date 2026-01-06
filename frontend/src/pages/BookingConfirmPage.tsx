import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import type { BookingFormState } from "../types/booking";
import BookingSummaryCard from "../components/Booking/BookingSummaryCard";
import GuestInfoCard from "../components/Booking/GuestInfoCard";
import StripePaymentForm from "../components/Payment/StripePaymentForm";
import { stripePromise } from "../config/stripe";

/**
 * Booking Confirmation Page
 *
 * Displays booking summary and collects payment
 * Flow: Room Selection → THIS PAGE → Success Page
 */
function BookingConfirmPage() {
  const navigate = useNavigate();

  // TODO: Replace with actual data from route state when room selection is implemented
  // dummy booking data for now
  const [bookingData] = useState<BookingFormState>({
    roomTypeId: "dummy-room-type-id",
    roomTypeName: "Double Room",
    roomTypeImage:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    roomTypeDescription:
      "Spacious room with two double beds, perfect for small families or friends traveling together.",
    basePrice: 119,
    checkInDate: "2026-01-15",
    checkOutDate: "2026-01-17",
    numberOfGuests: 2,
    numberOfNights: 2, // Calculated from dates
    totalPrice: 238, // 119 × 2 nights
  });

  // Handle successful payment
  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful:", paymentId);

    // TODO: Replace with actual API call to POST /bookings when implemented
    // For now, simulate booking creation
    const mockConfirmationNumber = "TIP-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log("Booking data to submit:", {
      roomTypeId: bookingData.roomTypeId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      numberOfGuests: bookingData.numberOfGuests,
      paymentIntentId: paymentId,
      // TODO: Get user ID from auth context when auth is implemented
      // userId: user.id (from auth context)
    });

    // Navigate to confirmation page with booking data
    navigate(`/booking/confirmation/${mockConfirmationNumber}`, {
      state: {
        bookingData,
        confirmationNumber: mockConfirmationNumber,
      },
    });
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Confirm Your Booking
      </Typography>

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
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BookingConfirmPage;

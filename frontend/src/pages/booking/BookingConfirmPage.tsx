import { useState, useEffect } from "react";
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
import { sendBookingConfirmationEmail } from "../../services/emailService";
import { formatDate } from "../../util/helper";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

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

  // Get authenticated user
  const { user } = useAuth();

  // Fetch user profile data on page load
  const [profileData, setProfileData] = useState<{
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.sub) {
        setProfileLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const response = await axios.get(`${baseURL}/users/email/${user.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = {
          id: response.data.id,
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || "",
        };

        setProfileData(profile);

        // Check if profile is incomplete (firstName and lastName are required)
        setIsProfileIncomplete(!profile.firstName || !profile.lastName);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.sub]);

  // Handle profile updates from GuestInfoCard
  const handleProfileUpdate = (updatedProfile: typeof profileData) => {
    setProfileData(updatedProfile);
    // Update incomplete status
    if (updatedProfile) {
      setIsProfileIncomplete(!updatedProfile.firstName || !updatedProfile.lastName);
    }
  };

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

      // Send confirmation email (async, won't block navigation)
      console.log('DEBUG - profileData at payment success:', profileData);
      console.log('DEBUG - profileLoading:', profileLoading);

      if (profileData?.email) {
        const guestName = profileData.firstName && profileData.lastName
          ? `${profileData.firstName} ${profileData.lastName}`
          : 'Guest';

        console.log('DEBUG - Sending email to:', profileData.email);
        console.log('DEBUG - Guest name:', guestName);

        sendBookingConfirmationEmail({
          guestEmail: profileData.email,
          guestName,
          confirmationNumber: confirmedBooking.confirmationNumber,
          checkInDate: formatDate(confirmedBooking.checkInDate),
          checkOutDate: formatDate(confirmedBooking.checkOutDate),
          roomType: confirmedBooking.roomTypeName,
          roomNumber: confirmedBooking.roomNumber,
          numGuests: confirmedBooking.numberOfGuests,
          totalPrice: parseFloat(confirmedBooking.totalPrice).toFixed(2),
        }).catch(err => {
          // Email failure is logged but doesn't affect booking
          console.error('Email sending failed:', err);
        });
      } else {
        console.warn('Booking confirmed but email not sent: user profile not loaded', {
          profileData,
          profileLoading
        });
      }

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
          <GuestInfoCard
            profileData={profileData}
            loading={profileLoading}
            onProfileUpdate={handleProfileUpdate}
            onEditingChange={setIsEditingProfile}
          />

          {/* Payment */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Payment
              </Typography>
              <Typography variant='h6' sx={{ color: '#bc6c25', fontWeight: 600, mb: 2 }}>
                ${bookingData.totalPrice.toFixed(2)}
              </Typography>

              {/* Warning if profile is incomplete or being edited */}
              {(isProfileIncomplete || isEditingProfile) && (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  {isEditingProfile
                    ? "Please save your guest information before proceeding with payment."
                    : "Please complete your guest information above before proceeding with payment."}
                </Alert>
              )}

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={bookingData.totalPrice}
                  bookingData={bookingData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={isProcessing || isProfileIncomplete || isEditingProfile}
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

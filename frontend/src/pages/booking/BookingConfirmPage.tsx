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
  TextField,
  InputAdornment,
  Divider,
  Stack
} from "@mui/material";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import axios from 'axios';

/**
 * Booking Confirmation Page
 *
 * Displays booking summary, allows promo code application, and collects payment.
 */
function BookingConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // Get booking data from route state
  const originalBookingData = location.state?.bookingData as BookingFormState | undefined;

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = location.state?.searchParams as string | undefined;
  const searchQuery = searchParams ? `?${searchParams}` : "";

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Profile State
  const { user } = useAuth();
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

  // RTK Query mutation
  const [confirmBooking] = useConfirmBookingMutation();

  // Fetch user profile data on page load
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.sub) {
        setProfileLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
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
        setIsProfileIncomplete(!profile.firstName || !profile.lastName);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.sub, baseURL]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/rewards/validate/${promoCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid) {
        setAppliedPromo({
          code: promoCode,
          discount: response.data.discountAmount
        });
        setPromoMessage({ type: 'success', text: `Code applied! $${response.data.discountAmount} off.` });
      }
    } catch (err) {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: "Invalid or expired promo code." });
    } finally {
      setValidatingPromo(false);
    }
  };

  // Handle profile updates from GuestInfoCard
  const handleProfileUpdate = (updatedProfile: typeof profileData) => {
    setProfileData(updatedProfile);
    if (updatedProfile) {
      setIsProfileIncomplete(!updatedProfile.firstName || !updatedProfile.lastName);
    }
  };

  // Handle successful payment: confirm the pending booking
  const handlePaymentSuccess = async (paymentIntentId: string, bookingId: string) => {
    if (!originalBookingData) {
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
      if (profileData?.email) {
        const guestName = profileData.firstName && profileData.lastName
          ? `${profileData.firstName} ${profileData.lastName}`
          : 'Guest';

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
        }).catch(err => console.error('Email sending failed:', err));
      }

      // Navigate to confirmation page with booking details
      navigate(`/booking/confirmation/${confirmedBooking.confirmationNumber}`, {
        state: {
          bookingData: originalBookingData,
          confirmationNumber: confirmedBooking.confirmationNumber,
          bookingId: confirmedBooking.id,
        },
      });
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      setBookingError("Payment succeeded but confirmation failed. Contact support with ID: " + paymentIntentId);
      setIsProcessing(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
  };

  // Show error if no booking data was passed
  if (!originalBookingData) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>No booking data found. Please go back and select a room.</Alert>
      </Container>
    );
  }

  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalPrice = Math.max(0, originalBookingData.totalPrice - discountAmount);

  const finalBookingData = {
    ...originalBookingData,
    totalPrice: finalPrice,
    promoCode: appliedPromo?.code
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant='text' onClick={() => navigate(`/customer${searchQuery}`)}>
          ← Back to Rooms
        </Button>
      </Box>
      <Typography variant='h4' gutterBottom>Confirm Your Booking</Typography>

      {bookingError && <Alert severity='error' sx={{ mb: 3 }}>{bookingError}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column: Booking Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          <BookingSummaryCard bookingData={originalBookingData} />
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

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>Payment Details</Typography>
              
              <Box sx={{ mb: 3, mt: 1 }}>
                 <Stack direction="row" spacing={1}>
                    <TextField 
                        label="Promo Code" 
                        size="small" 
                        fullWidth 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={!!appliedPromo}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalOfferIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleApplyPromo}
                        disabled={validatingPromo || !!appliedPromo || !promoCode}
                    >
                        {validatingPromo ? "..." : "Apply"}
                    </Button>
                 </Stack>
                 
                 {promoMessage && (
                    <Typography 
                        variant="caption" 
                        color={promoMessage.type === 'success' ? 'success.main' : 'error.main'}
                        sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                        {promoMessage.type === 'success' && <CheckCircleIcon fontSize="inherit" />}
                        {promoMessage.text}
                    </Typography>
                 )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>${originalBookingData.totalPrice.toFixed(2)}</Typography>
              </Box>
              
              {appliedPromo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                      <Typography>Discount</Typography>
                      <Typography>-${appliedPromo.discount.toFixed(2)}</Typography>
                  </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, mt: 2 }}>
                  <Typography variant="h6">Total Due</Typography>
                  <Typography variant='h5' sx={{ color: '#bc6c25', fontWeight: 700 }}>
                    ${finalPrice.toFixed(2)}
                  </Typography>
              </Box>

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
                  amount={finalPrice}
                  bookingData={finalBookingData}
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
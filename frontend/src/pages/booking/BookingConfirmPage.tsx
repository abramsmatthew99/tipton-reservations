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
import axios from 'axios';

/**
 * Booking Confirmation Page
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
  
  // --- PROMO CODE STATE ---
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  // ------------------------

  const searchParams = location.state?.searchParams as string | undefined;
  const searchQuery = searchParams ? `?${searchParams}` : "";

  // RTK Query mutation
  const [confirmBooking] = useConfirmBookingMutation();

  // --- HANDLE PROMO CODE ---
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
  // -------------------------

  const handlePaymentSuccess = async (paymentIntentId: string, bookingId: string) => {
    if (!originalBookingData) {
      setBookingError("No booking data found.");
      return;
    }
    setIsProcessing(true);

    try {
      const confirmedBooking = await confirmBooking({
        id: bookingId,
        paymentIntentId,
      }).unwrap();

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

  if (!originalBookingData) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>No booking data found. Please go back and select a room.</Alert>
      </Container>
    );
  }

  // Calculate final price dynamically
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  // Ensure price doesn't drop below 0
  const finalPrice = Math.max(0, originalBookingData.totalPrice - discountAmount);

  // Merge promo code into booking data so it gets passed to StripeForm
  const finalBookingData = {
    ...originalBookingData,
    totalPrice: finalPrice,
    promoCode: appliedPromo?.code // Pass this to backend!
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
        {/* Left Column: Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          <BookingSummaryCard bookingData={originalBookingData} />
        </Grid>

        {/* Right Column: Payment & Promo */}
        <Grid size={{ xs: 12, md: 5 }}>
          <GuestInfoCard />

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>Payment Details</Typography>
              
              {/* --- PROMO CODE INPUT --- */}
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
                 
                 {/* Success/Error Message */}
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

              {/* Price Breakdown */}
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

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={finalPrice} // Pass the NEW discounted price
                  bookingData={finalBookingData} // Includes promoCode
                  onSuccess={handlePaymentSuccess}
                  onError={() => {}}
                  disabled={isProcessing}
                />
              </Elements>

              {isProcessing && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    Processing payment...
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
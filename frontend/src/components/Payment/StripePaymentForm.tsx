import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

/**
 * Stripe Payment Form Component
 *
 * Displays Stripe CardElement for collecting payment details.
 * Handles payment confirmation and error states.
 *
 * Flow implemented here:
 * 1. Create a PENDING booking on backend
 * 2. Request a PaymentIntent for that booking
 * 3. Confirm payment with Stripe
 * 4. Call `onSuccess(paymentIntentId, bookingId)` so parent can confirm booking
 * If payment or payment-intent creation fails after booking creation, the pending
 * booking will be cancelled (voided) by calling the cancel booking endpoint.
 */

import type { BookingFormState } from "../../types/booking";
import {
  useCreateBookingMutation,
  useCreatePaymentIntentMutation,
  useVoidBookingMutation,
} from "../../store/api/bookingApi";

type StripePaymentFormProps = {
  amount: number; // Amount in dollars
  bookingData: BookingFormState; // booking details to create pending booking
  onSuccess: (paymentIntentId: string, bookingId: string) => void; // called after payment confirmed
  onError: (error: string) => void;
  disabled?: boolean; // External disable control (e.g., while confirming booking)
};

function StripePaymentForm({
  bookingData,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [createBooking] = useCreateBookingMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [voidBooking] = useVoidBookingMutation();

  // Handle terms checkbox
  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked);
  };

  // Handle CardElement change events to track when card info is complete
  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  /**
   * Handles payment processing
   * 1. Calls backend to create PaymentIntent
   * 2. Uses clientSecret from backend
   * 3. Confirms payment with Stripe
   */
  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }
    let pendingBookingId: string | null = null;

    try {
      // Step 1: Create a PENDING booking on the backend
      const createReq = {
        roomTypeId: bookingData.roomTypeId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: bookingData.numberOfGuests, 
        promoCode: bookingData.promoCode
      };

      const pendingBooking = await createBooking(createReq).unwrap();
      pendingBookingId = pendingBooking.id;

      // Step 2: Create PaymentIntent for that booking on backend
      const { clientSecret } = await createPaymentIntent({
        bookingId: pendingBookingId,
      }).unwrap();

      // Step 3: Confirm payment with Stripe using the client secret
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

      if (confirmError) {
        // Payment failed — void/cancel the pending booking
        setError(confirmError.message || "Payment failed");
        onError(confirmError.message || "Payment failed");
        try {
          if (pendingBookingId) {
            await voidBooking(pendingBookingId).unwrap();
          }
        } catch (cancelErr) {
          console.error(
            "Failed to void pending booking after payment failure:",
            cancelErr
          );
        }
        setProcessing(false);
        return;
      }

      // Step 4: Payment successful — delegate confirmation to parent
      console.log("Payment successful:", paymentIntent);
      onSuccess(paymentIntent.id, pendingBookingId as string);
      setProcessing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
      onError(errorMessage);
      // If booking was created but we hit an error before confirming, mark it void/cancelled
      if (pendingBookingId) {
        try {
          await voidBooking(pendingBookingId).unwrap();
        } catch (cancelErr) {
          console.error(
            "Failed to void pending booking after error:",
            cancelErr
          );
        }
      }
      setProcessing(false);
    }
  };

  return (
    <Box>
      {/* Stripe Card Element */}
      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          mb: 2,
          "& .StripeElement": {
            padding: "12px",
          },
          "& .StripeElement--focus": {
            borderColor: "primary.main",
          },
        }}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
            hidePostalCode: false,
          }}
          onChange={handleCardChange}
        />
      </Box>

      {/* Card Validation Error */}
      {cardError && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {cardError}
        </Alert>
      )}

      {/* Payment Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Processing State */}
      {processing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Alert severity='info' sx={{ flex: 1 }}>
            Processing payment...
          </Alert>
        </Box>
      )}

      <FormControlLabel
        control={
          <Checkbox checked={termsAccepted} onChange={handleTermsChange} />
        }
        label='I agree to the terms and conditions'
      />

      {/* Pay Now Button */}
      <Button
        variant='contained'
        size='large'
        fullWidth
        disabled={!stripe || processing || !termsAccepted || !cardComplete || disabled}
        onClick={handlePayment}
      >
        {processing ? "Processing..." : "Pay Now to Confirm Booking"}
      </Button>
    </Box>
  );
}

export default StripePaymentForm;
export type { StripePaymentFormProps };

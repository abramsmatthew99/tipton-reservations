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
 * @param amount - Total amount in dollars (will be converted to cents)
 * @param onSuccess - Callback when payment succeeds (receives paymentId)
 * @param onError - Callback when payment fails (receives error message)
 */

type StripePaymentFormProps = {
  amount: number; // Amount in dollars
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
};

function StripePaymentForm({
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Handle terms checkbox
  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked);
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

    try {
      // Step 1: Create PaymentIntent on backend
      const response = await fetch("http://localhost:8080/payments/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "usd",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm payment with Stripe using the client secret
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        onError(confirmError.message || "Payment failed");
        setProcessing(false);
        return;
      }

      // Step 3: Payment successful
      console.log("Payment successful:", paymentIntent);
      onSuccess(paymentIntent.id);
      setProcessing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
      onError(errorMessage);
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
        />
      </Box>

      {/* Error Alert */}
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

      {/* Test Card Info */}
      <Alert severity='info' sx={{ fontSize: "0.875rem", mb: 2 }}>
        <strong>Test Card:</strong> 4242 4242 4242 4242 | Exp: Any future date |
        CVC: Any 3 digits
      </Alert>

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
        disabled={!stripe || processing || !termsAccepted}
        onClick={handlePayment}
      >
        {processing ? "Processing..." : "Pay Now & Confirm Booking"}
      </Button>
    </Box>
  );
}

export default StripePaymentForm;
export type { StripePaymentFormProps };

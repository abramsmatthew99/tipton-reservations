import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { BookingResponse } from "../../types/booking";
import {
  useModifyBookingMutation,
  useCreateModifyPaymentIntentMutation,
} from "../../store/api/bookingApi";

interface ModifyBookingDialogProps {
  booking: BookingResponse;
  open: boolean;
  onClose: () => void;
}

function ModifyBookingDialog({
  booking,
  open,
  onClose,
}: ModifyBookingDialogProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(
    dayjs(booking.checkInDate)
  );
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(
    dayjs(booking.checkOutDate)
  );
  const [guestCount, setGuestCount] = useState<number>(
    booking.numberOfGuests
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modifyBooking, { isLoading }] = useModifyBookingMutation();
  const [createModifyPaymentIntent] = useCreateModifyPaymentIntentMutation();

  // Calculate price preview (client-side)
  const newPrice = useMemo(() => {
    if (!checkInDate || !checkOutDate) return null;

    const numNights = checkOutDate.diff(checkInDate, "day");
    if (numNights <= 0) return null;

    // Extract base price from booking (total / nights)
    const originalNights = dayjs(booking.checkOutDate).diff(
      dayjs(booking.checkInDate),
      "day"
    );
    const basePrice = parseFloat(booking.totalPrice) / originalNights;

    return numNights * basePrice;
  }, [checkInDate, checkOutDate, booking]);

  const priceDifference = useMemo(() => {
    if (newPrice === null) return null;
    return newPrice - parseFloat(booking.totalPrice);
  }, [newPrice, booking.totalPrice]);

  const isValidDateRange = useMemo(() => {
    if (!checkInDate || !checkOutDate) return false;
    return checkOutDate.isAfter(checkInDate);
  }, [checkInDate, checkOutDate]);

  const isCheckInPast = useMemo(() => {
    if (!checkInDate) return false;
    return checkInDate.isBefore(dayjs(), "day");
  }, [checkInDate]);

  const maxOccupancy = booking.roomTypeMaxOccupancy ?? booking.numberOfGuests;
  const isGuestCountInvalid =
    guestCount < 1 || guestCount > maxOccupancy;

  const handleSubmit = async () => {
    if (!checkInDate || !checkOutDate || !isValidDateRange) return;
    if (isGuestCountInvalid) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const checkIn = checkInDate.format("YYYY-MM-DD");
      const checkOut = checkOutDate.format("YYYY-MM-DD");
      const requiresPayment =
        priceDifference !== null && priceDifference > 0.01;

      if (requiresPayment) {
        if (!stripe || !elements) {
          setErrorMessage("Payment system is not ready. Please try again.");
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setErrorMessage("Card element not found. Please try again.");
          return;
        }

        const { clientSecret } = await createModifyPaymentIntent({
          id: booking.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guestCount,
        }).unwrap();

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement },
          });

        if (confirmError || !paymentIntent) {
          setErrorMessage(
            confirmError?.message || "Payment failed. Please try again."
          );
          return;
        }

        await modifyBooking({
          id: booking.id,
          request: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: guestCount,
            paymentIntentId: paymentIntent.id,
          },
        }).unwrap();
      } else {
        await modifyBooking({
          id: booking.id,
          request: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: guestCount,
          },
        }).unwrap();
      }

      // Close dialog on success
      onClose();
    } catch (err: any) {
      console.error("Error modifying booking:", err);
      const message =
        err?.data?.message || "Failed to modify booking. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset to original dates
    setCheckInDate(dayjs(booking.checkInDate));
    setCheckOutDate(dayjs(booking.checkOutDate));
    setGuestCount(booking.numberOfGuests);
    setErrorMessage(null);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Modify Booking Dates</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Current Dates Section */}
            <Box>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                gutterBottom
              >
                Current Dates
              </Typography>
              <Typography variant='body2'>
                {dayjs(booking.checkInDate).format("MMM D, YYYY")} -{" "}
                {dayjs(booking.checkOutDate).format("MMM D, YYYY")}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {dayjs(booking.checkOutDate).diff(
                  dayjs(booking.checkInDate),
                  "day"
                )}{" "}
                nights • ${parseFloat(booking.totalPrice).toFixed(2)}
              </Typography>
            </Box>

            <Divider />

            {/* New Dates Section */}
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                New Dates
              </Typography>
              <Stack spacing={2}>
                <DatePicker
                  label='Check-in Date'
                  value={checkInDate}
                  onChange={(newValue) => {
                    if (newValue && dayjs.isDayjs(newValue)) {
                      setCheckInDate(newValue);
                    }
                  }}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: isCheckInPast,
                      helperText: isCheckInPast
                        ? "Check-in date cannot be in the past"
                        : "",
                    },
                  }}
                />
                <DatePicker
                  label='Check-out Date'
                  value={checkOutDate}
                  onChange={(newValue) => {
                    if (newValue && dayjs.isDayjs(newValue)) {
                      setCheckOutDate(newValue);
                    }
                  }}
                  minDate={checkInDate?.add(1, "day")}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: checkOutDate ? !isValidDateRange : false,
                      helperText:
                        checkOutDate && !isValidDateRange
                          ? "Check-out must be after check-in"
                          : "",
                    },
                  }}
                />
                <TextField
                  label='Guests'
                  select
                  fullWidth
                  value={guestCount}
                  onChange={(event) => setGuestCount(Number(event.target.value))}
                  error={isGuestCountInvalid}
                  helperText={
                    isGuestCountInvalid
                      ? `Guests must be between 1 and ${maxOccupancy}`
                      : ""
                  }
                >
                  {Array.from({ length: maxOccupancy }, (_, index) => index + 1).map(
                    (value) => (
                      <MenuItem key={value} value={value}>
                        {value} {value === 1 ? "Guest" : "Guests"}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Stack>
            </Box>

            {/* Price Preview */}
            {newPrice !== null && isValidDateRange && (
              <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Price Preview
                </Typography>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Typography variant='body2'>
                    {checkOutDate!.diff(checkInDate!, "day")} nights
                  </Typography>
                  <Typography variant='h6' fontWeight={600}>
                    ${newPrice.toFixed(2)}
                  </Typography>
                </Stack>

                {priceDifference !== null &&
                  Math.abs(priceDifference) > 0.01 && (
                    <Typography
                      variant='caption'
                      color={
                        priceDifference > 0 ? "error.main" : "success.main"
                      }
                      sx={{ mt: 1, display: "block" }}
                    >
                      {priceDifference > 0 ? "+" : ""}$
                      {Math.abs(priceDifference).toFixed(2)}{" "}
                      {priceDifference > 0
                        ? "(charge will incur)"
                        : "(refund will be issued)"}
                    </Typography>
                  )}
              </Box>
            )}

            {priceDifference !== null && priceDifference > 0.01 && (
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  Payment for Date Change
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
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
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Policy Warning */}
            <Alert severity='info' icon={false}>
              <Typography variant='caption'>
                Changes can only be made at least 24 hours before check-in time
                (3:00 PM) in the hotel's local time. You may only change the
                dates for this booking. If you wish to change the room type,
                please cancel and make a new reservation.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading || isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={
              isLoading || isSubmitting || !isValidDateRange || isGuestCountInvalid
            }
          >
            {isLoading || isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={8000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity='error'
            onClose={() => setErrorMessage(null)}
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Dialog>
    </LocalizationProvider>
  );
}

export default ModifyBookingDialog;

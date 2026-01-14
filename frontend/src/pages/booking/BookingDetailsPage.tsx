import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import type { BookingStatus } from "../../types/booking";
import { formatDate } from "../../util/helper";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../config/stripe";
import {
  useGetBookingByIdQuery,
  useCancelBookingMutation,
} from "../../store/api/bookingApi";
import ModifyBookingDialog from "../../components/Booking/ModifyBookingDialog";

// Hotel check-in/check-out policy times
const CHECK_IN_TIME = "3:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

/**
 * Booking Details Page
 *
 * Displays full details of a single booking.
 * Uses RTK Query for data fetching and mutations.
 */
function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useGetBookingByIdQuery(id!, { skip: !id });

  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

  const getStatusChip = (status: BookingStatus) => {
    const statusConfig = {
      CONFIRMED: { color: "success" as const, label: "Confirmed" },
      PENDING: { color: "warning" as const, label: "Pending" },
      CANCELLED: { color: "error" as const, label: "Cancelled" },
      COMPLETED: { color: "info" as const, label: "Completed" },
      VOIDED: { color: "default" as const, label: "Voided" },
    };

    const config = statusConfig[status];
    return <Chip label={config.label} color={config.color} />;
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      await cancelBooking(booking.id).unwrap();
      setCancelDialogOpen(false);
      navigate("/customer/bookings");
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      console.log("Error structure:", {
        status: err?.status,
        data: err?.data,
        message: err?.data?.message,
        error: err?.error,
      });
      setCancelDialogOpen(false);

      // Show the backend error message directly
      const message =
        err?.data?.message || "Failed to cancel booking. Please try again.";
      setErrorMessage(message);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth='md' sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          Loading booking details...
        </Typography>
      </Container>
    );
  }

  if (isError || !booking) {
    const errorMessage =
      error && "data" in error
        ? String(
            (error.data as { message?: string })?.message || "Booking not found"
          )
        : "Failed to load booking details. Please try again later.";

    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error'>
          {errorMessage}
          <Typography variant='body2' sx={{ mt: 1 }}>
            <Link to='/customer/bookings'>Return to My Bookings</Link>
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        variant='text'
        onClick={() => navigate("/customer/bookings")}
        sx={{ mb: 2 }}
      >
        ← Back to My Bookings
      </Button>

      {/* Booking Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant='h4'>Booking Details</Typography>
        {getStatusChip(booking.status)}
      </Box>

      {/* Booking Information Card */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Confirmation Number */}
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Confirmation Number
              </Typography>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                {booking.confirmationNumber}
              </Typography>
            </Box>

            <Divider />

            {/* Room Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Room Information
              </Typography>
              <Typography variant='body1' gutterBottom>
                {booking.roomTypeName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Room Number: {booking.roomNumber}
              </Typography>
            </Box>

            <Divider />

            {/* Stay Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Stay Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Check-in
                  </Typography>
                  <Typography variant='body1'>
                    {formatDate(booking.checkInDate)} at {CHECK_IN_TIME}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Check-out
                  </Typography>
                  <Typography variant='body1'>
                    {formatDate(booking.checkOutDate)} at {CHECK_OUT_TIME}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Number of Guests
                  </Typography>
                  <Typography variant='body1'>
                    {booking.numberOfGuests}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Payment Details */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Payment Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant='body1'>Total Amount</Typography>
                  <Typography
                    variant='h5'
                    color='secondary.main'
                    sx={{ fontWeight: 600 }}
                  >
                    ${parseFloat(booking.totalPrice).toFixed(2)}
                  </Typography>
                </Box>
                {booking.paymentId && (
                  <Typography variant='caption' color='text.secondary'>
                    Payment ID: {booking.paymentId}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Booking Metadata */}
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Booked on: {new Date(booking.createdAt).toLocaleString()}
              </Typography>
              {booking.updatedAt !== booking.createdAt && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                >
                  Last updated: {new Date(booking.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            {booking.status === "CONFIRMED" && (
              <>
                <Divider />

                {/* Policy Warning */}
                <Alert severity='info' icon={<InfoIcon />}>
                  <Typography variant='body2'>
                    <strong>Cancellation & Modification Policy:</strong> Changes
                    can only be made at least 24 hours before check-in time (
                    {CHECK_IN_TIME}) in the hotel's local time (Pacific Standard
                    Time).
                  </Typography>
                </Alert>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant='outlined'
                    color='primary'
                    onClick={() => setModifyDialogOpen(true)}
                  >
                    Modify Booking
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel Booking
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Modify Booking Dialog */}
      <Elements stripe={stripePromise}>
        <ModifyBookingDialog
          booking={booking}
          open={modifyDialogOpen}
          onClose={() => setModifyDialogOpen(false)}
        />
      </Elements>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be
            undone. Your confirmation number is {booking.confirmationNumber}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={isCancelling}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            color='error'
            variant='contained'
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
}

export default BookingDetailsPage;

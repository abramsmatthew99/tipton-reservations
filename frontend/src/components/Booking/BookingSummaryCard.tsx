import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { formatDate } from "../../util/helper";
import type { BookingFormState } from "../../types/booking";

/**
 * Displays booking details including room image, room type info,
 * check-in/out dates, number of guests, and price breakdown.
 */

// Hotel check-in/check-out policy times
const CHECK_IN_TIME = "3:00 PM";
const CHECK_OUT_TIME = "11:00 AM";

function BookingSummaryCard({
  bookingData,
}: {
  bookingData: BookingFormState;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Booking Summary
        </Typography>

        {/* Room Image */}
        {bookingData.roomTypeImage && (
          <Box
            component='img'
            src={bookingData.roomTypeImage}
            alt={bookingData.roomTypeName}
            sx={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              borderRadius: 1,
              mb: 2,
            }}
          />
        )}

        {/* Room Details */}
        <Typography variant='h6'>{bookingData.roomTypeName}</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {bookingData.roomTypeDescription}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Booking Details */}
        <Box sx={{ mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Check-in
          </Typography>
          <Typography>{formatDate(bookingData.checkInDate)}</Typography>
          <Typography variant='caption' color='text.secondary'>
            {CHECK_IN_TIME}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Check-out
          </Typography>
          <Typography>{formatDate(bookingData.checkOutDate)}</Typography>
          <Typography variant='caption' color='text.secondary'>
            {CHECK_OUT_TIME}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Guests
          </Typography>
          <Typography>{bookingData.numberOfGuests}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Price Breakdown */}
        <Box sx={{ mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            ${bookingData.basePrice.toFixed(2)} × {bookingData.numberOfNights}{" "}
            nights
          </Typography>
          <Typography variant='h6' sx={{ color: '#bc6c25', fontWeight: 600 }}>
            ${bookingData.totalPrice.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BookingSummaryCard;

import { Card, CardContent, Typography, Box, Divider, IconButton, MobileStepper } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useState } from "react";
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
  const images = bookingData.roomTypeImages ||
                 (bookingData.roomTypeImage ? [bookingData.roomTypeImage] : []);
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Booking Summary
        </Typography>

        {/* Room Images Carousel */}
        {images.length > 0 && (
          <Box sx={{ mb: 2, position: 'relative' }}>
            <Box
              component='img'
              src={images[activeStep]}
              alt={`${bookingData.roomTypeName} - ${activeStep + 1}`}
              sx={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 1,
              }}
            />
            {images.length > 1 && (
              <>
                <MobileStepper
                  steps={maxSteps}
                  position="static"
                  activeStep={activeStep}
                  sx={{
                    background: 'transparent',
                    justifyContent: 'center',
                    mt: 1
                  }}
                  nextButton={
                    <IconButton
                      size="small"
                      onClick={handleNext}
                      disabled={activeStep === maxSteps - 1}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  }
                  backButton={
                    <IconButton
                      size="small"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                  }
                />
              </>
            )}
          </Box>
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
          <Typography
            variant='h6'
            color='secondary.main'
            sx={{ fontWeight: 600 }}
          >
            ${bookingData.totalPrice.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BookingSummaryCard;

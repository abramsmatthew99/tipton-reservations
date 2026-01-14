package com.group1.tipton_reservations.service;

import com.group1.tipton_reservations.dto.booking.BookingResponse;
import com.group1.tipton_reservations.dto.booking.CreateBookingRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingPaymentIntentRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingRequest;
import com.group1.tipton_reservations.dto.payment.PaymentIntentResponse;
import com.group1.tipton_reservations.model.Booking;
import com.group1.tipton_reservations.model.Payment;
import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.model.enums.BookingStatus;
import com.group1.tipton_reservations.model.enums.PaymentStatus;
import com.group1.tipton_reservations.repository.BookingRepository;
import com.group1.tipton_reservations.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;


// TODO: replace ResponseStatusException with appropriate custom exceptions + GlobalExceptionHandler
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    // Hotel timezone - all booking operations use this timezone for consistency
    private static final ZoneId HOTEL_TIMEZONE = ZoneId.of("America/Los_Angeles"); // Pacific Standard Time (for CA)
    private static final int CHECK_IN_HOUR = 15; // 3:00 PM check-in time

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final RoomTypeService roomTypeService;
    private final RoomService roomService;
    private final StripeService stripeService;

    /**
     * Creates a new booking.
     * Uses @Transactional to prevent race conditions and ensure atomicity.
     *
     * @param request the booking creation request
     * @param userId the authenticated user's ID
     * @return the created booking response
     * @throws ResponseStatusException if validation fails or room is unavailable
     */
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        // validate date range
        validateDateRange(request.getCheckInDate(), request.getCheckOutDate());

        // validate user exists and is active
        User user;
        try {
            user = userService.findUserById(userId);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with ID: " + userId
            );
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is not active"
            );
        }

        // validate room type exists
        RoomType roomType;
        try {
            roomType = roomTypeService.findRoomTypeById(request.getRoomTypeId());
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Room type not found with ID: " + request.getRoomTypeId()
            );
        }

        // validate number of guests is not greater than room capacity
        if (request.getNumberOfGuests() > roomType.getMaxOccupancy()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("Number of guests (%d) exceeds maximum occupancy (%d) for this room type",
                            request.getNumberOfGuests(), roomType.getMaxOccupancy())
            );
        }

        // find and assign an available room of this type
        Room assignedRoom;
        try {
            assignedRoom = roomService.findAvailableRoom(
                    request.getRoomTypeId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );
        } catch (RuntimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No rooms available for this room type during the selected dates"
            );
        }

        // calculate total price based on room type and number of nights
        BigDecimal totalPrice = calculateTotalPrice(
                roomType.getBasePrice(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        // create booking entity
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setRoomTypeId(request.getRoomTypeId());
        booking.setRoomId(assignedRoom.getId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setStatus(BookingStatus.PENDING);  // Booking starts as PENDING until payment is confirmed
        booking.setConfirmationNumber(generateConfirmationNumber());
        booking.setTotalPrice(totalPrice);

        // save booking (within transaction - ensures atomicity)
        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    /**
     * Retrieves a booking by its ID.
     * Requires user to own the booking or be an admin
     *
     * @param bookingId the booking ID
     * @return the booking response
     * @throws ResponseStatusException if booking not found or unauthorized
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        return mapToResponse(booking);
    }

    /**
     * Retrieves a booking by its confirmation number.
     * Requires user to own the booking or be an admin
     *
     * @param confirmationNumber the booking confirmation number
     * @return the booking response
     * @throws ResponseStatusException if booking not found or unauthorized
     */
    @PreAuthorize("@bookingSecurity.isOwnerByConfirmation(#confirmationNumber)")
    public BookingResponse getBookingByConfirmationNumber(String confirmationNumber) {
        Booking booking = bookingRepository.findByConfirmationNumber(confirmationNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with confirmation number: " + confirmationNumber
                ));

        return mapToResponse(booking);
    }

    /**
     * Retrieves all bookings for a user with pagination.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of booking responses
     */
    public Page<BookingResponse> getUserBookings(String userId, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByUserId(userId, pageable);
        return bookings.map(this::mapToResponse);
    }

    /**
     * Retrieves all bookings.
     * Admin-only operation.
     *
     * @return list of booking responses
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();

        List<String> userIds = bookings.stream()
                .map(Booking::getUserId)
                .distinct()
                .toList();

        List<User> users = userService.findUsersByIds(userIds);

        Map<String, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Map bookings to response, passing the specific user object
        return bookings.stream()
                .map(booking -> mapToResponse(booking, userMap.get(booking.getUserId())))
                .toList();
    }

    /**
     * Modifies an existing booking's dates.
     * Validates new dates and checks availability for the new date range.
     * Requires user to own the booking or be an admin
     *
     * @param bookingId the booking ID
     * @param request the modification request containing new dates
     * @return the updated booking response
     * @throws ResponseStatusException if booking not found, dates invalid, or room unavailable
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse modifyBooking(String bookingId, ModifyBookingRequest request) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        BigDecimal newTotalPrice = calculateNewTotalForModification(
                booking,
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getNumberOfGuests()
        );

        // update booking dates
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());

        // recalculate total price based on new dates
        BigDecimal oldTotalPrice = booking.getTotalPrice();
        booking.setTotalPrice(newTotalPrice);

        // Handle price differences with Stripe
        if (!newTotalPrice.equals(oldTotalPrice)) {
            BigDecimal priceDifference = newTotalPrice.subtract(oldTotalPrice);

            if (priceDifference.compareTo(BigDecimal.ZERO) < 0) {
                // Price decreased - issue partial refund across payments
                refundPaymentsForBooking(booking, priceDifference.abs());
                log.info("Partial refund of ${} issued for booking {}",
                        priceDifference.abs(), bookingId);
            } else if (priceDifference.compareTo(BigDecimal.ZERO) > 0) {
                // Price increased - require payment intent and verify
                String paymentIntentId = request.getPaymentIntentId();
                if (paymentIntentId == null || paymentIntentId.isBlank()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Additional payment is required to extend this booking"
                    );
                }

                verifyPaymentIntentAmount(paymentIntentId, priceDifference);

                Payment payment = new Payment();
                payment.setBookingId(booking.getId());
                payment.setUserId(booking.getUserId());
                payment.setStripePaymentIntentId(paymentIntentId);
                payment.setAmount(priceDifference);
                payment.setCurrency("usd");
                payment.setStatus(PaymentStatus.COMPLETED);
                paymentRepository.save(payment);
            }
        }

        // save updated booking
        Booking updatedBooking = saveBookingWithRetry(
                booking,
                "Failed to update booking after processing modification payments. Please contact support with booking confirmation: " +
                        booking.getConfirmationNumber()
        );

        return mapToResponse(updatedBooking);
    }

    /**
     * Cancels a booking.
     * Requires user to own the booking or be an admin.
     * Enforces 24-hour cancellation policy (using hotel's local timezone) and processes full refund.
     *
     * @param bookingId the booking ID
     * @return the cancelled booking response
     * @throws ResponseStatusException if booking not found, already cancelled, or within 24 hours of check-in
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse cancelBooking(String bookingId) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        // verify booking is CONFIRMED (only confirmed bookings can be cancelled)
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only CONFIRMED bookings can be cancelled. Current status: " + booking.getStatus()
            );
        }

        // Enforce 24-hour cancellation policy using HOTEL'S local timezone
        // This ensures consistent policy enforcement regardless of user's timezone
        ZonedDateTime nowHotelTime = ZonedDateTime.now(HOTEL_TIMEZONE);
        ZonedDateTime checkInDateTime = booking.getCheckInDate()
                .atTime(CHECK_IN_HOUR, 0)
                .atZone(HOTEL_TIMEZONE);
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(nowHotelTime, checkInDateTime);

        if (hoursUntilCheckIn < 24) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a z");
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancellations must be made at least 24 hours before check-in time (hotel local time). " +
                    "Check-in is at " + checkInDateTime.format(formatter)
            );
        }

        // Process Stripe refund for full remaining paid amount
        refundPaymentsForBooking(booking, booking.getTotalPrice());

        // Update status to cancelled
        // Implicitly makes room available for new bookings (repository checks for "PENDING" or "CONFIRMED")
        booking.setStatus(BookingStatus.CANCELLED);

        // Save updated booking
        Booking cancelledBooking = saveBookingWithRetry(
                booking,
                "Refund processed but booking cancellation could not be saved. Please contact support with booking confirmation: " +
                        booking.getConfirmationNumber()
        );

        log.info("Booking {} cancelled successfully. Refund processed: {}",
                bookingId, booking.getPaymentId() != null);

        return mapToResponse(cancelledBooking);
    }

    /**
     * Creates a PaymentIntent for booking modification if price increases.
     *
     * @param bookingId the booking ID
     * @param request modification request with new dates
     * @return PaymentIntentResponse containing client secret
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public PaymentIntentResponse createModifyPaymentIntent(
            String bookingId,
            ModifyBookingPaymentIntentRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        BigDecimal newTotalPrice = calculateNewTotalForModification(
                booking,
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getNumberOfGuests()
        );

        BigDecimal priceDifference = newTotalPrice.subtract(booking.getTotalPrice());
        if (priceDifference.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No additional payment is required for the selected dates"
            );
        }

        try {
            String clientSecret = stripeService.createPaymentIntentForAmount(
                    priceDifference,
                    "usd",
                    booking
            ).getClientSecret();
            return new PaymentIntentResponse(clientSecret);
        } catch (com.stripe.exception.StripeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Failed to create payment intent: " + e.getMessage()
            );
        }
    }

    /**
     * Voids a booking due to payment failure or incomplete checkout.
     * Requires user to own the booking or be an admin.
     *
     * @param bookingId the booking ID
     * @return the voided booking response
     * @throws ResponseStatusException if booking not found, not pending, or already voided/cancelled/confirmed
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse voidBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        if (booking.getStatus() == BookingStatus.VOIDED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already voided"
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancelled bookings cannot be voided"
            );
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be voided. Current status: " + booking.getStatus()
            );
        }

        booking.setStatus(BookingStatus.VOIDED);
        Booking voidedBooking = bookingRepository.save(booking);

        return mapToResponse(voidedBooking);
    }

    /**
     * Confirms a pending booking after successful payment.
     * Verifies payment with Stripe before confirming the booking.
     * Updates the booking status from PENDING to CONFIRMED and links the payment.
     * Requires user to own the booking or be an admin.
     *
     * @param bookingId the booking ID
     * @param paymentIntentId the Stripe payment intent ID from successful payment
     * @return the confirmed booking response
     * @throws ResponseStatusException if booking not found, not pending, payment verification fails, or unauthorized
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse confirmBooking(String bookingId, String paymentIntentId) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        // verify booking is in PENDING status
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Can only confirm bookings with PENDING status. Current status: " + booking.getStatus()
            );
        }

        // verify payment with Stripe
        try {
            com.stripe.model.PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);

            // check if payment actually succeeded
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment not confirmed by Stripe. Payment status: " + paymentIntent.getStatus()
                );
            }

            // verify payment amount matches booking total (Stripe uses cents)
            long expectedAmountInCents = booking.getTotalPrice().multiply(new BigDecimal("100")).longValue();
            if (!paymentIntent.getAmount().equals(expectedAmountInCents)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment amount mismatch. Expected: " + expectedAmountInCents + " cents, Got: " + paymentIntent.getAmount() + " cents"
                );
            }
        } catch (com.stripe.exception.StripeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Failed to verify payment with Stripe: " + e.getMessage()
            );
        }

        // update status to confirmed and link payment
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentId(paymentIntentId);

        // save updated booking
        Booking confirmedBooking = bookingRepository.save(booking);

        if (paymentRepository.findByStripePaymentIntentId(paymentIntentId).isEmpty()) {
            Payment payment = new Payment();
            payment.setBookingId(confirmedBooking.getId());
            payment.setUserId(confirmedBooking.getUserId());
            payment.setStripePaymentIntentId(paymentIntentId);
            payment.setAmount(confirmedBooking.getTotalPrice());
            payment.setCurrency("usd");
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
        }

        return mapToResponse(confirmedBooking);
    }

    /**
     * Validates that check-out date is after check-in date.
     *
     * @param checkInDate the check-in date
     * @param checkOutDate the check-out date
     * @throws ResponseStatusException if check-out is not after check-in
     */
    private void validateDateRange(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkOutDate == null || checkInDate == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-in and check-out dates are required"
            );
        }

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-out date must be after check-in date"
            );
        }
    }

    /**
     * Calculates the total price for a booking based on the room type's base price and number of nights.
     *
     * @param basePrice the room type's base price per night
     * @param checkInDate the check-in date
     * @param checkOutDate the check-out date
     * @return the total price for the booking
     */
    private BigDecimal calculateTotalPrice(BigDecimal basePrice, LocalDate checkInDate, LocalDate checkOutDate) {
        long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        return basePrice.multiply(BigDecimal.valueOf(numberOfNights));
    }

    private BigDecimal calculateNewTotalForModification(
            Booking booking,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer numberOfGuests) {
        // verify booking is confirmed (only confirmed bookings can be modified)
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Can only modify confirmed bookings"
            );
        }

        // Enforce 24-hour policy using hotel timezone (same as cancel)
        ZonedDateTime nowHotelTime = ZonedDateTime.now(HOTEL_TIMEZONE);
        ZonedDateTime checkInDateTime = booking.getCheckInDate()
                .atTime(CHECK_IN_HOUR, 0)
                .atZone(HOTEL_TIMEZONE);
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(nowHotelTime, checkInDateTime);

        if (hoursUntilCheckIn < 24) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a z");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Modifications must be made at least 24 hours before check-in time (hotel local time). " +
                            "Check-in is at " + checkInDateTime.format(formatter));
        }

        // verify check-in date hasn't passed (can't modify past/current bookings)
        LocalDate todayHotel = LocalDate.now(HOTEL_TIMEZONE);
        if (booking.getCheckInDate().isBefore(todayHotel) ||
            booking.getCheckInDate().isEqual(todayHotel)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot modify a booking that has already started or is starting today"
            );
        }

        // validate new date range
        validateDateRange(checkInDate, checkOutDate);

        // check if assigned room is available for new dates
        if (booking.getRoomId() != null) {
            List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                    booking.getRoomId(),
                    checkInDate,
                    checkOutDate
            );

            // filter out the current booking from overlapping bookings
            overlappingBookings = overlappingBookings.stream()
                    .filter(b -> !b.getId().equals(booking.getId()))
                    .toList();

            if (!overlappingBookings.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The assigned room is not available for the new dates"
                );
            }
        }

        RoomType roomType = roomTypeService.findRoomTypeById(booking.getRoomTypeId());

        if (numberOfGuests == null || numberOfGuests < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Number of guests must be at least 1"
            );
        }

        if (numberOfGuests > roomType.getMaxOccupancy()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("Number of guests (%d) exceeds maximum occupancy (%d) for this room type",
                            numberOfGuests, roomType.getMaxOccupancy())
            );
        }

        return calculateTotalPrice(roomType.getBasePrice(), checkInDate, checkOutDate);
    }

    private void verifyPaymentIntentAmount(String paymentIntentId, BigDecimal expectedAmount) {
        try {
            com.stripe.model.PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);

            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment not confirmed by Stripe. Payment status: " + paymentIntent.getStatus()
                );
            }

            long expectedAmountInCents = expectedAmount.multiply(new BigDecimal("100")).longValue();
            if (!paymentIntent.getAmount().equals(expectedAmountInCents)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment amount mismatch. Expected: " + expectedAmountInCents + " cents, Got: " + paymentIntent.getAmount() + " cents"
                );
            }
        } catch (com.stripe.exception.StripeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Failed to verify payment with Stripe: " + e.getMessage()
            );
        }
    }

    private void refundPaymentsForBooking(Booking booking, BigDecimal refundAmount) {
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        List<Payment> payments = paymentRepository.findByBookingIdOrderByCreatedAtDesc(booking.getId());
        BigDecimal remaining = refundAmount;

        for (Payment payment : payments) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            if (payment.getStatus() == PaymentStatus.REFUNDED || payment.getStatus() == PaymentStatus.FAILED) {
                continue;
            }

            BigDecimal refundedAmount = payment.getRefundedAmount() != null
                    ? payment.getRefundedAmount()
                    : BigDecimal.ZERO;
            BigDecimal remainingForPayment = payment.getAmount().subtract(refundedAmount);

            if (remainingForPayment.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal refundForPayment = remaining.min(remainingForPayment);
            long refundAmountInCents = refundForPayment.multiply(new BigDecimal("100")).longValue();

            try {
                stripeService.createRefund(payment.getStripePaymentIntentId(), refundAmountInCents);
            } catch (com.stripe.exception.StripeException e) {
                log.error("Stripe refund failed for booking {}: {}", booking.getId(), e.getMessage());
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to process refund. Please contact support with booking confirmation: " +
                        booking.getConfirmationNumber()
                );
            }

            BigDecimal newRefundedAmount = refundedAmount.add(refundForPayment);
            payment.setRefundedAmount(newRefundedAmount);
            payment.setRefundedAt(LocalDateTime.now());
            if (newRefundedAmount.compareTo(payment.getAmount()) >= 0) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }
            paymentRepository.save(payment);

            remaining = remaining.subtract(refundForPayment);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            if (booking.getPaymentId() != null && payments.isEmpty()) {
                try {
                    long refundAmountInCents = remaining.multiply(new BigDecimal("100")).longValue();
                    stripeService.createRefund(booking.getPaymentId(), refundAmountInCents);
                    remaining = BigDecimal.ZERO;
                } catch (com.stripe.exception.StripeException e) {
                    log.error("Stripe refund failed for booking {}: {}", booking.getId(), e.getMessage());
                    throw new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to process refund. Please contact support with booking confirmation: " +
                            booking.getConfirmationNumber()
                    );
                }
            }
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to process full refund. Please contact support with booking confirmation: " +
                    booking.getConfirmationNumber()
            );
        }
    }

    private Booking saveBookingWithRetry(Booking booking, String errorMessage) {
        int attempts = 0;
        RuntimeException lastException = null;

        while (attempts < 3) {
            try {
                return bookingRepository.save(booking);
            } catch (RuntimeException e) {
                lastException = e;
                attempts++;
            }
        }

        log.error("Booking save failed after retries for booking {}: {}",
                booking.getId(),
                lastException != null ? lastException.getMessage() : "unknown error");

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
    }

    /**
     * Generates a unique confirmation number for a booking.
     * Format: TIP-XXXXXX (where X is alphanumeric)
     *
     * @return a unique confirmation number
     */
    private String generateConfirmationNumber() {
        String confirmationNumber;
        do {
            // Generate 6-character alphanumeric code
            String randomCode = UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase();
            confirmationNumber = "TIP-" + randomCode;
        } while (bookingRepository.existsByConfirmationNumber(confirmationNumber));

        return confirmationNumber;
    }

    /**
     * Standard mapping - fetches user from DB individually.
     * Used for single booking operations (getById, create, etc.)
     */
    private BookingResponse mapToResponse(Booking booking) {
        return mapToResponse(booking, null);
    }

    /**
     * Optimized mapping - uses provided user object if available.
     * Used for bulk operations to avoid N+1 queries.
     */
    private BookingResponse mapToResponse(Booking booking, User preFetchedUser) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setConfirmationNumber(booking.getConfirmationNumber());
        response.setUserId(booking.getUserId());
        
        // --- POPULATE GUEST INFO ---
        try {
            User user = (preFetchedUser != null) 
                ? preFetchedUser 
                : userService.findUserById(booking.getUserId());
                
            if (user != null) {
                response.setGuestFirstName(user.getFirstName());
                response.setGuestLastName(user.getLastName());
                response.setGuestEmail(user.getEmail());
            }
        } catch (Exception e) {
            response.setGuestFirstName("Unknown");
            response.setGuestLastName("User");
            response.setGuestEmail("N/A");
        }

        response.setRoomId(booking.getRoomId());
        response.setRoomTypeId(booking.getRoomTypeId());

        try {
            RoomType roomType = roomTypeService.findRoomTypeById(booking.getRoomTypeId());
            response.setRoomTypeName(roomType.getName());
            response.setRoomTypeImageUrls(roomType.getImageUrls());
            response.setRoomTypeMaxOccupancy(roomType.getMaxOccupancy());
        } catch (Exception e) {
            response.setRoomTypeName(booking.getRoomTypeId());
        }

        try {
            Room room = roomService.findRoomById(booking.getRoomId());
            response.setRoomNumber(room.getRoomNumber());
        } catch (Exception e) {
            response.setRoomNumber(booking.getRoomId());
        }

        response.setCheckInDate(booking.getCheckInDate());
        response.setCheckOutDate(booking.getCheckOutDate());
        response.setNumberOfGuests(booking.getNumberOfGuests());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus());
        response.setPaymentId(booking.getPaymentId());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}

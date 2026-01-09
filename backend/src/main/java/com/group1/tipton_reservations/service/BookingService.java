package com.group1.tipton_reservations.service;

import com.group1.tipton_reservations.dto.booking.BookingResponse;
import com.group1.tipton_reservations.dto.booking.CreateBookingRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingRequest;
import com.group1.tipton_reservations.model.Booking;
import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.model.enums.BookingStatus;
import com.group1.tipton_reservations.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;


// TODO: replace ResponseStatusException with appropriate custom exceptions + GlobalExceptionHandler
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
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

        // verify booking is confirmed (only confirmed bookings can be modified)
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Can only modify confirmed bookings"
            );
        }

        // verify check-in date hasn't passed (can't modify past/current bookings)
        if (booking.getCheckInDate().isBefore(LocalDate.now()) ||
            booking.getCheckInDate().isEqual(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot modify a booking that has already started or is starting today"
            );
        }

        // validate new date range
        validateDateRange(request.getCheckInDate(), request.getCheckOutDate());

        // check if assigned room is available for new dates
        // TODO: Consider allowing room reassignment if current room is unavailable
        // currently fails if same room is booked for new dates
        if (booking.getRoomId() != null) {
            List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                    booking.getRoomId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );

            // filter out the current booking from overlapping bookings
            overlappingBookings = overlappingBookings.stream()
                    .filter(b -> !b.getId().equals(bookingId))
                    .toList();

            if (!overlappingBookings.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The assigned room is not available for the new dates"
                );
            }
        }

        // update booking dates
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());

        // recalculate total price based on new dates
        RoomType roomType = roomTypeService.findRoomTypeById(booking.getRoomTypeId());
        BigDecimal newTotalPrice = calculateTotalPrice(
                roomType.getBasePrice(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        booking.setTotalPrice(newTotalPrice);

        // TODO: Once payment logic is implemented:
        // - If newTotalPrice > oldTotalPrice: charge the difference to the payment method
        // - If newTotalPrice < oldTotalPrice: issue partial refund
        // - Send email notification about the modification and price change

        // save updated booking
        Booking updatedBooking = bookingRepository.save(booking);

        return mapToResponse(updatedBooking);
    }

    /**
     * Cancels a booking.
     * Requires user to own the booking or be an admin
     *
     * @param bookingId the booking ID
     * @return the cancelled booking response
     * @throws ResponseStatusException if booking not found or already cancelled
     */
    @PreAuthorize("@bookingSecurity.isOwner(#bookingId)")
    public BookingResponse cancelBooking(String bookingId) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        // verify booking is not already cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already cancelled"
            );
        }

        // update status to cancelled
        // implicitly makes room available for new bookings (repository checks for "PENDING" or "CONFIRMED" for bookings)
        booking.setStatus(BookingStatus.CANCELLED);

        // TODO: refund?

        // save updated booking
        Booking cancelledBooking = bookingRepository.save(booking);

        return mapToResponse(cancelledBooking);
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
     * Maps a Booking entity to a BookingResponse DTO.
     * Fetches room type name and room number for better UX.
     *
     * @param booking the booking entity
     * @return the booking response DTO
     */
    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setConfirmationNumber(booking.getConfirmationNumber());
        response.setUserId(booking.getUserId());
        response.setRoomId(booking.getRoomId());
        response.setRoomTypeId(booking.getRoomTypeId());

        // Fetch room type name and image URLs
        try {
            RoomType roomType = roomTypeService.findRoomTypeById(booking.getRoomTypeId());
            response.setRoomTypeName(roomType.getName());
            response.setRoomTypeImageUrls(roomType.getImageUrls());
        } catch (Exception e) {
            // Fallback to room type ID if fetch fails
            response.setRoomTypeName(booking.getRoomTypeId());
        }

        // Fetch room number
        try {
            Room room = roomService.findRoomById(booking.getRoomId());
            response.setRoomNumber(room.getRoomNumber());
        } catch (Exception e) {
            // Fallback to room ID if fetch fails
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

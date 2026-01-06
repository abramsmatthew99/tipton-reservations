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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;


// TODO: replace ResponseStatusException with appropriate custom exceptions + GlobalExceptionHandler
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final RoomTypeService roomTypeService;
    private final RoomService roomService;

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
        User user = userService.findUserById(userId);
        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is not active"
            );
        }

        // validate room type exists
        RoomType roomType = roomTypeService.findRoomTypeById(request.getRoomTypeId());

        // validate number of guests is not greater than room capacity
        if (request.getNumberOfGuests() > roomType.getMaxOccupancy()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("Number of guests (%d) exceeds maximum occupancy (%d) for this room type",
                            request.getNumberOfGuests(), roomType.getMaxOccupancy())
            );
        }

        // TODO: Uncomment when room assignment logic is ready
        // find and assign an available room of this type
        // Room assignedRoom = roomService.findAvailableRoom(
        //         request.getRoomTypeId(),
        //         request.getCheckInDate(),
        //         request.getCheckOutDate()
        // );

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
        // TODO: Replace hardcoded room ID when room assignment is implemented
        // booking.setRoomId(assignedRoom.getId());
        booking.setRoomId("test-room-id");    // Temporary hardcode for testing
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setStatus(BookingStatus.CONFIRMED);     // TODO: Change to PENDING once payment logic is implemented
        booking.setConfirmationNumber(generateConfirmationNumber());
        booking.setTotalPrice(totalPrice);

        // save booking (within transaction - ensures atomicity)
        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    /**
     * Retrieves a booking by its ID.
     *
     * @param bookingId the booking ID
     * @return the booking response
     * @throws ResponseStatusException if booking not found
     */
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
     * TODO: Add authorization check - verify booking belongs to authenticated user
     *
     * @param confirmationNumber the booking confirmation number
     * @return the booking response
     * @throws ResponseStatusException if booking not found
     */
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
     *
     * @param bookingId the booking ID
     * @param request the modification request containing new dates
     * @param userId the authenticated user's ID (for authorization)
     * @return the updated booking response
     * @throws ResponseStatusException if booking not found, dates invalid, or room unavailable
     */
    public BookingResponse modifyBooking(String bookingId, ModifyBookingRequest request, String userId) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        // verify user owns this booking
        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to modify this booking"
            );
        }

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
     *
     * @param bookingId the booking ID
     * @param userId the authenticated user's ID (for authorization)
     * @return the cancelled booking response
     * @throws ResponseStatusException if booking not found or already cancelled
     */
    public BookingResponse cancelBooking(String bookingId, String userId) {
        // find existing booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with ID: " + bookingId
                ));

        // verify user owns this booking
        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to cancel this booking"
            );
        }

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

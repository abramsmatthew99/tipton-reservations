package com.group1.tipton_reservations.controller;

import com.group1.tipton_reservations.dto.booking.BookingResponse;
import com.group1.tipton_reservations.dto.booking.CreateBookingRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingRequest;
import com.group1.tipton_reservations.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for booking endpoints
 *
 * TODO: add authentication/authorization to get userId from security context
 */
@RestController
@RequestMapping("/bookings")
@CrossOrigin("http://localhost:5173/")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Creates a new booking.
     *
     * @param request the booking creation request
     * @return the created booking with 201 status
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        // TODO: userId should come from Spring Security; revisit when auth is setup
        // using hardcoded id for now
        String userId = "test-user-123";

        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a booking by its ID.
     *
     * @param id the booking ID
     * @return the booking response
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves all bookings for the current user with pagination.
     *
     * @param page the page number (default: 0)
     * @param size the page size (default: 10)
     * @return page of booking responses for the authenticated user
     */
    @GetMapping("/user")
    public ResponseEntity<Page<BookingResponse>> getUserBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: userId should come from Spring Security; revisit when auth is setup
        String userId = "test-user-123";

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> bookings = bookingService.getUserBookings(userId, pageable);

        return ResponseEntity.ok(bookings);
    }

    /**
     * Modifies an existing booking's dates.
     *
     * @param id the booking ID
     * @param request the modification request containing new dates
     * @return the updated booking response
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> modifyBooking(
            @PathVariable String id,
            @Valid @RequestBody ModifyBookingRequest request) {
        // TODO: userId should come from Spring Security; revisit when auth is setup
        String userId = "test-user-123";

        BookingResponse response = bookingService.modifyBooking(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancels a booking.
     *
     * @param id the booking ID
     * @return the cancelled booking response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id) {
        // TODO: userId should come from Spring Security; revisit when auth is setup
        String userId = "test-user-123";

        BookingResponse response = bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(response);
    }

    // TODO: Future endpoints to implement:
    // - POST /bookings/{id}/confirm - confirm booking after payment (will originally be set to pending upon creation)
}
package com.group1.tipton_reservations.controller;

import com.group1.tipton_reservations.dto.booking.BookingResponse;
import com.group1.tipton_reservations.dto.booking.ConfirmBookingRequest;
import com.group1.tipton_reservations.dto.booking.CreateBookingRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingRequest;
import com.group1.tipton_reservations.dto.booking.ModifyBookingPaymentIntentRequest;
import com.group1.tipton_reservations.dto.payment.PaymentIntentResponse;
import com.group1.tipton_reservations.security.HotelUserPrincipal;
import com.group1.tipton_reservations.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller for booking endpoints.
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
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the created booking with 201 status
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        String userId = ((HotelUserPrincipal) authentication.getPrincipal()).getUser().getId();
        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a booking by its ID.
     *
     * @param id the booking ID
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the booking response
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String id,
            Authentication authentication) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a booking by its confirmation number.
     *
     * @param confirmationNumber the booking confirmation number
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the booking response
     */
    @GetMapping("/confirmation/{confirmationNumber}")
    public ResponseEntity<BookingResponse> getBookingByConfirmationNumber(
            @PathVariable String confirmationNumber,
            Authentication authentication) {
        BookingResponse response = bookingService.getBookingByConfirmationNumber(confirmationNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves all bookings for the current user with pagination.
     *
     * @param page the page number (default: 0)
     * @param size the page size (default: 10)
     * @param authentication the authenticated user (injected by Spring Security)
     * @return page of booking responses for the authenticated user
     */
    @GetMapping("/user")
    public ResponseEntity<Page<BookingResponse>> getUserBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String userId = ((HotelUserPrincipal) authentication.getPrincipal()).getUser().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> bookings = bookingService.getUserBookings(userId, pageable);

        return ResponseEntity.ok(bookings);
    }

    /**
     * Modifies an existing booking's dates.
     * Handles ResponseStatusException from service to properly return error message to client.
     *
     * @param id the booking ID
     * @param request the modification request containing new dates
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the updated booking response or error details
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modifyBooking(
            @PathVariable String id,
            @Valid @RequestBody ModifyBookingRequest request,
            Authentication authentication) {
        try {
            BookingResponse response = bookingService.modifyBooking(id, request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            // Return error message in response body for frontend to display
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(java.util.Map.of("message", ex.getReason()));
        }
    }

    /**
     * Creates a PaymentIntent for a booking modification that increases the price.
     *
     * @param id the booking ID
     * @param request the modification request containing new dates
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the payment intent response or error details
     */
    @PostMapping("/{id}/modify-payment-intent")
    public ResponseEntity<?> createModifyPaymentIntent(
            @PathVariable String id,
            @Valid @RequestBody ModifyBookingPaymentIntentRequest request,
            Authentication authentication) {
        try {
            PaymentIntentResponse response = bookingService.createModifyPaymentIntent(id, request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(java.util.Map.of("message", ex.getReason()));
        }
    }

    /**
     * Cancels a booking.
     *
     * @param id the booking ID
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the cancelled booking response or error details
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {
        try {
            BookingResponse response = bookingService.cancelBooking(id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            // Return error message in response body for frontend to display
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(java.util.Map.of("message", ex.getReason()));
        }
    }

    /**
     * Voids a pending booking due to payment failure or incomplete checkout.
     *
     * @param id the booking ID
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the voided booking response
     */
    @PostMapping("/{id}/void")
    public ResponseEntity<BookingResponse> voidBooking(
            @PathVariable String id,
            Authentication authentication) {
        BookingResponse response = bookingService.voidBooking(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Confirms a pending booking after successful payment.
     * Called by the frontend after Stripe payment succeeds.
     *
     * @param id the booking ID
     * @param request the confirmation request containing payment intent ID
     * @param authentication the authenticated user (injected by Spring Security)
     * @return the confirmed booking response
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(
            @PathVariable String id,
            @Valid @RequestBody ConfirmBookingRequest request,
            Authentication authentication) {
        BookingResponse response = bookingService.confirmBooking(id, request.getPaymentIntentId());
        return ResponseEntity.ok(response);
    }

    // TODO: Future endpoints to implement:
    // - GET /bookings - get all bookings for admin (with pagination and sorting)
}

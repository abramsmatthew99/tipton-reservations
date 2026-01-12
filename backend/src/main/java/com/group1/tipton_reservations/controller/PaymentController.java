package com.group1.tipton_reservations.controller;

import com.group1.tipton_reservations.dto.payment.PaymentIntentRequest;
import com.group1.tipton_reservations.dto.payment.PaymentIntentResponse;
import com.group1.tipton_reservations.model.Booking;
import com.group1.tipton_reservations.model.enums.BookingStatus;
import com.group1.tipton_reservations.repository.BookingRepository;
import com.group1.tipton_reservations.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for handling payment-related operations
 */
@RestController
@RequestMapping("/payments")
@CrossOrigin("http://localhost:5173/")
public class PaymentController {

    private final StripeService stripeService;
    private final BookingRepository bookingRepository;

    public PaymentController(StripeService stripeService, BookingRepository bookingRepository) {
        this.stripeService = stripeService;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Creates a PaymentIntent for processing payment
     *
     * @param request Payment intent request containing amount and currency
     * @return PaymentIntentResponse containing the client secret
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment can only be created for PENDING bookings"
                );
            }
            PaymentIntent intent = stripeService.createPaymentIntent(booking, "usd");
            System.out.println("Payment intent created successfully");

            booking.setPaymentId(intent.getId());
            bookingRepository.save(booking);

            return ResponseEntity.ok(new PaymentIntentResponse(intent.getClientSecret()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Stripe error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }
    
    @GetMapping("/monthly-revenue")
    public BigDecimal getMonthlyRevenue() throws Exception {
        return stripeService.getCurrentMonthRevenue();
    }
    


}
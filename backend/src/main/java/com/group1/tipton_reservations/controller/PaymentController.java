package com.group1.tipton_reservations.controller;

import com.group1.tipton_reservations.dto.payment.PaymentIntentRequest;
import com.group1.tipton_reservations.dto.payment.PaymentIntentResponse;
import com.group1.tipton_reservations.service.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling payment-related operations
 */
@RestController
@RequestMapping("/payments")
@CrossOrigin("http://localhost:5173/")
public class PaymentController {

    private final StripeService stripeService;

    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
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
            System.out.println("Creating payment intent for amount: " + request.amount() + " " + request.currency());

            String clientSecret = stripeService.createPaymentIntent(
                request.amount(),
                request.currency()
            );

            System.out.println("Payment intent created successfully");
            return ResponseEntity.ok(new PaymentIntentResponse(clientSecret));
        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating payment intent: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }
}
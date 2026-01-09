package com.group1.tipton_reservations.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for confirming a booking after successful payment.
 * Contains the Stripe payment intent ID to link the payment with the booking.
 */
@Data
public class ConfirmBookingRequest {

    /**
     * The Stripe PaymentIntent ID from the successful payment.
     * Used to verify payment and link it to the booking.
     */
    @NotBlank(message = "Payment intent ID is required")
    private String paymentIntentId;
}

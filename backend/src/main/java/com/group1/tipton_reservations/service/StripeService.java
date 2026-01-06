package com.group1.tipton_reservations.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

/**
 * Service for handling Stripe payment operations
 */
@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Creates a PaymentIntent for the given amount
     *
     * @param amount The amount in dollars (e.g., 119.99)
     * @param currency The currency code (e.g., "usd")
     * @return The PaymentIntent client secret
     * @throws StripeException if the payment intent creation fails
     */
    public String createPaymentIntent(BigDecimal amount, String currency) throws StripeException {
        // Convert dollars to cents (Stripe expects amounts in smallest currency unit)
        long amountInCents = amount.multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return paymentIntent.getClientSecret();
    }

    /**
     * Retrieves a PaymentIntent by ID to verify payment status
     *
     * @param paymentIntentId The PaymentIntent ID
     * @return The PaymentIntent object
     * @throws StripeException if retrieval fails
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
}
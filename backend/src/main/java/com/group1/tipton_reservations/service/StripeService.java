package com.group1.tipton_reservations.service;

import com.group1.tipton_reservations.model.Booking;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.BalanceTransaction;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.ChargeListParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;

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
    public PaymentIntent createPaymentIntent(Booking booking, String currency) throws StripeException {
        // Convert dollars to cents (Stripe expects amounts in smallest currency unit)
        long amountInCents = booking.getTotalPrice().multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .putMetadata("bookingId", booking.getId())
                .putMetadata("confirmationNumber", booking.getConfirmationNumber())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    /**
     * Creates a PaymentIntent for a specific amount (used for booking modifications).
     *
     * @param amount The amount in dollars (e.g., 25.00)
     * @param currency The currency code (e.g., "usd")
     * @param booking The booking associated with the payment
     * @return The PaymentIntent
     * @throws StripeException if the payment intent creation fails
     */
    public PaymentIntent createPaymentIntentForAmount(BigDecimal amount, String currency, Booking booking)
            throws StripeException {
        long amountInCents = amount.multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .putMetadata("bookingId", booking.getId())
                .putMetadata("confirmationNumber", booking.getConfirmationNumber())
                .putMetadata("reason", "MODIFY_BOOKING")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        return PaymentIntent.create(params);
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

    /**
    * Retrieves the net revenue for the current month (month-to-date),
    * calculated as total charge amounts minus Stripe fees and refunds.
    *
    * @return Net revenue for the current month in dollars and cents
    * @throws StripeException if Stripe API access fails
    */
    public BigDecimal getCurrentMonthRevenue() throws StripeException {

        long startOfMonth = LocalDate.now(ZoneOffset.UTC)
                .withDayOfMonth(1)
                .atStartOfDay()
                .toEpochSecond(ZoneOffset.UTC);

        ChargeListParams params = ChargeListParams.builder()
                .setCreated(ChargeListParams.Created.builder()
                        .setGte(startOfMonth)
                        .build())
                .setLimit(100L)
                .addExpand("data.balance_transaction") // IMPORTANT
                .build();

        long total = 0;

        for (Charge charge : Charge.list(params).getData()) {
            if (charge.getPaid() && !charge.getRefunded()) {
                BalanceTransaction bt = charge.getBalanceTransactionObject();
                total += bt.getNet(); // NET revenue (fees already subtracted)
            }
        }

        return BigDecimal.valueOf(total)
                .divide(BigDecimal.valueOf(100))
                .setScale(2);
    }


    /**
     * Creates a refund for a PaymentIntent
     *
     * @param paymentIntentId The PaymentIntent ID to refund
     * @param amountInCents The amount to refund in cents (null for full refund)
     * @return The Refund object
     * @throws StripeException if the refund creation fails
     */
    public Refund createRefund(String paymentIntentId, Long amountInCents) throws StripeException {
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId);

        // If amount is specified, create partial refund; otherwise full refund
        if (amountInCents != null) {
            paramsBuilder.setAmount(amountInCents);
        }

        RefundCreateParams params = paramsBuilder.build();
        return Refund.create(params);
    }
}

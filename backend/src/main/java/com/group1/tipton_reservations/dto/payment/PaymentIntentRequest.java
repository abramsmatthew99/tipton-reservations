package com.group1.tipton_reservations.dto.payment;

import java.math.BigDecimal;

public record PaymentIntentRequest(
    BigDecimal amount,
    String currency
) {
    public PaymentIntentRequest {
        if (currency == null || currency.isBlank()) {
            currency = "usd";
        }
    }
}
package com.group1.tipton_reservations.model;

import com.group1.tipton_reservations.model.enums.PaymentStatus;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a payment record tied to a booking.
 */
@Data
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @Indexed
    private String bookingId;

    @Indexed
    private String userId;

    private String stripePaymentIntentId;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus status;

    private BigDecimal refundedAmount;

    private LocalDateTime refundedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

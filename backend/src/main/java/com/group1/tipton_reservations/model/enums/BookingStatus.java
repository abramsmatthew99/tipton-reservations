package com.group1.tipton_reservations.model.enums;

/**
 * Enum representing the status of a booking in the system.
 */
public enum BookingStatus {
    // Booking has been created but payment is not yet confirmed.
    PENDING,

    // Payment has been confirmed and booking is active.
    CONFIRMED,

    // Booking has been cancelled by the guest or admin.
    CANCELLED,

    // Booking has been completed.
    COMPLETED
}

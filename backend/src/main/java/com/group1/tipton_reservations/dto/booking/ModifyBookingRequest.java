package com.group1.tipton_reservations.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for modifying an existing booking's dates.
 * Only allows changing check-in and check-out dates (subject to availability).
 */
@Data
public class ModifyBookingRequest {

    // New check-in date (must be today or in the future)
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkInDate;

    // New check-out date (must be after check-in date)
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;
}
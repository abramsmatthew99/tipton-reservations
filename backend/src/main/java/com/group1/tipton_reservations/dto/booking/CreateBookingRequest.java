package com.group1.tipton_reservations.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for creating a new booking.
 * Contains the required information for a guest to make a reservation.
 */
@Data
public class CreateBookingRequest {

    // ID of the room type to book
    @NotNull(message = "Room type ID is required")
    private String roomTypeId;

    // Check-in date (must be today or in the future)
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkInDate;

    // Check-out date (must be after check-in date)
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    // Number of guests for the booking
    @NotNull(message = "Number of guests is required")
    @Positive(message = "Number of guests must be at least 1")
    private Integer numberOfGuests;

    private String promoCode;
    
}
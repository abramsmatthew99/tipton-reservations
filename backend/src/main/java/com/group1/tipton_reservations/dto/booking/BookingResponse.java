package com.group1.tipton_reservations.dto.booking;

import com.group1.tipton_reservations.model.enums.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for booking response data.
 * Returned to clients when retrieving booking information.
 */
@Data
public class BookingResponse {

    // Unique booking ID
    private String id;

    // Human-readable confirmation number (e.g., "TIP-ABC123")
    private String confirmationNumber;

    // User ID who made the booking
    private String userId;

    // Assigned room ID
    private String roomId;

    // Room type ID
    private String roomTypeId;

    // Room type name
    private String roomTypeName;

    // Room type image URLs
    private List<String> roomTypeImageUrls;

    // Room type max occupancy
    private Integer roomTypeMaxOccupancy;

    // Room number
    private String roomNumber;

    // Check-in date
    private LocalDate checkInDate;

    // Check-out date
    private LocalDate checkOutDate;

    // Number of guests
    private Integer numberOfGuests;

    // Total price for the stay

    private BigDecimal totalPrice;

    // Current booking status
    private BookingStatus status;

    // Associated payment ID (if payment exists)
    private String paymentId;

    // Timestamp when the booking was created
    private LocalDateTime createdAt;

    // Timestamp when the booking was last updated
    private LocalDateTime updatedAt;
}

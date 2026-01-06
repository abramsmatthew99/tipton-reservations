package com.group1.tipton_reservations.dto.roomType;

import com.group1.tipton_reservations.model.RoomType;

/**
 * Response DTO for available room types.
 * Contains the room type details and the count of available rooms for a specific date range.
 */
public record RoomTypeAvailabilityResponse(
    RoomType roomType,
    int availableCount
) {}

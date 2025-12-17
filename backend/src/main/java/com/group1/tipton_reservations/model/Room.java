package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;


/**
 * Represents a physical room unit in the hotel .
 * <p>
 * This document links to a {@link RoomType} for description/pricing 
 * but holds the specific status of this physical space.
 * </p>
 */
@Data
@Document(collection = "rooms")
@CompoundIndex(name = "room_floor_idx", def = "{'roomNumber': 1, 'floor': 1}", unique = true)
public class Room {
    @Id
    private String id;

    private String roomTypeId;

    private String roomNumber;
    private Integer floor;
    
    private String status; 
}
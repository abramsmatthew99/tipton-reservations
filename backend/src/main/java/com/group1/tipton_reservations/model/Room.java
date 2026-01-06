package com.group1.tipton_reservations.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import com.group1.tipton_reservations.model.enums.RoomStatus;


/**
 * Represents a physical room unit in the hotel .
 * <p>
 * This document links to a {@link RoomType} for description/pricing 
 * but holds the specific status of this physical space.
 * </p>
 */
@Data 
@NoArgsConstructor
@Document(collection = "rooms")
@CompoundIndex(name = "room_floor_idx", def = "{'roomNumber': 1, 'floor': 1}", unique = true)
public class Room {
    @Id
    private String id;

    private String roomTypeId;

    private String roomNumber;
    private Integer floor;
    
    private RoomStatus status;



    public Room(String roomTypeId, String roomNumber, Integer floor, RoomStatus status) {
        this.roomTypeId = roomTypeId;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.status = status;
    } 

}

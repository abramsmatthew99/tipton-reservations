package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


/**
 * Represents a reservation transaction.
 * <p>
 * Links a {@link User} to a {@link RoomType} and on successful booking, 
 * a specific {@link Room}.
 * </p>
 */
@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String userId;
    
    private String roomId;
    
    private String roomTypeId;
    
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    
    private BigDecimal totalPrice;
    
    private String paymentId;
    
    private String status; 
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
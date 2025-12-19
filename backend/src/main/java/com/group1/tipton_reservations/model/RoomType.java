package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.util.List;


/**
 * Defines a category or "class" of rooms.
 * <p>
 * Specific physical {@link Room}s link to this
 * to inherit their pricing, amenities, and description.
 * </p>
 */
@Data
@Document(collection = "room_types")
public class RoomType {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;
    
    private BigDecimal basePrice;
    
    private Integer maxOccupancy;
    
    private List<String> imageUrls; //TODO: We might consider storing images in s3 buckets
                                    //Then, we can have these imageUrls be the urls of the s3 buckets
    private List<Amenity> amenities;
    
    private boolean active = true;

    @Data
    public static class Amenity {
        private String name;
        private String iconCode;
        private String description;
    }
}
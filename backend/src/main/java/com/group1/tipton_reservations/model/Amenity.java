package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "amenities")
@Data
public class Amenity {

    @Id
    private String id;

    private String name;        // "WiFi"
    private String iconCode;    // "wifi" (used by frontend)
    private String description; // optional helper text
}

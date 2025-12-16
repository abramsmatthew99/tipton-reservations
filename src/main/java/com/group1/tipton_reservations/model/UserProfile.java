package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;


/**
 * Stores the extended business profile for a registered {@link User}.
 */
@Data
@Document(collection = "user_profiles")
public class UserProfile {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String firstName;
    private String lastName;
    private String phoneNumber;

    private Integer loyaltyPoints = 0;
    
    private Preferences preferences;

    @Data
    public static class Preferences {
        private boolean newsletterSubscribed;
        private String preferredFloor;
    }
}
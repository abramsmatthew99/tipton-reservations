package com.group1.tipton_reservations.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;


/**
 * Represents the core authentication identity of a user in the system.
 * <p>
 * This class is strictly for security and login credentials.
 * It does not contain personal details; those are stored
 * in the linked {@link UserProfile}.
 * </p>
 */
@Data
@Document(collection = "users")
public class User {
    
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private List<ConnectedAccount> connectedAccounts = new ArrayList<>();

    private Set<String> roles;

    private boolean isActive = true;

    /**
     * Represents a connection to an external OAuth2 provider.
     */
    @Data
    public static class ConnectedAccount {
        private String provider;
        private String providerId;
        private LocalDateTime connectedAt;

        public ConnectedAccount(String provider, String providerId) {
            this.provider = provider;
            this.providerId = providerId;
            this.connectedAt = LocalDateTime.now();
        }
    }

}

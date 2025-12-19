package com.group1.tipton_reservations.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

  
    @Indexed(unique = true)
    @Email
    private String email;

    
    private String password;

    private List<ConnectedAccount> connectedAccounts = new ArrayList<>();

   
    private Set<String> roles;

    private boolean isActive = true;

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
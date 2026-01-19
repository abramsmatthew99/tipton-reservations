package com.group1.tipton_reservations.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    public User(String email, String password) {
        this.email = email;
        this.password = password;
        this.roles.add("ROLE_CUSTOMER");
    }

    @Id
    private String id;

  
    @Indexed(unique = true)
    @Email
    private String email;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    
    private String password;

    private List<ConnectedAccount> connectedAccounts = new ArrayList<>();

   
    private Set<String> roles = new HashSet<>();

    private boolean isActive = true;

    private int rewardsPoints = 0;
 

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
package com.group1.tipton_reservations.repository;

import com.group1.tipton_reservations.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByRolesContains(String role);

    List<User> findByIsActive(boolean isActive); //look for deleted accounts

    @Query("{ 'connectedAccounts.provider': ?0, 'connectedAccounts.providerId': ?1 }") //finding a user through OAuth accounts
    Optional<User> findByProviderAndId(String provider, String providerId);


}
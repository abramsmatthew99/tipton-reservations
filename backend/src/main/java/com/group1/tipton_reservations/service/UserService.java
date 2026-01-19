package com.group1.tipton_reservations.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateUser(String id, User userDetails) {
    User u = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (userDetails.getFirstName() != null) u.setFirstName(userDetails.getFirstName());
    if (userDetails.getLastName() != null) u.setLastName(userDetails.getLastName());
    if (userDetails.getPhoneNumber() != null) u.setPhoneNumber(userDetails.getPhoneNumber());
    
    u.setActive(userDetails.isActive());

    userRepository.save(u);
}

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public List<User> findUsersByIds(List<String> ids) {
        return userRepository.findAllById(ids);
    }

    public void addRewardPoints(String userId, int points) {
        User user = findUserById(userId); 
        user.setRewardsPoints(user.getRewardsPoints() + points);
        userRepository.save(user);
    }
}
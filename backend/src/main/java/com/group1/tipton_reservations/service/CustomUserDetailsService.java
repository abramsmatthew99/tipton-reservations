package com.group1.tipton_reservations.service;

import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.repository.UserRepository;
import com.group1.tipton_reservations.security.HotelUserPrincipal;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional //Note we are actually searching by email
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email" + email));
        
        return new HotelUserPrincipal(user);
    }

 
}

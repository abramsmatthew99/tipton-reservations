package com.group1.tipton_reservations.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*; 

import com.group1.tipton_reservations.dto.user.UserDto;
import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.repository.UserRepository;
import com.group1.tipton_reservations.security.JwtUtils; 

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    
    private final AuthenticationManager authManager; 
    private final JwtUtils jwtUtils;                 

    public AuthController(UserRepository repo, PasswordEncoder encoder, AuthenticationManager authManager, JwtUtils jwtUtils) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDto dto) {
        if (repo.existsByEmail(dto.email())) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }

        User user = new User(dto.email(), encoder.encode(dto.password()));
        // Note: Might have to change default roles
        
        this.repo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserDto dto) {
        
        
        Authentication authentication = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
        );

        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok(jwt);
    }
}
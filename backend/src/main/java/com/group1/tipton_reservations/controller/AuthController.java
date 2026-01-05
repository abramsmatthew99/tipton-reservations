package com.group1.tipton_reservations.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.tipton_reservations.dto.user.UserDto;
import com.group1.tipton_reservations.repository.UserRepository;
import com.group1.tipton_reservations.model.User;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    //Takes a username and password from body object and encodes the password and stores the user in the database
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDto dto) {
        User user = new User(dto.email(), encoder.encode(dto.password()));
        this.repo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User Registered");
        //Maybe check if username exists
    }


}

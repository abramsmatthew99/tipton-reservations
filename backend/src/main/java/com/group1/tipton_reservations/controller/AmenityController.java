package com.group1.tipton_reservations.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.tipton_reservations.model.Amenity;
import com.group1.tipton_reservations.repository.AmenityRepository;

@RestController
@RequestMapping("/amenities")
@CrossOrigin("http://localhost:5173/")
public class AmenityController {
    private final AmenityRepository amenityRepository;

    public AmenityController(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @GetMapping
    public ResponseEntity<List<Amenity>> findAllAmenities() {
        try {
            List<Amenity> amenities = amenityRepository.findAll();
            return new ResponseEntity<>(amenities, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error fetching amenities")
                .build();
        }
    }
}

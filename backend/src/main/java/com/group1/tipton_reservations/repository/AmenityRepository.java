package com.group1.tipton_reservations.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.group1.tipton_reservations.model.Amenity;

@Repository
public interface AmenityRepository extends MongoRepository<Amenity, String> {
}

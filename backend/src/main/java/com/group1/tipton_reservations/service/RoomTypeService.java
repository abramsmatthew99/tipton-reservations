package com.group1.tipton_reservations.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.repository.RoomTypeRepository;

@Service
public class RoomTypeService {
    private final RoomTypeRepository roomTypeRepository; 



    public RoomTypeService(RoomTypeRepository roomTypeRepository)  {
        this.roomTypeRepository = roomTypeRepository;
    }


    //Select *
    public List<RoomType> findAllRoomTypes() {
        return roomTypeRepository.findAll(); 
    }

    public RoomType updateRoomType(String id, RoomType roomType) { 
        validateRoomType(roomType);
        RoomType existing = roomTypeRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("RoomType not found"));

        String normalizedName = normalizeName(roomType.getName());
        if (!normalizedName.equals(existing.getName()) && roomTypeRepository.existsByName(normalizedName)) {
            throw new IllegalStateException("RoomType name already exists");
        }

        existing.setName(normalizedName);
        existing.setDescription(roomType.getDescription());
        existing.setBasePrice(roomType.getBasePrice());
        existing.setMaxOccupancy(roomType.getMaxOccupancy());
        existing.setImageUrls(roomType.getImageUrls());
        existing.setAmenityIds(roomType.getAmenityIds());

        return roomTypeRepository.save(existing);
    }
    public RoomType findRoomTypeById(String id) {
        return roomTypeRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("RoomType not found"));
    }
    
    public RoomType createRoomType(RoomType roomType) {
        validateRoomType(roomType);
        String normalizedName = normalizeName(roomType.getName());
        if (roomTypeRepository.existsByName(normalizedName)) {
            throw new IllegalStateException("RoomType name already exists");
        }
        roomType.setName(normalizedName);
        return roomTypeRepository.save(roomType); 
    }

    public void deleteRoomType(String id) {
        roomTypeRepository.deleteById(id); 
    }

    private void validateRoomType(RoomType roomType) {
        if (roomType == null) {
            throw new IllegalArgumentException("RoomType payload is required");
        }
        String name = normalizeName(roomType.getName());
        if (name.isEmpty()) {
            throw new IllegalArgumentException("RoomType name is required");
        }
        if (roomType.getBasePrice() == null) {
            throw new IllegalArgumentException("RoomType basePrice is required");
        }
        if (roomType.getBasePrice().signum() <= 0) {
            throw new IllegalArgumentException("RoomType basePrice must be greater than 0");
        }
        if (roomType.getMaxOccupancy() == null) {
            throw new IllegalArgumentException("RoomType maxOccupancy is required");
        }
        if (roomType.getMaxOccupancy() <= 0) {
            throw new IllegalArgumentException("RoomType maxOccupancy must be greater than 0");
        }
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }
}

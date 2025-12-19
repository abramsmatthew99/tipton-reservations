package com.group1.tipton_reservations.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.model.RoomType.Amenity;
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

    //Edit room entry
    public void updateRoomType(String id, String name, String description, BigDecimal basePrice, Integer maxOccupancy, List<String> imageUrls, List<Amenity> amenities) { 
         RoomType rt = roomTypeRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("RoomType not found"));

        rt.setName(name);
        rt.setDescription(description);
        rt.setBasePrice(basePrice);
        rt.setMaxOccupancy(maxOccupancy);
        rt.setImageUrls(imageUrls);
        rt.setAmenities(amenities);

        roomTypeRepository.save(rt);
    }
    public RoomType findRoomTypeById(String id) {
        return roomTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found")); 
    }
    
    public RoomType createRoomType(RoomType roomType) {
        return roomTypeRepository.save(roomType); 
    }

    public void deleteRoomType(String id) {
        roomTypeRepository.deleteById(id); 
    }
}
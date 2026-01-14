package com.group1.tipton_reservations.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.group1.tipton_reservations.dto.roomType.RoomTypeAvailabilityResponse;
import com.group1.tipton_reservations.model.Booking;
import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.repository.BookingRepository;
import com.group1.tipton_reservations.repository.RoomRepository;
import com.group1.tipton_reservations.repository.RoomTypeRepository;

@Service
public class RoomTypeService {
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository; 



    public RoomTypeService(RoomTypeRepository roomTypeRepository, RoomRepository roomRepository, BookingRepository bookingRepository)  {
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
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

    /**
     * Find all room types that have at least one room available for the specified date range.
     *      
     * @param checkInDate the check-in date
     * @param checkOutDate the check-out date
     * @return list of available room types with availability count
     */
    public List<RoomTypeAvailabilityResponse> findAvailableRoomTypes(LocalDate checkInDate, LocalDate checkOutDate, Integer guests) {
        if (checkInDate == null || checkOutDate == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // Get a list of all room types
        List<RoomType> allRoomTypes = roomTypeRepository.findAll();
        List<RoomTypeAvailabilityResponse> availableRoomTypes = new ArrayList<>();

        // Adding available room types to list
        for (RoomType roomType : allRoomTypes) {
            if (roomType.getMaxOccupancy() >= guests) {
                int availableCount = countAvailableRooms(roomType.getId(), checkInDate, checkOutDate);
                if (availableCount > 0) {
                    availableRoomTypes.add(new RoomTypeAvailabilityResponse(roomType, availableCount));
                }
            }
        }

        return availableRoomTypes;
    }

    /**
     * Count the number of available rooms for a specific room type within a date range.
     *
     * @param roomTypeId the room type ID
     * @param checkInDate the check-in date
     * @param checkOutDate the check-out date
     * @return the number of available rooms
     */
    private int countAvailableRooms(String roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        // Get all rooms of this type
        List<Room> allRooms = roomRepository.findByRoomTypeId(roomTypeId);

        // Get all booked room IDs for this room type and date range
        List<Booking> bookedRoomBookings = bookingRepository.findBookedRoomIdsByRoomTypeAndDateRange(
            roomTypeId, checkInDate, checkOutDate
        );

        // Extract booked room IDs into a Set
        Set<String> bookedRoomIds = bookedRoomBookings.stream()
            .map(Booking::getRoomId)
            .collect(Collectors.toSet());

        // Count rooms that are not in the booked set
        int availableCount = 0;
        for (Room room : allRooms) {
            if (!bookedRoomIds.contains(room.getId())) {
                availableCount++;
            }
        }

        return availableCount;
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

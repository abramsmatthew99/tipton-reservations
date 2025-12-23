package com.group1.tipton_reservations.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.group1.tipton_reservations.model.Booking;
import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.repository.BookingRepository;
import com.group1.tipton_reservations.repository.RoomRepository;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;


    //Select *
    public List<Room> findAllRooms() {
        return roomRepository.findAll(); 
    }
    public Room findRoomById(String id) {
        return roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found")); 
    }

    //Edit room entry
    public void updateRoom(String id, String roomTypeId, String roomNumber, Integer floor, String status) { 
        Room r = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));  

        r.setRoomTypeId(roomTypeId); 
        r.setRoomNumber(roomNumber); 
        r.setFloor(floor); 
        r.setStatus(status); 

        roomRepository.save(r); 
    }

    public Room createRoom(Room room) {
        //handle edge casefor not creating dup room numbers
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new RuntimeException("Room number already exists"); 
        }
        return roomRepository.save(room); 
    }

    public void deleteRoom(String id) {
        roomRepository.deleteById(id);
    }

    // finds an available room for a given room type and date range.
    public Room findAvailableRoom(String roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        // get all rooms of specified type
        List<Room> allRoomsMatchingType = roomRepository.findByRoomTypeId(roomTypeId);

        // get all bookings that overlap with the requested dates for this room type
        List<Booking> overlappingBookings = bookingRepository.findBookedRoomIdsByRoomTypeAndDateRange(
            roomTypeId,
            checkInDate,
            checkOutDate
        );

        // get room ids that are already booked
        Set<String> bookedRoomIds = overlappingBookings.stream()
            .map(Booking::getRoomId)
            .filter(Objects::nonNull)  // filter out null room ids
            .collect(Collectors.toSet());

        // find first available room (i.e. not booked and in status = "AVAILABLE")
        return allRoomsMatchingType.stream()
            .filter(room -> !bookedRoomIds.contains(room.getId()))  // excludes rooms already booked
            .filter(room -> "AVAILABLE".equals(room.getStatus()))   // only includes available rooms
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "No rooms available for this type during the selected dates"
            ));
    }

}
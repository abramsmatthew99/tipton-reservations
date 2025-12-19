package com.group1.tipton_reservations.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.repository.RoomRepository;

@Service
public class RoomService {
    private final RoomRepository roomRepository; 



    public RoomService(RoomRepository roomRepository)  {
        this.roomRepository = roomRepository;
    }


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

}
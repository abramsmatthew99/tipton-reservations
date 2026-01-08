package com.group1.tipton_reservations.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.tipton_reservations.model.Room;
import com.group1.tipton_reservations.service.RoomService;

@RestController
@RequestMapping("/rooms") 
@CrossOrigin("http://localhost:5173/")
public class RoomController {
    private final RoomService roomService; 



    private RoomController (RoomService roomService) {
        this.roomService = roomService; 
    }

    @GetMapping 
    public ResponseEntity<List<Room>> findAllRooms() {
        try {
            List<Room> rooms = roomService.findAllRooms();
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Message", "error fetching rooms").build(); 
        }
    }
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) { 
        try {
            Room newRoom = roomService.createRoom(room); 

            return new ResponseEntity<>(newRoom, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("message", e.getMessage())
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("message", "something went wrong when creating a room entry ").build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> findRoomById(@PathVariable String id) {
        try {
            Room room = roomService.findRoomById(id);
            return new ResponseEntity<>(room, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error fetching room")
                .build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable String id, @RequestBody Room room) {
        try {
            roomService.updateRoom(
                id,
                room.getRoomTypeId(),
                room.getRoomNumber(),
                room.getFloor()
            );
            Room updatedRoom = roomService.findRoomById(id);
            return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error updating room")
                .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        try {
            roomService.findRoomById(id);
            roomService.deleteRoom(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error deleting room")
                .build();
        }
    }
}

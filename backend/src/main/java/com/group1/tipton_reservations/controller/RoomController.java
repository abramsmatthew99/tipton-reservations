package com.group1.tipton_reservations.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("message", "something went wrong when creating a room entry ").build();
        }
    }
}

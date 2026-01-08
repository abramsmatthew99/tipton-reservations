package com.group1.tipton_reservations.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.group1.tipton_reservations.dto.roomType.RoomTypeAvailabilityResponse;
import com.group1.tipton_reservations.model.RoomType;
import com.group1.tipton_reservations.service.RoomTypeService;

@RestController
@RequestMapping("/room-types")
@CrossOrigin("http://localhost:5173/")
public class RoomTypeController {
    private final RoomTypeService roomTypeService;

    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
    }

    @GetMapping
    public ResponseEntity<List<RoomType>> findAllRoomTypes() {
        try {
            List<RoomType> roomTypes = roomTypeService.findAllRoomTypes();
            return new ResponseEntity<>(roomTypes, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error fetching room types")
                .build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> findRoomTypeById(@PathVariable String id) {
        try {
            RoomType roomType = roomTypeService.findRoomTypeById(id);
            return new ResponseEntity<>(roomType, HttpStatus.OK);
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room type not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error fetching room type")
                .build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<RoomTypeAvailabilityResponse>> findAvailableRoomTypes(
            @RequestParam("checkInDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam("checkOutDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate, 
            @RequestParam("guests") Integer guests) {
        try {
            List<RoomTypeAvailabilityResponse> availableRoomTypes = roomTypeService.findAvailableRoomTypes(checkInDate, checkOutDate, guests);
            return new ResponseEntity<>(availableRoomTypes, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Message", e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error fetching available room types").build();
        }
    }

    @PostMapping
    public ResponseEntity<RoomType> createRoomType(@RequestBody RoomType roomType) {
        try {
            RoomType newRoomType = roomTypeService.createRoomType(roomType);
            return new ResponseEntity<>(newRoomType, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Message", e.getMessage())
                .build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("Message", e.getMessage())
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("message", "something went wrong when creating a room type entry")
                .build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomType> updateRoomType(@PathVariable String id, @RequestBody RoomType roomType) {
        try {
            RoomType updatedRoomType = roomTypeService.updateRoomType(id, roomType);
            return new ResponseEntity<>(updatedRoomType, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Message", e.getMessage())
                .build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("Message", e.getMessage())
                .build();
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room type not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error updating room type")
                .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable String id) {
        try {
            roomTypeService.findRoomTypeById(id);
            roomTypeService.deleteRoomType(id);
            return ResponseEntity.noContent().build();
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Message", "room type not found")
                .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Message", "error deleting room type")
                .build();
        }
    }
}

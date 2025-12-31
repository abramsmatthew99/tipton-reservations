package com.group1.tipton_reservations.repository;

import com.group1.tipton_reservations.model.Room; 

import com.group1.tipton_reservations.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

    boolean existsByRoomNumber(String roomNumber); //exists = Boolean return type. for checking if exists 

}

package com.group1.tipton_reservations.repository;

import com.group1.tipton_reservations.model.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends MongoRepository<RoomType, String> {
}

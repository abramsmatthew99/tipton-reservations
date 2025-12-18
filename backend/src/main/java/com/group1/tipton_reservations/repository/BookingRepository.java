package com.group1.tipton_reservations.repository;

import com.group1.tipton_reservations.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Booking entity operations.
 * Provides custom queries for booking management, availability checks, and user bookings.
 */
public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Find a booking by its unique confirmation number.
     *
     * @param confirmationNumber the confirmation number
     * @return Optional containing the booking if found
     */
    Optional<Booking> findByConfirmationNumber(String confirmationNumber);

    /**
     * Find all bookings for a specific user with pagination.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of bookings for the user
     */
    Page<Booking> findByUserId(String userId, Pageable pageable);

    /**
     * Find all bookings for a specific room within a date range.
     * Used for availability checks for a room.
     *
     * @param roomId the room ID
     * @param checkInDate the start of the date range
     * @param checkOutDate the end of the date range
     * @return list of bookings for the room in the date range
     */
    @Query("{ 'roomId': ?0, 'status': { $in: ['PENDING', 'CONFIRMED'] }, " +
           "$or: [ " +
           "  { 'checkInDate': { $lt: ?2 }, 'checkOutDate': { $gt: ?1 } } " +
           "] }")
    List<Booking> findOverlappingBookings(String roomId, LocalDate checkInDate, LocalDate checkOutDate);

    /**
     * Find all room IDs that have overlapping bookings for a given room type and date range.
     * Used to filter out unavailable rooms when searching for available rooms.
     *
     * @param roomTypeId the room type ID
     * @param checkInDate the start of the date range
     * @param checkOutDate the end of the date range
     * @return list of room IDs that are booked during the date range
     */
    @Query(value = "{ 'roomTypeId': ?0, 'status': { $in: ['PENDING', 'CONFIRMED'] }, " +
                   "$or: [ " +
                   "  { 'checkInDate': { $lt: ?2 }, 'checkOutDate': { $gt: ?1 } } " +
                   "] }",
           fields = "{ 'roomId': 1 }")
    List<Booking> findBookedRoomIdsByRoomTypeAndDateRange(String roomTypeId, LocalDate checkInDate, LocalDate checkOutDate);

    /**
     * Check if a confirmation number already exists.
     *
     * @param confirmationNumber the confirmation number
     * @return true if exists, false otherwise
     */
    boolean existsByConfirmationNumber(String confirmationNumber);

}

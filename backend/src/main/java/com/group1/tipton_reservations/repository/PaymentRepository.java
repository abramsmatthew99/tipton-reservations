package com.group1.tipton_reservations.repository;

import com.group1.tipton_reservations.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByBookingIdOrderByCreatedAtDesc(String bookingId);
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
}

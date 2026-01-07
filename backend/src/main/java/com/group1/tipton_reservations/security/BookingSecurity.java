package com.group1.tipton_reservations.security;

import com.group1.tipton_reservations.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Security component for booking authorization checks.
 * Used in @PreAuthorize expressions to determine if the current user
 * has access to specific bookings.
 *
 * Admins automatically bypass these checks via role hierarchy.
 */
@Component("bookingSecurity")
@RequiredArgsConstructor
public class BookingSecurity {

    private final BookingRepository bookingRepository;

    /**
     * Checks if the current authenticated user owns the specified booking.
     * Admins automatically pass this check via role hierarchy configuration.
     *
     * @param bookingId the booking ID to check
     * @return true if current user owns the booking OR is an admin, false otherwise
     */
    public boolean isOwner(String bookingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof HotelUserPrincipal)) {
            return false;
        }

        // Check if user is admin (role hierarchy makes ROLE_ADMIN include ROLE_CUSTOMER)
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;  // Admins can access any booking
        }

        // For non-admins, check ownership
        HotelUserPrincipal principal = (HotelUserPrincipal) auth.getPrincipal();
        String currentUserId = principal.getUser().getId();

        return bookingRepository.findById(bookingId)
                .map(booking -> booking.getUserId().equals(currentUserId))
                .orElse(false);
    }

    /**
     * Checks if the current authenticated user owns the booking by confirmation number.
     * Admins automatically pass this check via role hierarchy configuration.
     *
     * @param confirmationNumber the confirmation number
     * @return true if current user owns the booking OR is an admin, false otherwise
     */
    public boolean isOwnerByConfirmation(String confirmationNumber) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof HotelUserPrincipal)) {
            return false;
        }

        // Check if user is admin
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;  // Admins can access any booking
        }

        // For non-admins, check ownership
        HotelUserPrincipal principal = (HotelUserPrincipal) auth.getPrincipal();
        String currentUserId = principal.getUser().getId();

        return bookingRepository.findByConfirmationNumber(confirmationNumber)
                .map(booking -> booking.getUserId().equals(currentUserId))
                .orElse(false);
    }
}

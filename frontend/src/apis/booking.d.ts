import type { BookingResponse } from "../types/booking";

/**
 * Fetch all bookings from the backend
 */
export function getBookings(): Promise<BookingResponse[]>;

/**
 * Cancel a booking by ID
 * @param id - Booking ID to cancel
 */
export function cancelBooking(id: string | number): Promise<any>;

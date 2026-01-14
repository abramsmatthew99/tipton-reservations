// Booking-related TypeScript types

/**
 * Booking status enum matching backend BookingStatus
 */
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "VOIDED";

/**
 * Complete booking response from backend
 * Used in My Bookings page to display booking list
 */
export type BookingResponse = {
  id: string;
  confirmationNumber: string; // Format: TIP-XXXXXX
  userId: string;
  roomId: string;
  roomTypeId: string;
  roomTypeName: string; // Human-readable room type name (e.g., "Standard Room", "Deluxe Suite")
  roomTypeImageUrls?: string[]; // Array of image URLs for the room type
  roomTypeMaxOccupancy?: number;
  roomNumber: string; // Room number (e.g., "101", "205")
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfGuests: number;
  totalPrice: string; // Decimal as string
  paymentId: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

/**
 * Internal state for booking confirmation form
 * Used in Booking Confirmation page
 */
export type BookingFormState = {
  roomTypeId: string;
  roomTypeName: string;
  roomTypeImage?: string;
  roomTypeDescription?: string;
  basePrice: number;
  checkInDate: string; // ISO date string (YYYY-MM-DD)
  checkOutDate: string; // ISO date string (YYYY-MM-DD)
  numberOfGuests: number;
  numberOfNights: number; // Calculated
  totalPrice: number; // Calculated (basePrice × numberOfNights)
};

import emailjs from "@emailjs/browser";

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "SERVICE_ID";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "PUBLIC_KEY";

export interface BookingEmailData {
  guestEmail: string;
  guestName: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  roomNumber: string;
  numGuests: number;
  totalPrice: string;
}

/**
 * Sends a booking confirmation email via EmailJS
 * @param data - Booking details for the email
 * @returns Promise that resolves when email is sent
 */
export const sendBookingConfirmationEmail = async (
  data: BookingEmailData
): Promise<void> => {
  try {
    console.log('DEBUG emailService - Input data:', data);

    const templateParams = {
      to_email: data.guestEmail,
      guest_name: data.guestName,
      confirmation_number: data.confirmationNumber,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      room_type: data.roomType,
      room_number: data.roomNumber,
      num_guests: data.numGuests.toString(),
      total_price: data.totalPrice,
    };

    console.log('DEBUG emailService - Template params:', templateParams);
    console.log('DEBUG emailService - EmailJS config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY
    });

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("Booking confirmation email sent successfully");
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break booking flow
    console.error("Failed to send booking confirmation email:", error);
  }
};

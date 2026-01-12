import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BookingResponse } from '../../types/booking';

// Request types for booking operations
export interface CreateBookingRequest {
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}

export interface ModifyBookingRequest {
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentIntentId?: string;
}

export interface ConfirmBookingRequest {
  paymentIntentId: string;
}

export interface PaymentIntentRequest {
  bookingId: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

// Paginated response from Spring Data
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Get paginated bookings for current user
    getUserBookings: builder.query<PageResponse<BookingResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 } = {}) => `/bookings/user?page=${page}&size=${size}`,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    // Get a single booking by ID
    getBookingById: builder.query<BookingResponse, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    // Get a booking by confirmation number
    getBookingByConfirmationNumber: builder.query<BookingResponse, string>({
      query: (confirmationNumber) => `/bookings/confirmation/${confirmationNumber}`,
      providesTags: (result) => (result ? [{ type: 'Booking', id: result.id }] : []),
    }),

    // Create a new booking (returns PENDING status)
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    // Confirm a pending booking after payment
    confirmBooking: builder.mutation<BookingResponse, { id: string; paymentIntentId: string }>({
      query: ({ id, paymentIntentId }) => ({
        url: `/bookings/${id}/confirm`,
        method: 'POST',
        body: { paymentIntentId },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // Create a Stripe PaymentIntent for a pending booking
    createPaymentIntent: builder.mutation<PaymentIntentResponse, PaymentIntentRequest>({
      query: (body) => ({
        url: '/payments/create-payment-intent',
        method: 'POST',
        body,
      }),
    }),

    // Modify booking dates
    modifyBooking: builder.mutation<BookingResponse, { id: string; request: ModifyBookingRequest }>({
      query: ({ id, request }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Booking', id }],
    }),

    // Create payment intent for booking modification (price increase)
    createModifyPaymentIntent: builder.mutation<PaymentIntentResponse, { id: string; checkInDate: string; checkOutDate: string; numberOfGuests: number }>({
      query: ({ id, checkInDate, checkOutDate, numberOfGuests }) => ({
        url: `/bookings/${id}/modify-payment-intent`,
        method: 'POST',
        body: { checkInDate, checkOutDate, numberOfGuests },
      }),
    }),

    // Cancel a booking
    cancelBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // Void a pending booking (payment failed / abandoned checkout)
    voidBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}/void`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetUserBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingByConfirmationNumberQuery,
  useCreateBookingMutation,
  useConfirmBookingMutation,
  useCreatePaymentIntentMutation,
  useCreateModifyPaymentIntentMutation,
  useModifyBookingMutation,
  useCancelBookingMutation,
  useVoidBookingMutation,
} = bookingApi;

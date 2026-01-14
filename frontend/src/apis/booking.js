import client from "./client";

export const getBookings = async () => {
  const { data } = await client.get("/bookings");

  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await client.delete(`/bookings/${id}`);

  return data;
};

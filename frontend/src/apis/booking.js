import client from "./client";

export const getBookings = async () => {
  const { data } = await client.get("/bookings");

  return data;
};

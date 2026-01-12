import client from "./client";

export const getThisMonthsRevenue = async () => {
  const { data } = await client.get("/payments/monthly-revenue");

  return data;
};

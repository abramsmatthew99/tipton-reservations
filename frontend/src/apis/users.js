import client from "./client";

export const getUsers = async () => {
  const { data } = await client.get("/users");

  const customers = data.filter((user) => {
    return user.roles.includes("ROLE_CUSTOMER");
  });
  console.log(customers);
  return customers;
};

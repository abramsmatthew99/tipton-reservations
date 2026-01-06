import axios from "axios";

const baseURL = "http://localhost:8080";

export const createRoom = async (formData) => {
  const { data } = await axios.post(
    `${baseURL}/rooms`,
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
    formData
  );

  return data;
};

export const getRooms = async () => {
  const { data } = await axios.get(`${baseURL}/rooms`);

  return data;
};

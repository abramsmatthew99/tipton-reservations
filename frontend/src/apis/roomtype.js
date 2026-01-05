import axios from "axios";

const baseURL = "http://localhost:8080";

export const createRoomType = async (formData) => {
  const { data } = await axios.post(
    `${baseURL}/room-types`,
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
    formData
  );

  return data;
};
export const getRoomTypes = async () => {
  const { data } = await axios.get(
    `${baseURL}/room-types`
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
  );

  return data;
};

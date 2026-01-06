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

export const setRoomStatus = async (status, id) => {
  const { data } = await axios.patch(
    `${baseURL}/rooms/${id}/status`,
    JSON.stringify(status),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};

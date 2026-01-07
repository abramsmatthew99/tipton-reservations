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
export const deleteRoomType = async (id) => {
  const { data } = await axios.delete(`${baseURL}/room-types/${id}`);
  return data;
};

export const getRoomTypesByDateAndGuests = async (
  checkInDate,
  checkOutDate,
  guests
) => {
  const { data } = await axios.get(`${baseURL}/room-types/available`, {
    params: { checkInDate, checkOutDate, guests },
  });
  const roomTypes = data.map((object) => object.roomType); //have to get roomType,
  //TODO: We may need object.availableCount later.
  console.log(roomTypes);
  return roomTypes;
};

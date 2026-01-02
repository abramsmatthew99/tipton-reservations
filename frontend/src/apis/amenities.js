import axios from "axios";

const baseURL = "http://localhost:8080";

export const getAmenities = async () => {
  const { data } = await axios.get(
    `${baseURL}/amenities`
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
  );

  return data;
};
